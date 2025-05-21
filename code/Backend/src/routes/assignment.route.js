import { Router } from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { documentUpload } from "../middlewares/multer.middleware.js";

import {
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getSubmissions,
    getUserSubmission,
    reviewSubmission
} from '../controllers/assignment.controller.js';

const router = Router();


// Protected Routes (Require Authentication)
router.use(verifyAccessToken);
router.get('/assignment/:assignmentId', getAssignmentById);
router.post('/section/:sectionId/assignment', 
    authorizeRoles('teacher'), 
    documentUpload.array('files', 5), // Allow up to 5 files
    createAssignment
);
router.post('/assignment/:assignmentId/submit', authorizeRoles('student'), documentUpload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId/submissions', authorizeRoles('teacher'), getSubmissions);
router.get('/assignment/:assignmentId/my-submission', getUserSubmission);
router.put('/assignment/:assignmentId', authorizeRoles('teacher'), updateAssignment);
router.delete('/assignment/:assignmentId', authorizeRoles('teacher'), deleteAssignment);
router.post('/assignment/:assignmentId/submissions/:submissionId/review', 
    authorizeRoles('teacher'), 
    reviewSubmission
);

export default router;