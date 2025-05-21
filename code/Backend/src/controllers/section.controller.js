import { Section, Course, Assignment, Video } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';

// Get section details by ID with video, assignment, and resources
export const getSectionById = asyncHandler(async (req, res) => {
    const section = await Section.findById(req.params.sectionId)
        .populate('course')
        .populate('assignment')
        .populate('video')
        .populate({
            path: 'comments.user',
            select: 'name username'
        })
        .populate({
            path: 'comments.replies.user',
            select: 'name username avatarIndex hasCustomAvatar'
        });
    
    if (!section) throw new ApiError(404, 'Section not found');
    
    res.status(200).json(new ApiResponse(200, section, 'Section details fetched successfully'));
});

// Create a new section
export const createSection = asyncHandler(async (req, res) => {
    const { name, description, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    const section = await Section.create({ 
        name, 
        description, 
        course: courseId,
        createdBy: req.user._id,
        updatedBy: req.user._id
    });
    course.sections.push(section._id);
    await course.save();
    res.status(201).json(new ApiResponse(201, section, 'Section created successfully'));
});

// Update section details
export const updateSection = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const section = await Section.findByIdAndUpdate(
        req.params.sectionId, 
        { 
            name, 
            description,
            updatedBy: req.user._id 
        }, 
        { new: true }
    );
    if (!section) throw new ApiError(404, 'Section not found');
    res.status(200).json(new ApiResponse(200, section, 'Section updated successfully'));
});

// Delete a section
export const deleteSection = asyncHandler(async (req, res) => {
    const section = await Section.findById(req.params.sectionId);
    if (!section) throw new ApiError(404, 'Section not found');
    const course = await Course.findById(section.course);
    course.sections = course.sections.filter(id => id.toString() !== req.params.sectionId);
    await course.save();
    await Video.deleteMany({ section: req.params.sectionId });
    await Assignment.deleteMany({ section: req.params.sectionId });
    res.status(200).json(new ApiResponse(200, null, 'Section deleted successfully'));
});

export const getSectionComments = asyncHandler(async (req, res) => {
    const section = await Section.findById(req.params.sectionId)
        .populate({
            path: 'comments.user',
            select: 'name username role avatarIndex hasCustomAvatar'
        })
        .populate({
            path: 'comments.replies.user',
            select: 'name username role avatarIndex hasCustomAvatar'
        });
    
    if (!section) throw new ApiError(404, 'Section not found');
    
    res.status(200).json(
        new ApiResponse(
            200, 
            section.comments, 
            'Section comments fetched successfully'
        )
    );
});

export const addSectionComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        throw new ApiError(400, 'Comment text is required');
    }
    
    const section = await Section.findById(req.params.sectionId);
    
    if (!section) {
        throw new ApiError(404, 'Section not found');
    }
    
    const comment = {
        user: req.user._id,
        text,
        likes: 0,
        likedBy: [],
        replies: [],
        createdAt: new Date()
    };
    
    section.comments.push(comment);
    await section.save();
    
    // Return the newly added comment with populated user including role
    const updatedSection = await Section.findById(req.params.sectionId)
        .populate({
            path: 'comments.user',
            select: 'name username role avatarIndex hasCustomAvatar' // Add avatar fields
        });
    
    const newComment = updatedSection.comments[updatedSection.comments.length - 1];
    
    res.status(201).json(
        new ApiResponse(
            201, 
            newComment, 
            'Comment added successfully'
        )
    );
});
// Add a reply to a comment
export const addCommentReply = asyncHandler(async (req, res) => {
    const { sectionId, commentId } = req.params;
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        throw new ApiError(400, 'Reply text is required');
    }
    
    const result = await Section.updateOne(
        { 
            _id: sectionId, 
            "comments._id": commentId  // Find the section with this comment ID
        },
        { 
            $push: { 
                "comments.$.replies": {  // The $ positional operator identifies the matched element
                    user: req.user._id,
                    text,
                    likes: 0,
                    likedBy: [],
                    createdAt: new Date()
                }
            }
        }
    );
    
    if (result.matchedCount === 0) {
        throw new ApiError(404, 'Section or comment not found');
    }
    
    if (result.modifiedCount === 0) {
        throw new ApiError(500, 'Failed to add reply');
    }
    
    // Fetch the updated document to return the new reply
    const updatedSection = await Section.findById(sectionId)
        .populate({
            path: 'comments.replies.user',
            select: 'name username role avatarIndex hasCustomAvatar'
        });
    
    const updatedComment = updatedSection.comments.find(c => c._id.toString() === commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];
    
    res.status(201).json(
        new ApiResponse(
            201, 
            newReply, 
            'Reply added successfully'
        )
    );
});
// Like a reply
export const likeReply = asyncHandler(async (req, res) => {
    const { sectionId, commentId, replyId } = req.params;
    
    const section = await Section.findById(sectionId);
    
    if (!section) {
        throw new ApiError(404, 'Section not found');
    }
    
    const comment = section.comments.id(commentId);
    
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }
    
    const reply = comment.replies.id(replyId);
    
    if (!reply) {
        throw new ApiError(404, 'Reply not found');
    }
    
    // Check if user already liked this reply
    const alreadyLiked = reply.likedBy.includes(req.user._id);
    
    if (alreadyLiked) {
        // Unlike if already liked
        reply.likes--;
        reply.likedBy = reply.likedBy.filter(
            userId => userId.toString() !== req.user._id.toString()
        );
    } else {
        // Like if not already liked
        reply.likes++;
        reply.likedBy.push(req.user._id);
    }
    
    await section.save();
    
    res.status(200).json(
        new ApiResponse(
            200, 
            { likes: reply.likes, liked: !alreadyLiked }, 
            alreadyLiked ? 'Reply unliked successfully' : 'Reply liked successfully'
        )
    );
});
export const likeComment = asyncHandler(async (req, res) => {
    const section = await Section.findById(req.params.sectionId);
    
    if (!section) {
        throw new ApiError(404, 'Section not found');
    }
    
    const commentId = req.params.commentId;
    const comment = section.comments.id(commentId);
    
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }
    
    // Check if user already liked this comment
    const alreadyLiked = comment.likedBy.includes(req.user._id);
    
    if (alreadyLiked) {
        // Unlike if already liked
        comment.likes--;
        comment.likedBy = comment.likedBy.filter(
            userId => userId.toString() !== req.user._id.toString()
        );
    } else {
        // Like if not already liked
        comment.likes++;
        comment.likedBy.push(req.user._id);
    }
    
    await section.save();
    
    res.status(200).json(
        new ApiResponse(
            200, 
            { likes: comment.likes, liked: !alreadyLiked }, 
            alreadyLiked ? 'Comment unliked successfully' : 'Comment liked successfully'
        )
    );
});

// Add a resource to a section
export const addResource = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    
    // Debug what's coming in
    // console.log("Request body:", req.body);
    
    const name = req.body.name;
    const link = req.body.link;
    
    if (!name || !link) {
        throw new ApiError(400, `Name and link are required. Received: name=${name}, link=${link}`);
    }
    
    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Section not found");
    }
    
    // Add the resource to the resources array
    const resource = { name, link };
    section.resources.push(resource);
    await section.save();
    
    res.status(201).json(new ApiResponse(201, resource, "Resource added successfully"));
});

// Add PDF resource to a section
export const addPdfResource = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const name = req.body.name;
    
    if (!name) {
        throw new ApiError(400, "Resource name is required");
    }
    
    // Check if a file was uploaded
    if (!req.file) {
        throw new ApiError(400, "PDF file is required");
    }
    
    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Section not found");
    }
    
    // Upload to Cloudinary
    console.log("path of file is",req.file.path);
    
    // Fetch course with organization populated
    const course = await Course.findById(section.course).populate('organization');
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    const folderPath = `organizations/${course.organization._id}/courses/${course._id}/sections/${sectionId}/resources`;
    const uploadedFile = await uploadOnCloudinary(req.file.path, folderPath);
    if (!uploadedFile) {
        throw new ApiError(500, "File upload failed");
    }
    
    // Add the resource to the resources array
    const resource = { 
        name, 
        link: uploadedFile.url 
    };
    
    section.resources.push(resource);
    await section.save();
    
    res.status(201).json(new ApiResponse(201, resource, "PDF uploaded successfully"));
});

// Delete content from a section
export const deleteContent = asyncHandler(async (req, res) => {
    // console.log("hello everyone");
    const { sectionId } = req.params;
    const { contentId, contentType } = req.body;
    console.log('content is',contentId, contentType);
    if (!contentId || !contentType) {
        throw new ApiError(400, "Content ID and type are required");
    }

    const section = await Section.findById(sectionId);
    if (!section) {
        throw new ApiError(404, "Section not found");
    }
    // console.log('content is',contentId, contentType);
    switch (contentType) {
        case 'video':
            // Remove video from section's videos array
            section.videos = section.videos.filter(video => video.toString() !== contentId);
            // Delete the video document
            await Video.findByIdAndDelete(contentId);
            break;
        case 'resource':
            // Remove resource from section's resources array
            section.resources = section.resources.filter(resource => resource._id.toString() !== contentId);
            break;
        case 'assignment':
            // Remove assignment from section's assignments array
            section.assignments = section.assignments.filter(assignment => assignment.toString() !== contentId);
            // Delete the assignment document
            await Assignment.findByIdAndDelete(contentId);
            break;
        default:
            throw new ApiError(400, "Invalid content type");
    }

    await section.save();
    res.status(200).json(new ApiResponse(200, null, "Content deleted successfully"));
});
