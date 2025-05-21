import { Router } from 'express';
import {
    register,
    login,
    logout,
    refreshTokens,
    updatePassword,
    getMyProfile,
    updateProfile,
    getRole,
    getUserRole,
    getUserProfile,
} from '../controllers/auth.controller.js';
import {
    verifyEmail,
    resendEmailVerification,
    submitPhoneNumber,
    verifyPhone,
    resendPhoneOTP
} from '../controllers/verification.controller.js';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { recaptchaMiddleware } from '../middlewares/recaptcha.middleware.js';
import passport from '../config/passport.js';

const router = Router();

// Public routes with reCAPTCHA protection
router.post(
    "/register", 
    recaptchaMiddleware('register'), 
    register
);

router.post(
    "/login", 
    recaptchaMiddleware('login'), 
    login
);

// Google OAuth routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { 
        failureRedirect: `${process.env.FRONTEND_URL}/auth?error=google_auth_failed`,
        session: false 
    }),
    (req, res) => {
        // Redirect to frontend with tokens
        res.redirect(
            `${process.env.FRONTEND_URL}/auth?accessToken=${req.user.accessToken}&refreshToken=${req.user.refreshToken}`
        );
    }
);

// Public routes for verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-email-verification", recaptchaMiddleware('resend_email'), resendEmailVerification);
router.post("/submit-phone", recaptchaMiddleware('submit_phone'), submitPhoneNumber);
router.post("/verify-phone", verifyPhone);
router.post("/resend-phone-otp", recaptchaMiddleware('resend_otp'), resendPhoneOTP);


// Protected routes - require authentication
router.use(verifyAccessToken);
router.post("/logout", logout);
router.post("/refresh-tokens", refreshTokens);
router.put("/update-password", updatePassword);
router.get("/me", getMyProfile);
router.put("/me", updateProfile); 
router.get("/role", getRole);
router.get("/user/:id", getUserProfile);
router.get("/user/:id/role", getUserRole);

export default router;