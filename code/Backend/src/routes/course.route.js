import { Router } from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseSections,
    getCourseStudents,
    requestToJoinCourse,
    acceptRequest,
    approveEnrollment,
    rejectEnrollment,
    getMyEnrolledCourses,
    getNotMyEnrolledCourses,
    getNotMyEnrolledCoursesByOrgId
} from '../controllers/course.controller.js';

const router = Router();

// Public Routes
router.get('/course/:courseId', getCourseById);

// Protected Routes (Require Authentication)
router.use(verifyAccessToken);
router.post('/org/:orgId/course', authorizeRoles('admin', 'super_admin'), createCourse);
router.put('/course/:courseId', authorizeRoles('admin', 'teacher', 'super_admin'), updateCourse);
router.delete('/course/:courseId', authorizeRoles('admin', 'super_admin'), deleteCourse);
router.get('/course/:courseId/sections', getCourseSections);
router.get('/course/:courseId/students', getCourseStudents);
router.post('/course/:courseId/join', requestToJoinCourse);
router.post('/course/:courseId/accept',acceptRequest);
router.put('/course/:courseId/approve/:userId', authorizeRoles('admin', 'teacher', 'super_admin'), approveEnrollment);
router.put('/course/:courseId/reject/:userId', authorizeRoles('admin', 'teacher', 'super_admin'), rejectEnrollment);

router.get('/my-courses', getMyEnrolledCourses);
router.get('/not-my-courses', getNotMyEnrolledCourses);
router.get('/not-my-courses/:orgId', getNotMyEnrolledCoursesByOrgId);

export default router;
