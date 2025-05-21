import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";  // Add this import
import { Organization, Course, User,CourseEnrollmentRequest } from "../models/schema.model.js";
import { sendEmail } from '../utils/emailService.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

// Get all organizations where user is a teacher
export const getTeacherOrganizations = asyncHandler(async (req, res) => {
    const organizations = await Organization.find({
        teachers: req.user._id
    }).select("name description logo contactDetails");

    res.status(200).json(
        new ApiResponse(200, organizations, "Teacher organizations fetched successfully")
    );
});

// Get all courses from organizations where user is a teacher
export const getTeacherOrganizationCourses = asyncHandler(async (req, res) => {
    const organizations = await Organization.find({
        teachers: req.user._id
    }).select("_id");

    const orgIds = organizations.map(org => org._id);

    const courses = await Course.find({
        organization: { $in: orgIds }
    }).populate({
        path: "organization",
        select: "name description"
    });

    res.status(200).json(
        new ApiResponse(200, courses, "Organization courses fetched successfully")
    );
});

// Get all courses where user is a teacher
export const getTeacherCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({
        teachers: req.user._id
    }).populate({
        path: "organization",
        select: "name description logo"
    }).select("name description likes students pendingStudents sections");

    res.status(200).json(
        new ApiResponse(200, courses, "Teacher courses fetched successfully")
    );
});

// Get all students in a course
export const getCourseStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
        .populate({
            path: "students",
            select: "name username email"
        });

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Verify if user is a teacher of this course
    if (!course.teachers.includes(req.user._id)) {
        throw new ApiError(403, "Only course teachers can view student details");
    }

    res.status(200).json(
        new ApiResponse(200, course.students, "Course students fetched successfully")
    );
});

// Get pending student requests for a course
export const getPendingStudents = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
        .populate({
            path: "pendingStudents",
            select: "name username email"
        });

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Verify if user is a teacher of this course
    if (!course.teachers.includes(req.user._id)) {
        throw new ApiError(403, "Only course teachers can view pending requests");
    }

    res.status(200).json(
        new ApiResponse(200, course.pendingStudents, "Pending students fetched successfully")
    );
});

export const joinCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Find the course and populate organization details
    const course = await Course.findById(courseId)
        .populate('organization')
        .populate('teachers');

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Check if teacher is already part of the course
    if (course.teachers.some(teacher => teacher._id.toString() === req.user._id.toString())) {
        throw new ApiError(400, "You are already part of this course");
    }

    // Get teacher's organizations
    const teacher = await User.findById(req.user._id)
        .populate('organizations');

    // Check if teacher belongs to the course's organization
    const isTeacherInOrg = teacher.organizations.some(
        org => org._id.toString() === course.organization._id.toString()
    );

    if (!isTeacherInOrg) {
        throw new ApiError(403, "You are of different organization, request admin to join this organization");
    }

    // Add teacher to course
    course.teachers.push(req.user._id);
    await course.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Successfully joined the course"
        )
    );
});

// Invite students to join a course
export const inviteStudentsToCourse = asyncHandler(async (req, res) => {
    const { courseId, emails } = req.body;
    // console.log("emails are hellow ldjfvn lk;m",emails);
    if (!courseId || !emails || !Array.isArray(emails)) {
      throw new ApiError(400, "Course ID and array of student emails are required");
    }
  
    // Check if course exists and teacher is authorized
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).populate("organization");
  
    if (!course) {
      throw new ApiError(404, "Course not found or you're not authorized");
    }
  
    const emailResults = {
      total: emails.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      failedEmails: [],
      alreadyInCourse: [],
    };
  
    const courseLink = `${process.env.FRONTEND_URL}/courses/${course._id}/join`;
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user && course.students.includes(user._id)) {
        emailResults.skipped++;
        emailResults.alreadyInCourse.push({
          email: user.email,
          name: user.name || "Unnamed Student",
        });
        // console.log("found someone");
        continue;
      }
  
      const emailContent = `
        <p>Hello,</p>
        <p>You are invited to join the course <strong>${course.name}</strong> at <strong>${course.organization.name}</strong>.</p>
        <p>Course Description: ${course.description || "No description provided."}</p>
        <p>Click the link below to join the course:</p>
        <a href="${courseLink}" target="_blank">Join Course</a>
        <p>If you have any questions, please contact your teacher.</p>
        <p>Best regards,<br>${req.user.name || "Course Teacher"}</p>
      `;
  
      try {
        await sendEmail({
          email,
          subject: `Invitation to join "${course.name}" - Eklavya Foundation LMS`,
          html: emailContent,
        });
        emailResults.sent++;
      } catch (error) {
        emailResults.failed++;
        emailResults.failedEmails.push(email);
        console.error(`Failed to send email to ${email}:`, error);
      }
    }
  
    return res.status(200).json(
      new ApiResponse(200, emailResults, "Course invitations processed")
    );
  });


// Get all students in an organization
export const getOrganizationStudents = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;
    
    if (!organizationId) {
        throw new ApiError(400, "Organization ID is required");
    }
    
    // Verify teacher belongs to this organization
    // console.log("id is",organizationId);
    const teacher = await User.findById(req.user._id);
    const isTeacherInOrg = teacher.organizations.some(
        org => org.toString() === organizationId
    );
    
    if (!isTeacherInOrg) {
        throw new ApiError(403, "You are not authorized to access students from this organization");
    }
    
    // Get all students in the organization
    const students = await User.find({ 
        role: "student", 
        organizations: organizationId
      }).select("name email createdAt");
    console.log('students are',students);
    return res.status(200).json(
      new ApiResponse(200, students, "Organization students retrieved successfully")
    );
});

export const getStudentCourseEnrollmentRequests = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    const requests = await CourseEnrollmentRequest.find({ 
        course: courseId
    })
    .populate({
        path: "user",
        select: "name email"
    })
    .populate({
        path: "course",
        select: "name"
    })
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, requests, "Student enrollment requests retrieved successfully")
    );
});


export const updateRequestStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
    // console.log("status is", status);
    // console.log("id is", requestId);

    // Validate requestId and status
    if (!requestId || !["approved", "rejected"].includes(status)) {
        throw new ApiError(400, "Valid status (approved/rejected) is required");
    }

    // Check if the request exists and populate necessary fields
    const request = await CourseEnrollmentRequest.findById(requestId)
        .populate("user", "name email enrolledCourses")
        .populate("course", "name students");

    if (!request) {
        throw new ApiError(404, "Enrollment request not found");
    }

    // Update the request status
    request.status = status;
    request.processedAt = new Date();
    request.processedBy = req.user._id;
    await request.save();

    if (status === "approved") {
        const user = await User.findById(request.user._id);
        const course = await Course.findById(request.course._id);
        // console.log("user is ",user);
        // console.log("course is ",course);
        if (user && course) {
            // Add course to user's enrolledCourses if not already enrolled
            if (!user.courses.includes(course._id)) {
                user.courses.push(course._id);
                await user.save();
            }

            // Add user to course's students array if not already added
            if (!course.students.includes(user._id)) {
                course.students.push(user._id);
                await course.save();
            }
        }
    }

    // Send email notification to the user
    const emailContent = `
        <p>Hello ${request.user.name},</p>
        
        <p>Your enrollment request for the course "${request.course.name}" has been ${status}.</p>
        
        ${status === "approved" 
            ? "<p>You can now access the course materials and start learning!</p>" 
            : "<p>If you would like to discuss this further, please contact your teacher.</p>"
        }
        
        <p>Best regards,<br>
        Eklavya Foundation LMS Team</p>
    `;

    await sendEmail({
        email: request.user.email,
        subject: `Course Enrollment ${status.charAt(0).toUpperCase() + status.slice(1)} - ${request.course.name}`,
        html: emailContent
    });

    return res.status(200).json(
        new ApiResponse(
            200, 
            { request, message: `Enrollment request ${status} successfully` },
            `Student ${status === "approved" ? "enrolled in" : "rejected from"} the course successfully`
        )
    );
});// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = 'uploads';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' || 
      file.originalname.endsWith('.csv') || 
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only CSV and Excel files are allowed'), false);
    }
  };

// Configure multer upload
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Process CSV and invite students - renamed to reflect both CSV and Excel support
export const inviteStudentsFromFile = asyncHandler(async (req, res) => {
    const { courseId } = req.body;
    
    if (!courseId) {
      throw new ApiError(400, "Course ID is required");
    }
  
    // Check if course exists and teacher is authorized
    const course = await Course.findOne({
      _id: courseId,
      teachers: req.user._id,
    }).populate("organization");
  
    if (!course) {
      throw new ApiError(404, "Course not found or you're not authorized");
    }
  
    if (!req.file) {
      throw new ApiError(400, "File is required");
    }
  
    const results = {
      total: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      failedEmails: [],
      alreadyInCourse: [],
      invalidRows: []
    };
  
    const emails = [];
    
    // Process the file based on type
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      // Process CSV file
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => {
            // Validate email from CSV
            const email = row.email?.trim();
            if (email && /^\S+@\S+\.\S+$/.test(email)) {
              emails.push(email);
            } else {
              results.invalidRows.push(row);
            }
          })
          .on('end', async () => {
            results.total = emails.length;
            resolve();
          })
          .on('error', (error) => {
            reject(new ApiError(500, `Error processing CSV: ${error.message}`));
          });
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Process Excel file
      try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        
        data.forEach(row => {
          const email = row.email?.trim();
          if (email && /^\S+@\S+\.\S+$/.test(email)) {
            emails.push(email);
          } else {
            results.invalidRows.push(row);
          }
        });
        
        results.total = emails.length;
      } catch (error) {
        throw new ApiError(500, `Error processing Excel file: ${error.message}`);
      }
    }
  
    // Cleanup the uploaded file
    fs.unlinkSync(req.file.path);
  
    // No valid emails found
    if (emails.length === 0) {
      return res.status(400).json(
        new ApiResponse(400, results, "No valid emails found in the file")
      );
    }
  
    // Use the existing invitation logic
    const courseLink = `${process.env.FRONTEND_URL}/courses/${course._id}/join`;
    
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user && course.students.includes(user._id)) {
        results.skipped++;
        results.alreadyInCourse.push({
          email: user.email,
          name: user.name || "Unnamed Student",
        });
        continue;
      }
  
      const emailContent = `
        <p>Hello,</p>
        <p>You are invited to join the course <strong>${course.name}</strong> at <strong>${course.organization.name}</strong>.</p>
        <p>Course Description: ${course.description || "No description provided."}</p>
        <p>Click the link below to join the course:</p>
        <a href="${courseLink}" target="_blank">Join Course</a>
        <p>If you have any questions, please contact your teacher.</p>
        <p>Best regards,<br>${req.user.name || "Course Teacher"}</p>
      `;
  
      try {
        await sendEmail({
          email,
          subject: `Invitation to join "${course.name}" - Eklavya Foundation LMS`,
          html: emailContent,
        });
        results.sent++;
      } catch (error) {
        results.failed++;
        results.failedEmails.push(email);
        console.error(`Failed to send email to ${email}:`, error);
      }
    }
  
    return res.status(200).json(
      new ApiResponse(200, results, "File processed and invitations sent")
    );
  });
