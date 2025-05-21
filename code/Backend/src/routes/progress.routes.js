import { Router } from 'express';
import {
    initializeProgress,
    markVideoComplete,
    markAssignmentComplete,
    markResourceComplete,
    markSectionComplete,
    getCourseProgress
} from '../controllers/progress.controller.js';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyAccessToken);

// Initialize progress for a course
router.post('/initialize/:courseId', initializeProgress);

// Mark items as complete
router.post('/video/:courseId/:sectionId/:videoId/complete', markVideoComplete);
router.post('/assignment/:courseId/:sectionId/:assignmentId/complete', markAssignmentComplete);
router.post('/resource/:courseId/:sectionId/complete', markResourceComplete);
router.post('/section/:courseId/:sectionId/complete', markSectionComplete);

// Get progress
router.get('/course/:courseId', getCourseProgress);

// Test endpoint - no authentication required
router.get('/test/:courseId', (req, res) => {
    const { courseId } = req.params;
    
    // Mock progress data
    const mockProgress = {
        _id: "mock-progress-id",
        student: "mock-student-id",
        course: courseId,
        sectionsCompleted: ["section1", "section2"],
        assignmentsSubmitted: ["assignment1", "assignment2", "assignment3"],
        videosWatched: ["video1", "video2", "video3", "video4"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
        statusCode: 200,
        data: {
            progress: mockProgress,
            progressPercentage: 50,
            completedSections: 2,
            totalSections: 4,
            note: "This is mock data for testing purposes. For actual progress data, use the authenticated endpoint."
        },
        message: "Mock progress data retrieved successfully"
    });
});

export default router; 