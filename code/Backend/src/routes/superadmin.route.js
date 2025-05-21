import { Router } from "express";
import {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  deleteOrganization,
  getSuperAdminDashboard,
  fetchAdmins
} from "../controllers/superadmin.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { isSuperAdmin } from "../middlewares/role.middleware.js";
import { imageUpload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply JWT verification and super admin check to all routes
router.use(verifyAccessToken, isSuperAdmin);

// Organization management
router.post("/organization", imageUpload.single("logo"), createOrganization);
router.get("/organizations", getAllOrganizations);
router.patch("/organization/:organizationId", updateOrganization);
router.delete("/organization/:organizationId", deleteOrganization);
router.get("/organization/:organizationId/admins",fetchAdmins);
// Dashboard
router.get("/dashboard", getSuperAdminDashboard);

export default router;
