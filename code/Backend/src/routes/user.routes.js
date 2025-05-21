import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.middleware.js';
import { 
  getUserProfile, 
  updateProfile, 
  changePassword, 
  deleteAccount, 
  updateAvatar,
  getUserAssignments,
  initiatePasswordChange,
  verifyOTPAndChangePassword,
  resendPasswordChangeOTP
} from '../controllers/user.controller.js';

const router = express.Router();

// Get user profile
router.get("/profile", verifyAccessToken, getUserProfile);

// Get all assignments for user
router.get("/assignments", verifyAccessToken, getUserAssignments);

// Update user profile
router.patch("/profile", verifyAccessToken, updateProfile);

// Change password
router.post("/change-password", verifyAccessToken, changePassword);

// Delete account
router.delete("/delete-account", verifyAccessToken, deleteAccount);

// Update avatar
router.patch("/avatar", verifyAccessToken, updateAvatar);

// OTP-based password change routes
router.post("/initiate-password-change", verifyAccessToken, initiatePasswordChange);
router.post("/verify-otp-change-password", verifyAccessToken, verifyOTPAndChangePassword);
router.post("/resend-password-change-otp", verifyAccessToken, resendPasswordChangeOTP);

export default router;