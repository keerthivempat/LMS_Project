import { Router } from "express";
import {
  addTeacher,
  removeTeacher,
  removeStudent,
  assignCourseToTeacher,
  getPendingCourses,
  updateCourseStatus,
  createAdmin,
  getOrganizationDetails,
  updateOrganizationDetails,
  getOrganizationStudents,
  updateEnrollmentStatus,
  getStudentEnrollmentRequests,
  getAdminsByOrganization,
  removeAdmin,
  updateAdminStatus,
  getAdminDashboard,
  getOrganizationTeachers,
  inviteStudentsToCourse,
  getCourseTeachers,
  removeCourseTeacher,
  removeCourseStudent,
  bulkUploadTeachers,
  inviteStudentToOrganization,
  inviteStudentsFromFile,
  uploadStudents,
  removeStudentFromOrganization,
  getTeacherActivity,
} from "../controllers/admin.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { isAdminForOrg } from "../middlewares/role.middleware.js";
import { isAdmin, isSuperAdmin,isTeacher } from "../middlewares/role.middleware.js";
import { imageUpload } from "../middlewares/multer.middleware.js";
const router = Router();

// Apply JWT verification to all routes
router.use(verifyAccessToken);

// Super admin routes
router.post("/create", isSuperAdmin, createAdmin);
router.get("/organization/:organizationId", isSuperAdmin, getAdminsByOrganization);
router.delete("/:adminId", isSuperAdmin, removeAdmin);
router.patch("/:adminId/status", isSuperAdmin, updateAdminStatus);

// Admin routes
router.get('/teacher', isAdmin, getCourseTeachers);
router.get("/dashboard/:organizationId", isAdmin, getAdminDashboard);
router.get("/teacher-activity/:organizationId", isAdmin, getTeacherActivity);
router.get("/teachers/:organizationId", isAdmin, getOrganizationTeachers);
router.post("/teacher", isAdmin, addTeacher);
router.post("/bulk-upload-teachers", isAdmin, bulkUploadTeachers);
router.delete("/teacher/:currentTeacherId/organization/:organizationId", isAdmin, removeTeacher);
router.delete("/teacher/:orgId/members/:studentId", isAdmin, removeStudent);
router.post("/assign-course", isAdmin, assignCourseToTeacher);
router.get("/pending-courses/:organizationId", isAdmin, getPendingCourses);
router.patch("/course/:courseId/status", isAdmin, updateCourseStatus);
router.patch("/organization/:organizationId", isAdmin, isAdminForOrg,imageUpload.single("logo"), updateOrganizationDetails);
router.get("/organization/:organizationId/details", isAdmin, isAdminForOrg, getOrganizationDetails);
router.get("/students/:organizationId", isAdmin, isAdminForOrg, getOrganizationStudents);
router.get("/enrollment-requests/:organizationId", isAdmin, isAdminForOrg, getStudentEnrollmentRequests);
router.patch("/enrollment-request/:requestId/status", isAdmin, updateEnrollmentStatus);
router.post("/invite-students-to-course", isAdmin, isAdminForOrg, inviteStudentsToCourse);
router.delete("/course/:courseId/teacher/:teacherId", isAdmin, removeCourseTeacher);
router.delete("/course/:courseId/student/:studentId", isAdmin, removeCourseStudent);

// New routes for inviting students to organization
router.post("/invite-student", isAdmin, inviteStudentToOrganization);
router.post("/invite-students-file", isAdmin, uploadStudents.single('file'), inviteStudentsFromFile);

// Add this route with the other organization routes
router.delete("/organization/:organizationId/student/:studentId", isAdmin, removeStudentFromOrganization);

// Add the route for getting organization details
router.get("/organization/:organizationId", isAdmin, getOrganizationDetails);

export default router;
