import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
// Correct import from schema.model.js instead of individual model files
import { User, Course } from '../models/schema.model.js';
import { generateCertificate } from '../utils/certificateGenerator.js';

export const generateCourseCompletionCertificate = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user?._id;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Generate certificate
    // Update property names to match your schema
    const userName = user.name; // Using the name property based on your schema
    const courseName = course.name; // Using the name property based on your schema
    const organizationName = course.organization ? 'Learning Platform' : 'Learning Platform';
    const completionDate = new Date();
    
    const certificateBuffer = await generateCertificate(
        userName,
        courseName,
        organizationName,
        completionDate
    );
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);
    
    // Send the certificate
    res.send(certificateBuffer);
});
