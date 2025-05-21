import { Router } from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    getAllOrganizations,
    getOrganizationById,
    getJoinedOrganizations,
    getNotJoinedOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationCourses,
    getOrganizationMembers,
    requestToJoinOrganization,
    approveUserRequest,
    rejectUserRequest
} from '../controllers/org.controller.js';

const router = Router();

// Public Routes
router.get('/org', getAllOrganizations);
router.get('/org/my-orgs', verifyAccessToken, getJoinedOrganizations);
router.get('/org/not-my-orgs', verifyAccessToken, getNotJoinedOrganizations);
router.get('/org/:orgId', getOrganizationById);

// Protected Routes (Require Authentication)
router.use(verifyAccessToken);
// router.post('/org', authorizeRoles('super_admin'), createOrganization);
// router.put('/org/:orgId', authorizeRoles('admin', 'super_admin'), updateOrganization);
// router.delete('/org/:orgId', authorizeRoles('super_admin'), deleteOrganization);
router.get('/org/:orgId/courses', getOrganizationCourses);
router.get('/org/:orgId/members', authorizeRoles('admin', 'super_admin'), getOrganizationMembers);
router.post('/org/:orgId/join', requestToJoinOrganization);
// router.put('/org/:orgId/approve/:userId', authorizeRoles('admin'), approveUserRequest);
// router.put('/org/:orgId/reject/:userId', authorizeRoles('admin'), rejectUserRequest);

export default router;
