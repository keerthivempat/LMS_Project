import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {User, Organization}  from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cookieOptions } from '../constants.js';
import { sendEmail } from '../utils/emailService.js';
import { sendSMS } from '../utils/smsService.js';
import crypto from 'node:crypto';
import { getRandomAvatarIndex } from "../constants/avatars.js";

// Send email verification
export const sendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    if (user.isEmailVerified) {
        return res.status(200).json(
            new ApiResponse(200, {}, "Email already verified")
        );
    }
    
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const emailContent = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
    `;
    
    try {
        await sendEmail({
            email: user.email,
            subject: "Email Verification",
            html: emailContent
        });
        
        res.status(200).json(
            new ApiResponse(200, {}, "Verification email sent successfully")
        );
    } catch (error) {
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        throw new ApiError(500, "Error sending verification email");
    }
});

// Verify email with token
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    await user.save();
    
    res.status(200).json(
        new ApiResponse(200, {}, "Email verified successfully")
    );
});

// Send phone verification OTP
export const sendPhoneVerification = asyncHandler(async (req, res) => {
    const { phone } = req.body;
    
    if (!phone) {
        throw new ApiError(400, "Phone number is required");
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
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
            new ApiResponse(200, {}, "OTP sent successfully")
        );
    } catch (error) {
        user.phoneOTP = undefined;
        user.phoneOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });
        
        throw new ApiError(500, "Error sending OTP");
    }
});

// Verify phone with OTP
export const verifyPhone = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    
    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }
    
    const user = await User.findOne({
        _id: req.user.id,
        phoneOTP: otp,
        phoneOTPExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        throw new ApiError(400, "OTP is invalid or has expired");
    }
    
    user.isPhoneVerified = true;
    user.phoneOTP = undefined;
    user.phoneOTPExpires = undefined;
    
    await user.save();
    
    res.status(200).json(
        new ApiResponse(200, {}, "Phone verified successfully")
    );
});

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // console.log(`accessToken: ${accessToken} and refreshToken: ${refreshToken}`);

        // save the refresh token in the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Access and Refresh Tokens Could not be generated!"
        );
    }
};
export const register = asyncHandler(async (req, res) => {
    const { name, username, email, password } = req.body;
    
    // Validate input
    if (!name || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    
    // By default, users will use initial-based avatars
    // We set hasCustomAvatar to false and avatarIndex to 0
    const user = await User.create({
        name,
        username,
        email,
        password,
        isActive: false,
        hasCustomAvatar: false,
        avatarIndex: 0
    });
    
    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // Create verification URL
    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    // Build email content
    const emailContent = `
        <h1>Email Verification</h1>
        <p>Hello ${name},</p>
        <p>Thank you for registering! Please click the link below to verify your email address:</p>
        <a href="${verificationURL}" target="_blank">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create this account, please ignore this email.</p>
    `;
    
    try {
        // Send verification email
        await sendEmail({
            email: user.email,
            subject: "Verify Your Email Address",
            html: emailContent
        });
        
        res.status(201).json(
            new ApiResponse(201, 
                { userId: user._id }, 
                "Registration successful! Please check your email to verify your account."
            )
        );
    } catch (error) {
        // If email sending fails, delete the user or handle appropriately
        await User.findByIdAndDelete(user._id);
        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }
});

// Modify login to check verification status
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
        throw new ApiError(403, "Email not verified. Please check your email for verification link.");
    }
    
    // Check if phone verification is required
    if (user.phone && !user.isPhoneVerified) {
        throw new ApiError(403, "Phone number not verified. Please verify your phone number.");
    }
    
    // Check if account is active
    if (!user.isActive) {
        throw new ApiError(403, "Account is not active. Please complete all verification steps.");
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    
    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    // Update user's refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // console.log("organization", user.organizations[0].toString());
    // Send response
    let organization = null;
    if (user.role === 'admin' && user.organizations.length > 0) {
        organization = await Organization.findById(user.organizations[0]).select('name slug description logo contactDetails about');
        // console.log("org is ",organization);
        if(organization)organization = organization._id.toString();
        // console.log("organization", organization);
    }
    res.status(200).json(
        new ApiResponse(200, {
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: organization,
                // organization: user.organizations[0].toString(),
            }
        }, "Login successful")
    );
});

// Logout User
export const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );
    res
        .status(200)
        .clearCookie("refreshToken")
        .clearCookie("accessToken")
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Refresh Tokens
export const refreshTokens = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    const decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedRefreshToken.id);
    if (!user) {
        throw new ApiError(401, "User not found");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is invalid");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed successfully"
            )
        );
});

// Get Current User Profile
export const getMyProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    // console.log(user);
    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// Get User Profile by ID
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken");
    if (!user) throw new ApiError(404, 'User not found');
    res.status(200).json(new ApiResponse(200, user, 'Other User profile fetched'));
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, username } = req.body;
    
    if (!name || !username) {
        throw new ApiError(400, "Name and username are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { 
                name, 
                username 
            }
        },
        { 
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            user, 
            "Profile updated successfully"
        ));
});

// Update Password
export const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "All fields are required");
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if(!(await user.comparePassword(currentPassword))) {
        throw new ApiError(400, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Get User Role
export const getRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("role");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "User role fetched successfully"));
});

// Get User Role by ID
export const getUserRole = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("role");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "User role fetched successfully"));
});

