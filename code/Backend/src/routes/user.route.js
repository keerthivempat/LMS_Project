import { Router } from "express";
import { 
    getUserProfile,
    updateProfile,
    changePassword,
    deleteAccount
} from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyAccessToken); // Protect all routes

router.get("/profile", getUserProfile);
router.patch("/profile", updateProfile);
router.post("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);

export default router; 