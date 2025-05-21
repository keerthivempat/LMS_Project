import { Router } from "express";
import { 
    getTeacherOrganizations, 
    getTeacherOrganizationCourses, 
    getTeacherCourses,
    getCourseStudents,
    getPendingStudents,
    joinCourse,
    inviteStudentsToCourse,
    getOrganizationStudents,
    getStudentCourseEnrollmentRequests,
    updateRequestStatus,
    inviteStudentsFromFile,
    upload,
} from "../controllers/teacher.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { isTeacher } from "../middlewares/role.middleware.js";

const router = Router();

// Apply JWT verification to all routes
router.use(verifyAccessToken);
router.use(isTeacher);

// Teacher routes
router.get("/organizations", getTeacherOrganizations);
router.get("/organization-courses", getTeacherOrganizationCourses);
router.get("/courses", getTeacherCourses);
router.post("/courses/:courseId/join", joinCourse);
router.get("/enrollment-requests/:courseId",getStudentCourseEnrollmentRequests);
router.put("/enrollment-requests/:requestId",updateRequestStatus);
// Route to invite students to a course
router.post('/invite-students', inviteStudentsToCourse);

// Route to get students from an organization
router.get('/organization-students/:organizationId', getOrganizationStudents);
// CSV upload route for course invitations
router.post('/invite-students-file', upload.single('file'), inviteStudentsFromFile);
export default router;
