import { Video, Section } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Course } from '../models/schema.model.js';

// Get video details by ID
export const getVideoById = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId).populate('section');
    if (!video) throw new ApiError(404, 'Video not found');
    res.status(200).json(new ApiResponse(200, video, 'Video details fetched successfully'));
});

// Add a new video
export const addVideo = asyncHandler(async (req, res) => {
    const { title, url, sectionId } = req.body;
    if (!title || !url || !sectionId) throw new ApiError(400, 'Title, URL and Section ID are required');

    const section = await Section.findById(sectionId);
    if (!section) throw new ApiError(404, 'Section not found');

    // check if the teacher is part of the course
    const course = await Course.findById(section.course);
    if (!course) throw new ApiError(404, 'Course not found');

    // check if the teacher is part of the course
    const isTeacher = course.teachers.includes(req.user._id);
    const isAdmin = req.user.role.includes('admin');
    if (!isTeacher && !isAdmin) throw new ApiError(403, 'Only assigned teachers can add videos');
    
    //  convert the url to embeding format
    const extractVideoId = (url) => {
        const match = url.match(/(?:v=|youtu\.be\/|embed\/|\/v\/|\/e\/|watch\?v=|&v=|shorts\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
    };
    
    const videoId = extractVideoId(url);
    if (!videoId) throw new ApiError(400, 'Invalid YouTube URL');

    // Convert to embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    const video = new Video({ 
        title, 
        url: embedUrl, 
        section: sectionId,
        uploadedBy: req.user._id  // Add teacher ID who uploaded the video
    });
    await video.save();
    
    // Add video to section's videos array
    await Section.findByIdAndUpdate(
        sectionId,
        { 
            $push: { videos: video._id },
            updatedBy: req.user._id  // Update section's updatedBy field
        }
    );
    
    res.status(201).json(new ApiResponse(201, video, 'Video added successfully'));
});

// Update video details
export const updateVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) throw new ApiError(404, 'Video not found');
    
    const section = await Section.findById(video.section);
    if (!section.course.teachers.includes(req.user._id) && !req.user.role.includes('admin')) {
        throw new ApiError(403, 'Only admins or assigned teachers can update this video');
    }
    
    Object.assign(video, req.body);
    await video.save();
    res.status(200).json(new ApiResponse(200, video, 'Video updated successfully'));
});

// Delete a video
export const deleteVideo = asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.videoId);
    if (!video) throw new ApiError(404, 'Video not found');
    
    const section = await Section.findById(video.section);
    if (!section.course.teachers.includes(req.user._id) && !req.user.role.includes('admin')) {
        throw new ApiError(403, 'Only admins or assigned teachers can delete this video');
    }
    
    await video.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Video deleted successfully'));
});

export const getVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
        .populate({
            path: 'section',
            select: 'name course',
            populate: {
                path: 'course',
                select: 'name teachers students'
            }
        })
        .populate({
            path: 'comments.user',
            select: 'name username'
        });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if user has access to the video (is either a teacher or enrolled student)
    const isTeacher = video.section.course.teachers.includes(req.user._id);
    const isStudent = video.section.course.students.includes(req.user._id);

    if (!isTeacher && !isStudent) {
        throw new ApiError(403, "You don't have access to this video");
    }

    res.status(200).json(
        new ApiResponse(200, video, "Video details fetched successfully")
    );
});