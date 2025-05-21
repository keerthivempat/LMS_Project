import { StudentProgress, Course } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Initialize progress for a student in a course
const initializeProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Check if progress already exists
    const existingProgress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    if (existingProgress) {
        return res.status(200).json(
            new ApiResponse(200, existingProgress, "Progress already initialized")
        );
    }

    // Get course details to initialize section progress
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Create new progress
    const progress = await StudentProgress.create({
        student: studentId,
        course: courseId,
        sectionsCompleted: [],
        assignmentsSubmitted: [],
        videosWatched: []
    });

    return res.status(201).json(
        new ApiResponse(201, progress, "Progress initialized successfully")
    );
});

// Mark a video as completed
const markVideoComplete = asyncHandler(async (req, res) => {
    const { courseId, sectionId, videoId } = req.params;
    const studentId = req.user._id;

    const progress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    if (!progress) {
        throw new ApiError(404, "Progress not found");
    }

    // Add video to videosWatched if not already there
    if (!progress.videosWatched.includes(videoId)) {
        progress.videosWatched.push(videoId);
    }

    // Check if all videos in the section are watched
    const course = await Course.findById(courseId).populate('sections');
    const section = course.sections.find(s => s._id.toString() === sectionId);
    
    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    const sectionVideos = section.videos.map(v => v._id.toString());
    const allVideosWatched = sectionVideos.every(videoId => 
        progress.videosWatched.some(watchedId => watchedId.toString() === videoId)
    );

    // If all videos are watched and section is not in sectionsCompleted, add it
    if (allVideosWatched && !progress.sectionsCompleted.includes(sectionId)) {
        progress.sectionsCompleted.push(sectionId);
    }

    await progress.save();

    return res.status(200).json(
        new ApiResponse(200, progress, "Video marked as completed")
    );
});

// Mark an assignment as completed
const markAssignmentComplete = asyncHandler(async (req, res) => {
    const { courseId, sectionId, assignmentId } = req.params;
    const studentId = req.user._id;

    const progress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    if (!progress) {
        throw new ApiError(404, "Progress not found");
    }

    // Add assignment to assignmentsSubmitted if not already there
    if (!progress.assignmentsSubmitted.includes(assignmentId)) {
        progress.assignmentsSubmitted.push(assignmentId);
    }

    // Check if all assignments in the section are submitted
    const course = await Course.findById(courseId).populate('sections');
    const section = course.sections.find(s => s._id.toString() === sectionId);
    
    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    const sectionAssignments = section.assignments.map(a => a._id.toString());
    const allAssignmentsSubmitted = sectionAssignments.every(assignmentId => 
        progress.assignmentsSubmitted.some(submittedId => submittedId.toString() === assignmentId)
    );

    // If all assignments are submitted and section is not in sectionsCompleted, add it
    if (allAssignmentsSubmitted && !progress.sectionsCompleted.includes(sectionId)) {
        progress.sectionsCompleted.push(sectionId);
    }

    await progress.save();

    return res.status(200).json(
        new ApiResponse(200, progress, "Assignment marked as completed")
    );
});

// Mark a resource as completed
const markResourceComplete = asyncHandler(async (req, res) => {
    const { courseId, sectionId } = req.params;
    const studentId = req.user._id;

    const progress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    if (!progress) {
        throw new ApiError(404, "Progress not found");
    }

    // For resources, we'll just mark the section as completed if requested
    // since resources don't have a specific ID in the schema
    if (!progress.sectionsCompleted.includes(sectionId)) {
        progress.sectionsCompleted.push(sectionId);
        await progress.save();
    }

    return res.status(200).json(
        new ApiResponse(200, progress, "Resource marked as completed")
    );
});

// Mark a section as completed
const markSectionComplete = asyncHandler(async (req, res) => {
    const { courseId, sectionId } = req.params;
    const studentId = req.user._id;

    // console.log(`Marking section ${sectionId} as complete for student ${studentId} in course ${courseId}`);

    const progress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    if (!progress) {
        throw new ApiError(404, "Progress not found");
    }

    // Check if all assignments are submitted
    const course = await Course.findById(courseId).populate('sections');
    const section = course.sections.find(s => s._id.toString() === sectionId);
    
    if (!section) {
        throw new ApiError(404, "Section not found");
    }

    // Check if there are any assignments in the section
    const totalAssignments = section.assignments.length;
    
    // Only check for completed assignments if there are assignments in the section
    if (totalAssignments > 0) {
        const sectionAssignments = section.assignments.map(a => a._id.toString());
        const completedAssignments = progress.assignmentsSubmitted.filter(id => 
            sectionAssignments.includes(id.toString())
        ).length;

        if (completedAssignments < totalAssignments) {
            // Instead of just logging a warning, throw an error to prevent marking as complete
            throw new ApiError(400, `All assignments must be completed before marking the section as complete. Completed: ${completedAssignments}/${totalAssignments}`);
        }
    }

    // Add section to sectionsCompleted if not already there
    if (!progress.sectionsCompleted.includes(sectionId)) {
        progress.sectionsCompleted.push(sectionId);
    }
    
    // Calculate overall progress
    const totalSections = course.sections.length;
    const completedSections = progress.sectionsCompleted.length;
    const progressPercentage = (completedSections / totalSections) * 100;

    await progress.save();

    // console.log(`Section ${sectionId} marked as complete. Progress: ${progressPercentage}%`);

    return res.status(200).json(
        new ApiResponse(200, {
            progress,
            progressPercentage,
            completedSections,
            totalSections
        }, "Section marked as completed")
    );
});

// Get course progress with percentage
const getCourseProgress = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // console.log('Getting progress for student:', studentId, 'course:', courseId);

    let progress = await StudentProgress.findOne({
        student: studentId,
        course: courseId
    });

    // console.log('Found progress:', progress);

    if (!progress) {
        // console.log('No progress found, initializing...');
        const course = await Course.findById(courseId);
        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        progress = await StudentProgress.create({
            student: studentId,
            course: courseId,
            sectionsCompleted: [],
            assignmentsSubmitted: [],
            videosWatched: []
        });
        // console.log('Created new progress:', progress);
    }

    // Get course details with sections
    const course = await Course.findById(courseId).populate('sections');
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Calculate progress
    const totalSections = course.sections.length;
    const completedSections = progress.sectionsCompleted.length;
    const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    // console.log('Progress calculation:', {
    //     totalSections,
    //     completedSections,
    //     progressPercentage,
    //     videosWatched: progress.videosWatched.length,
    //     assignmentsSubmitted: progress.assignmentsSubmitted.length
    // });

    const response = {
        progress,
        progressPercentage,
        completedSections,
        totalSections
    };

    // console.log('Sending response:', response);

    return res.status(200).json(
        new ApiResponse(200, response, "Progress retrieved successfully")
    );
});

export {
    initializeProgress,
    markVideoComplete,
    markAssignmentComplete,
    markResourceComplete,
    markSectionComplete,
    getCourseProgress
}; 
