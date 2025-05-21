import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/schema.model.js";
import { DEFAULT_AVATARS } from "../constants/avatars.js";
import { Submission } from "../models/schema.model.js";
import { generateOTP, isOTPExpired, canResendOTP } from '../utils/otpUtils.js';
import { sendEmail } from '../utils/emailService.js';

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires")
        .populate({
            path: "organizations",
            select: "name description logo"
        })
        .populate({
            path: "courses",
            select: "name description"
        });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    );
});

// Update user profile
export const updateProfile = asyncHandler(async (req, res) => {
    const {
        name,
        username,
        email
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // If email is being updated, check if it's already in use
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            throw new ApiError(400, "Email already in use");
        }
    }

    // If username is being updated, check if it's already in use
    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            throw new ApiError(400, "Username already in use");
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name: name || user.name,
                username: username || user.username,
                email: email || user.email
            }
        },
        { new: true }
    ).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpires");

    res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new password are required");
    }

    const user = await User.findById(req.user._id);

    // Using the comparePassword method from your schema
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Delete account
export const deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required to delete account");
    }

    const user = await User.findById(req.user._id);
    
    // Using the comparePassword method from your schema
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password");
    }

    await User.findByIdAndDelete(req.user._id);

    res.status(200).json(
        new ApiResponse(200, {}, "Account deleted successfully")
    );
});

// Update user avatar
export const updateAvatar = asyncHandler(async (req, res) => {
    const { avatarIndex, hasCustomAvatar } = req.body;
    
    // For custom avatar, validate the index is within array bounds
    if (hasCustomAvatar && (avatarIndex < 0 || avatarIndex >= 10)) {
        throw new ApiError(400, "Invalid avatar index (must be 0-9 for custom avatars)");
    }

    // Update with the appropriate values
    const updateData = {
        avatarIndex: hasCustomAvatar ? avatarIndex : 0,
        hasCustomAvatar: !!hasCustomAvatar
    };
    
    console.log("Updating avatar with data:", updateData);
    
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    );
});

export const getUserAssignments = asyncHandler(async (req, res) => {
    try {
        // console.log("hello");
        // Get all courses of the user
        const user = await User.findById(req.user._id).populate({
            path: 'courses',
            populate: {
                path: 'sections',
                populate: {
                    path: 'assignments'
                }
            }
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Get all submissions of the user
        const submissions = await Submission.find({ student: req.user._id });

        // Create a map of assignment IDs to their submission status
        const submissionMap = {};
        submissions.forEach(submission => {
            submissionMap[submission.assignment.toString()] = {
                status: submission.grade !== undefined ? 'graded' : 'submitted',
                grade: submission.grade,
                submittedAt: submission.submittedAt
            };
        });

        // Process assignments and add submission status
        const assignments = [];
        user.courses.forEach(course => {
            course.sections.forEach(section => {
                section.assignments.forEach(assignment => {
                    const assignmentData = {
                        _id: assignment._id,
                        title: assignment.title,
                        description: assignment.description,
                        dueDate: assignment.dueDate,
                        course: {
                            _id: course._id,
                            name: course.name
                        },
                        section: {
                            _id: section._id,
                            name: section.name
                        },
                        status: submissionMap[assignment._id.toString()]?.status || 'pending',
                        grade: submissionMap[assignment._id.toString()]?.grade,
                        submittedAt: submissionMap[assignment._id.toString()]?.submittedAt
                    };
                    assignments.push(assignmentData);
                });
            });
        });

        // Sort assignments by due date
        assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        return res.status(200).json(
            new ApiResponse(200, assignments, "Assignments fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Error fetching assignments");
    }
});

// Initiate password change with OTP
export const initiatePasswordChange = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json(
                new ApiResponse(404, null, "User not found")
            );
        }
        
        // Check if user can request another OTP (if an OTP was sent recently)
        if (user.passwordResetOTPExpiry && !canResendOTP(user.passwordResetOTPExpiry)) {
            const timeRemaining = Math.ceil((new Date(user.passwordResetOTPExpiry).getTime() - Date.now() + 120000) / 1000);
            return res.status(429).json(
                new ApiResponse(429, null, `Please wait ${timeRemaining} seconds before requesting another OTP`)
            );
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Set OTP and expiry in user document
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpiry = new Date();
        await user.save();
        
        // Prepare email content
        const emailContent = `
            <h1>Password Change Request</h1>
            <p>Hello ${user.name || user.username},</p>
            <p>You've requested to change your password. Please use the following OTP to verify your request:</p>
            <h2 style="font-size: 24px; padding: 10px; background-color: #f0f0f0; text-align: center; letter-spacing: 5px;">${otp}</h2>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you did not request this password change, please ignore this email or contact support immediately.</p>
        `;
        
        // For debugging - log that we're about to send email
        console.log(`Attempting to send OTP email to ${user.email}`);
        
        try {
            // Send email
            await sendEmail({
                email: user.email,
                subject: "Password Change OTP",
                html: emailContent
            });
            
            return res.status(200).json(
                new ApiResponse(
                    200, 
                    { 
                        email: user.email,
                        otpExpiry: new Date(user.passwordResetOTPExpiry.getTime() + 300000)
                    }, 
                    "OTP sent to your email"
                )
            );
        } catch (emailError) {
            // Log detailed email error
            console.error("Email sending error:", emailError);
            
            // If email sending fails, clear the OTP
            user.passwordResetOTP = null;
            user.passwordResetOTPExpiry = null;
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json(
                new ApiResponse(500, null, "Error sending OTP email. Please try again later.")
            );
        }
    } catch (error) {
        // Log unexpected errors
        console.error("Unexpected error in initiatePasswordChange:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Something went wrong. Please try again.")
        );
    }
});

// Verify OTP and change password
export const verifyOTPAndChangePassword = asyncHandler(async (req, res) => {
    const { otp, newPassword } = req.body;
    
    if (!otp || !newPassword) {
        throw new ApiError(400, "OTP and new password are required");
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    // Check if OTP exists
    if (!user.passwordResetOTP) {
        throw new ApiError(400, "No OTP requested. Please initiate password change first");
    }
    
    // Check if OTP is expired
    if (isOTPExpired(user.passwordResetOTPExpiry)) {
        // Clear expired OTP
        user.passwordResetOTP = null;
        user.passwordResetOTPExpiry = null;
        await user.save();
        
        throw new ApiError(400, "OTP has expired. Please request a new one");
    }
    
    // Check if OTP matches
    if (user.passwordResetOTP !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }
    
    // Change password
    user.password = newPassword;
    
    // Clear OTP fields
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiry = null;
    
    await user.save();
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Resend OTP for password change
export const resendPasswordChangeOTP = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json(
                new ApiResponse(404, null, "User not found")
            );
        }
        
        // Check if user can request another OTP
        if (user.passwordResetOTPExpiry && !canResendOTP(user.passwordResetOTPExpiry)) {
            const timeRemaining = Math.ceil((new Date(user.passwordResetOTPExpiry).getTime() - Date.now() + 120000) / 1000);
            return res.status(429).json(
                new ApiResponse(429, null, `Please wait ${timeRemaining} seconds before requesting another OTP`)
            );
        }
        
        // Generate new OTP
        const otp = generateOTP();
        
        // Update OTP and expiry
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpiry = new Date();
        await user.save();
        
        // Prepare email content
        const emailContent = `
            <h1>Password Change Request</h1>
            <p>Hello ${user.name || user.username},</p>
            <p>You've requested a new OTP to change your password. Please use the following OTP:</p>
            <h2 style="font-size: 24px; padding: 10px; background-color: #f0f0f0; text-align: center; letter-spacing: 5px;">${otp}</h2>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you did not request this password change, please ignore this email or contact support immediately.</p>
        `;
        
        try {
            // Send email
            await sendEmail({
                email: user.email,
                subject: "Password Change OTP",
                html: emailContent
            });
            
            return res.status(200).json(
                new ApiResponse(
                    200, 
                    { 
                        email: user.email,
                        otpExpiry: new Date(user.passwordResetOTPExpiry.getTime() + 300000)
                    }, 
                    "New OTP sent to your email"
                )
            );
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            
            // If email sending fails, clear the OTP
            user.passwordResetOTP = null;
            user.passwordResetOTPExpiry = null;
            await user.save({ validateBeforeSave: false });
            
            return res.status(500).json(
                new ApiResponse(500, null, "Error sending OTP email. Please try again later.")
            );
        }
    } catch (error) {
        console.error("Unexpected error in resendPasswordChangeOTP:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Something went wrong. Please try again.")
        );
    }
});