import { Assignment, Section, Course,StudentProgress } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/Cloudinary.js';
import { Submission } from '../models/schema.model.js';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';

// Get assignment details by ID
export const getAssignmentById = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('section');
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    res.status(200).json(new ApiResponse(200, assignment, 'Assignment details fetched successfully'));
});

// Create a new assignment
export const createAssignment = asyncHandler(async (req, res) => {
    const { title, description, dueDate, sectionId } = req.body;

    if (!title || !dueDate || !sectionId) {
        throw new ApiError(400, "Title, due date and section ID are required");
    }

    // Check if section exists and populate course and organization
    const section = await Section.findById(sectionId)
        .populate({
            path: 'course',
            populate: {
                path: 'organization'
            }
        });

    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    // Verify if user is a teacher of the course
    if (!section.course.teachers.includes(req.user._id)) {
        throw new ApiError(403, "Only course teachers can create assignments");
    }

    // First create the assignment to get the ID
    const assignment = await Assignment.create({
        title,
        description,
        section: sectionId,
        dueDate: new Date(dueDate),
        assignmentFiles: [], // Initialize empty array
        submissions: {}, // Initialize empty submissions object
        createdBy: req.user._id // Add the teacher ID who created the assignment
    });

    // Now handle file uploads with the assignment ID
    let assignmentFiles = [];
    if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const folderPath = `organizations/${section.course.organization._id}/courses/${section.course._id}/sections/${sectionId}/assignments/${assignment._id}/assignment_files`;
            const uploadedFile = await uploadOnCloudinary(file.path, folderPath);
            if (uploadedFile) {
                assignmentFiles.push(uploadedFile.url);
            }
        }

        // Update the assignment with the file URLs
        assignment.assignmentLinks = assignmentFiles;
        await assignment.save();
    }

    // Add assignment to section's assignments array
    await Section.findByIdAndUpdate(
        sectionId,
        { 
            $push: { assignments: assignment._id },
            updatedBy: req.user._id // Also update the section's updatedBy field
        }
    );

    res.status(201).json(
        new ApiResponse(201, assignment, "Assignment created successfully")
    );
});

// Update assignment details
export const updateAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    const { title, description, dueDate, assignmentLinks } = req.body;

    const assignment = await Assignment.findById(assignmentId)
        .populate({
            path: 'section',
            populate: {
                path: 'course',
                select: 'teachers'
            }
        });

    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // Verify if user is a teacher of the course
    if (!assignment.section.course.teachers.includes(req.user._id)) {
        throw new ApiError(403, "Only course teachers can update assignments");
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        {
            $set: {
                title: title || assignment.title,
                description: description || assignment.description,
                dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
                assignmentLinks: assignmentLinks || assignment.assignmentLinks
            }
        },
        { new: true }
    );

    res.status(200).json(
        new ApiResponse(200, updatedAssignment, "Assignment updated successfully")
    );
});

// Delete an assignment
export const deleteAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
        .populate({
            path: 'section',
            populate: {
                path: 'course',
                select: 'teachers'
            }
        });

    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // Verify if user is a teacher of the course
    if (!assignment.section.course.teachers.includes(req.user._id)) {
        throw new ApiError(403, "Only course teachers can delete assignments");
    }

    // Remove assignment from section's assignments array
    await Section.findByIdAndUpdate(
        assignment.section._id,
        { $pull: { assignments: assignmentId } }
    );

    // Delete the assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.status(200).json(
        new ApiResponse(200, {}, "Assignment deleted successfully")
    );
});

// Add this utility function at the top of the file
const validateFile = async (file) => {
    // List of allowed MIME types
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.text',
        'text/plain'
    ];

    // List of allowed extensions
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.odt', '.txt'];

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        throw new ApiError(400, 'File type not allowed');
    }

    // Read the file buffer for MIME type validation
    try {
        const buffer = file.buffer || await fs.promises.readFile(file.path);
        const fileType = await fileTypeFromBuffer(buffer);

        // If file type couldn't be determined or isn't in allowed list
        if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
            throw new ApiError(400, 'Invalid file type');
        }

        // Check for potential malicious content
        const isSafe = await validateFileContent(buffer, ext);
        if (!isSafe) {
            throw new ApiError(400, 'File appears to be malicious');
        }

    } catch (error) {
        throw new ApiError(400, 'File validation failed: ' + error.message);
    }
};

// Add this function to check file content
const validateFileContent = async (buffer, extension) => {
    // Check file signatures/magic numbers
    const signatures = {
        '.pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
        '.doc': [0xD0, 0xCF, 0x11, 0xE0], // DOC/XLS
        '.docx': [0x50, 0x4B, 0x03, 0x04] // DOCX/XLSX (ZIP format)
    };

    if (signatures[extension]) {
        const fileSignature = Array.from(buffer.slice(0, 4));
        if (!signatures[extension].every((byte, i) => fileSignature[i] === byte)) {
            return false;
        }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        /<script/i,
        /<%.*%>/i,
        /eval\(/i,
        /execCommand/i,
        /system\(/i,
        /shell_exec/i,
        /passthru/i
    ];

    const content = buffer.toString('utf8');
    return !suspiciousPatterns.some(pattern => pattern.test(content));
};

// Modify the submitAssignment function
export const submitAssignment = asyncHandler(async (req, res) => {
    // Fetch assignment with populated section and course
    const assignment = await Assignment.findById(req.params.assignmentId)
        .populate({
            path: 'section',
            populate: {
                path: 'course',
                populate: 'organization'
            }
        });

    if (!assignment) throw new ApiError(404, 'Assignment not found');
    
    // Check if a file was uploaded
    if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
    }
    // console.log("File details:", {
    //     originalname: req.file.originalname,
    //     mimetype: req.file.mimetype,
    //     size: req.file.size,
    //     path: req.file.path
    // });

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (req.file.size > maxSize) {
        throw new ApiError(400, 'File size exceeds 10MB limit');
    }

    // Validate file type and content
    await validateFile(req.file);
    
    // Now we can directly use the populated data
    const folderPath = `organizations/${assignment.section.course.organization._id}/courses/${assignment.section.course._id}/sections/${assignment.section._id}/assignments/${req.params.assignmentId}/submissions`;
    const uploadedFile = await uploadOnCloudinary(req.file.path, folderPath);
    if (!uploadedFile) {
        throw new ApiError(500, 'File upload to cloud storage failed');
    }
    
    const submission = new Submission({
        student: req.user._id,
        assignment: req.params.assignmentId,
        files: [uploadedFile.url],
        submittedAt: new Date()
    });
    
    await submission.save();
    
    // Update the assignment's submissions field using $set instead of push
    const assignment1 = await Assignment.findById(req.params.assignmentId);
    assignment1.submissions.push({student:req.user._id,files: [uploadedFile.url],submittedAt: new Date()});

    await assignment1.save();
    const studentProgress = await StudentProgress.findOneAndUpdate(
        { student: req.user._id, course: assignment.section.course._id },
        { $addToSet: { assignmentsSubmitted: req.params.assignmentId } }, // Prevent duplicates
        { new: true, upsert: true } // Create a new document if it doesn't exist
    );

    // console.log("Updated Student Progress:", studentProgress);

    res.status(201).json(new ApiResponse(201, submission, 'Assignment submitted successfully'));
});

// Get all submissions for an assignment with detailed information
export const getSubmissions = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        throw new ApiError(404, "Assignment not found");
    }

    // Fetch all submissions with populated fields
    const submissions = await Submission.find({ assignment: assignmentId })
        .populate('student', 'name email avatarIndex hasCustomAvatar') // Include both avatar fields
        .populate({
            path: 'review.reviewedBy',
            select: 'name email avatarIndex hasCustomAvatar',
            options: { strictPopulate: false } // Handle cases where review is empty
        })
        .populate({
            path: 'assignment',
            select: 'title description dueDate' // Assignment details
        })
        .select({
            files: 1,
            submittedAt: 1,
            status: 1,
            review: 1,
            createdAt: 1,
            updatedAt: 1
        })
        .sort({ submittedAt: -1 }); // Sort by submission date, newest first

    // Ensure review field is handled properly
    const processedSubmissions = submissions.map(submission => {
        const submissionObj = submission.toObject();
        
        // Make sure student exists and has required fields
        if (!submissionObj.student) {
          submissionObj.student = { name: 'Unknown Student', email: 'no-email' };
        }
        
        // Ensure review is properly formatted
        if (submissionObj.review && !submissionObj.review.reviewedBy) {
          submissionObj.review.reviewedBy = { name: 'Unknown Reviewer', email: 'no-email' };
        }
        
        return submissionObj;
      });
      
      // Calculate statistics
      const reviewedSubmissions = processedSubmissions.filter(sub => sub.status === 'reviewed');
      const submissionsWithGrades = processedSubmissions.filter(sub => sub.review?.grade !== undefined);
      
      const stats = {
        totalSubmissions: processedSubmissions.length,
        reviewedCount: reviewedSubmissions.length,
        pendingCount: processedSubmissions.length - reviewedSubmissions.length,
        averageGrade: submissionsWithGrades.length > 0 
          ? submissionsWithGrades.reduce((acc, sub) => acc + sub.review.grade, 0) / submissionsWithGrades.length 
          : 0
      };
      
      res.status(200).json(new ApiResponse(200, {
        submissions: processedSubmissions,
        stats,
        assignmentDetails: {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate
        }
      }, 'Submissions fetched successfully'));
    });

// Get a user's submission for a specific assignment
export const getUserSubmission = asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) throw new ApiError(404, 'Assignment not found');
    
    // Find the submission for this user and assignment
    const submission = await Submission.findOne({
        student: req.user._id,
        assignment: req.params.assignmentId
    });
    
    if (!submission) {
        return res.status(200).json(new ApiResponse(200, null, 'No submission found'));
    }
    
    res.status(200).json(new ApiResponse(200, submission, 'Submission fetched successfully'));
});

export const reviewSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { comment, grade } = req.body;
        // console.log('Reviewing submission:', req.body);
        // Validate grade if provided
        if (grade !== undefined && (grade < 0 || grade > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Grade must be between 0 and 100'
            });
        }
        const submission = await Submission.findOne({
            _id: submissionId,
            assignment: assignmentId
        });
        // console.log('submission:', submission);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Update the submission with review
        // submission.grade = grade;
        // submission.comment = comment;
        submission.review = {
            comment,
            grade,
            reviewedBy: req.user._id,
            reviewedAt: new Date()
        };
        submission.status = 'reviewed';

        await submission.save();
        // console.log("after review ",submission);
        res.status(200).json({
            success: true,
            message: 'Submission reviewed successfully',
            data: submission
        });
    } catch (error) {
        console.error('Error reviewing submission:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
