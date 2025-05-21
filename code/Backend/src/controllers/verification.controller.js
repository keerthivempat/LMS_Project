import {User}  from '../models/schema.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/emailService.js';
import { sendSMS } from '../utils/smsService.js';
import crypto from 'node:crypto';

// Verify email with token
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    console.log('Received verification token:', token);
    
    // First check if any user has this token
    const user = await User.findOne({
        emailVerificationToken: token
    });
    
    if (!user) {
        throw new ApiError(400, "Invalid verification link");
    }
    
    // Check if token is expired
    if (user.emailVerificationTokenExpires < Date.now()) {
        throw new ApiError(400, "Verification link has expired. Please request a new one.");
    }
    
    // Check if email is already verified
    if (user.isEmailVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Email already verified. You can proceed to login.")
        );
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    // If user has no phone to verify, mark as active
    if (!user.phone) {
        user.isActive = true;
    }
    
    await user.save();
    
    // If phone verification is needed, return phone verification step
    if (!user.isActive) {
        return res.status(200).json(
            new ApiResponse(200, { 
                userId: user._id,
                requiresPhoneVerification: true
            }, "Email verified successfully. Please verify your phone number.")
        );
    }
    
    // If no phone verification needed, account is now active
    res.status(200).json(
        new ApiResponse(200, { 
            userId: user._id,
            accountActive: true
        }, "Email verified successfully. You can now log in.")
    );
});

// Resend email verification
export const resendEmailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    if (user.isEmailVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Email already verified")
        );
    }
    
    // Generate new token
    const verificationToken = user.generateEmailVerificationToken();
    // console.log('Generated new verification token:', verificationToken);
    await user.save();
    
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    // console.log('Verification URL:', verificationURL);
    
    const emailContent = `
        <h1>Email Verification</h1>
        <p>Hello ${user.name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
    `;
    
    try {
        await sendEmail({
            email: user.email,
            subject: "Verify Your Email Address",
            html: emailContent
        });
        
        res.status(200).json(
            new ApiResponse(200, {}, "Verification email sent successfully")
        );
    } catch (error) {
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save();
        
        throw new ApiError(500, "Error sending verification email");
    }
});

// Submit phone number for verification
export const submitPhoneNumber = asyncHandler(async (req, res) => {
    const { userId, phone } = req.body;
    
    if (!userId || !phone) {
        throw new ApiError(400, "User ID and phone number are required");
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Ensure email is verified first
    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before verifying phone");
    }
    
    user.phone = phone;
    user.isPhoneVerified = false;
    
    const otp = user.generatePhoneOTP();
    await user.save();
    
    try {
        await sendSMS({
            to: phone,
            message: `Your verification code is: ${otp}. Valid for 10 minutes.`
        });
        
        res.status(200).json(
            new ApiResponse(200, { userId: user._id }, "OTP sent successfully")
        );
    } catch (error) {
        user.phoneOTP = undefined;
        user.phoneOTPExpires = undefined;
        await user.save();
        
        throw new ApiError(500, "Error sending OTP");
    }
});

// Verify phone with OTP
export const verifyPhone = asyncHandler(async (req, res) => {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
        throw new ApiError(400, "User ID and OTP are required");
    }
    
    const user = await User.findOne({
        _id: userId,
        phoneOTP: otp,
        phoneOTPExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }
    
    // Verify phone and activate account
    user.isPhoneVerified = true;
    user.isActive = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    
    await user.save();
    
    res.status(200).json(
        new ApiResponse(200, { accountActive: true }, "Phone verified successfully. You can now log in.")
    );
});

// Resend phone OTP
export const resendPhoneOTP = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    if (!user.phone) {
        throw new ApiError(400, "No phone number associated with this account");
    }
    
    const otp = user.generatePhoneOTP();
    await user.save();
    
    try {
        await sendSMS({
            to: user.phone,
            message: `Your verification code is: ${otp}. Valid for 10 minutes.`
        });
        
        res.status(200).json(
            new ApiResponse(200, {}, "OTP sent successfully")
        );
    } catch (error) {
        user.phoneOTP = undefined;
        user.phoneOTPExpires = undefined;
        await user.save();
        
        throw new ApiError(500, "Error sending OTP");
    }
});