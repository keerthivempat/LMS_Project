import { User, Course, EnrollmentRequest, CourseEnrollmentRequest, Section, Submission, Organization, Assignment } from "../models/schema.model.js";
import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import { generateStrongPassword } from "../utils/StrongPassword.js";
import cloudinaryPkg from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const { v2: cloudinary } = cloudinaryPkg;

// Configure multer storage for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter for CSV and Excel files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only CSV and Excel files are allowed'), false);
  }
};

// Configure multer upload
export const uploadStudents = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new admin
const createAdmin = asyncHandler(async (req, res) => {
  const { email, organizationId } = req.body;

  if (!email || !organizationId) {
    throw new ApiError(400, "Email and organization ID are required");
  }

  // Check if organization exists
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create new user
    user = await User.create({
      email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      password: tempPassword,
      role: "admin",
      isActive: true,
      isEmailVerified: true
    });
    user.organizations.push(organizationId);
    await user.save()
    organization.admins.push(user._id);
    await organization.save();

    // Send email with credentials
    await sendEmail({
      email,
      subject: "Admin Account Created - Eklavya Foundation LMS",
      html: `<p>You have been added as an admin for ${organization.name}. 
      Your temporary password is: ${tempPassword}
      Please login and change your password immediately.</p>`
    });
  } else {
    // Update user role if needed
    if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    if (!user.organizations.includes(organizationId)) {
      user.organizations.push(organizationId);
      await user.save();
    }

    // Add user to organization's admins if not already present
    if (!organization.admins.includes(user._id)) {
      organization.admins.push(user._id);
      await organization.save();
    }

  }

  const existingAdmin = await Admin.findOne({
    user: user._id,
    organization: organizationId
  });

  if (existingAdmin) {
    throw new ApiError(400, "User is already an admin for this organization");
  }

  const admin = await Admin.create({
    user: user._id,
    organization: organizationId
  });

  return res.status(201).json(
    new ApiResponse(201, admin, "Admin created successfully")
  );
});

// Get all admins for an organization
const getAdminsByOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const admins = await Admin.find({ organization: organizationId })
    .populate("user", "name email")
    .populate("organization", "name");

  return res.status(200).json(
    new ApiResponse(200, admins, "Admins retrieved successfully")
  );
});

// Remove admin
const removeAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  
  // Get the user ID before deleting the admin record
  const userId = admin.user;

  // Delete the admin record
  await Admin.findByIdAndDelete(adminId);
  
  // Check if the user has any other admin roles
  const hasOtherAdminRoles = await Admin.findOne({ user: userId });
  
  if (!hasOtherAdminRoles) {
    // If no other admin roles, update user role to 'user'
    const user = await User.findById(userId);
    if (user && user.role === 'admin') {
      user.role = 'user';
      await user.save();
      // console.log(`User ${userId} role changed from admin to user`);
    }
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Admin removed successfully")
  );
});

// Update admin status (active/inactive)
const updateAdminStatus = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    throw new ApiError(400, "isActive status is required");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  admin.isActive = isActive;
  await admin.save();

  return res.status(200).json(
    new ApiResponse(200, admin, "Admin status updated successfully")
  );
});

// Admin dashboard data
const getAdminDashboard = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const userId = req.user._id;

  // Verify the user is an admin for this organization
  const admin = await Admin.findOne({
    user: userId,
    organization: organizationId,
    isActive: true
  });

  if (!admin) {
    throw new ApiError(403, "You are not authorized as an admin for this organization");
  }

  // Get organization details
  const organization = await Organization.findById(organizationId);
  
  // Get count of courses, teachers, students in this organization
  const coursesCount = await Course.countDocuments({ organization: organizationId });
  const teachersCount = await Organization.findById(organizationId).select('teachers').then(org => org.teachers.length);
  const studentsCount = await Organization.findById(organizationId).select('students').then(org => org.students.length);

  // Get recent course enrollments - using Course model instead of Enrollment
  const recentCourses = await Course.find({ organization: organizationId })
    .sort({ createdAt: -1 })
    // .limit(5)
    .populate("teachers", "name email")
    .populate("students", "name email");

  return res.status(200).json(
    new ApiResponse(200, {
      organization,
      stats: {
        coursesCount,
        teachersCount,
        studentsCount
      },
      recentCourses
    }, "Admin dashboard data retrieved successfully")
  );
});

// Get organization teachers
const getOrganizationTeachers = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  
  // First get the organization with populated teachers
  const organization = await Organization.findById(organizationId)
    .populate('teachers', 'name email');
    
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res.status(200).json(
    new ApiResponse(200, organization.teachers, "Organization teachers retrieved successfully")
  );
});

const addTeacher = asyncHandler(async (req, res) => {
  const { email, organizationId } = req.body;
  // console.log("hi");
  if (!email || !organizationId) {
    throw new ApiError(400, "Email and organization ID are required");
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }
  // console.log("org is ",organization);
  let user = await User.findOne({ email });
  const strngpass = generateStrongPassword();

  if (!user) {
    user = await User.create({
      email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      password: strngpass,
      role: "teacher",
      isActive: true,
      isEmailVerified: true,
    });
    // console.log(user.email);
    organization.teachers.push(user._id.toString());
    await organization.save();
    user.organizations.push(organization._id.toString());
    await user.save();
    // console.log("done successfully");
    await sendEmail({
      email,
      subject: "Teacher Account Created - Eklavya Foundation LMS",
      html: `<p> You have been added as a teacher for ${organization.name}. 
      Your temporary password is: ${strngpass}
      Please login and change your password immediately. </p>`
    });
  } else {
    if (user.role !== "teacher" && user.role !== "admin" && user.role !== "superadmin" && user.role!== "student") {
      user.role = "teacher";
      user.organizations = [];
      user.organizations.push(organization._id.toString());
      user.courses = [];
      
      await user.save();
    }
    
    // Add teacher to organization if not already there
    if (!organization.teachers.includes(user._id)) {
      organization.teachers.push(user._id);
      await organization.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { user: { _id: user._id, email: user.email, role: user.role } }, 
      "Teacher added to organization successfully")
  );
});
  
  // Remove teacher from organization
  const removeTeacher = asyncHandler(async (req, res) => {
    const { currentTeacherId, organizationId } = req.params;
    // console.log("teacher is ",currentTeacherId,organizationId);
    // Find the organization
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }
  
    organization.teachers = organization.teachers.filter(
      teacherId => teacherId.toString() !== currentTeacherId
    );
    await organization.save();
    const user = await User.findById(currentTeacherId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.organizations = user.organizations.filter(
      orgId => orgId.toString() !== organizationId
    );
    await user.save();
    // console.log("after save is ",user);
    return res.status(200).json(
      new ApiResponse(200, {}, "Teacher removed from organization successfully")
    );
  });

  const removeStudent = asyncHandler(async (req, res) => {
    const { studentId, orgId } = req.params;
    // console.log("Removing student:", studentId, "from organization:", orgId);
  
    const organization = await Organization.findById(orgId).populate("courses");
    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }
  
    const user = await User.findById(studentId);
    if (!user) {
      throw new ApiError(400, "User not found");
    }
  
    if (user.role !== 'student') {
      throw new ApiError(400, "Not a student");
    }
  
    // 1. Remove student from organization
    organization.students = organization.students.filter(
      student => student.toString() !== studentId
    );
  
    // 2. Remove organization from user's list
    user.organizations = user.organizations.filter(
      org => org.toString() !== orgId
    );
  
    // 3. Remove student from all courses in that organization
    const orgCourseIds = organization.courses.map(course => course._id.toString());
  
    for (const course of organization.courses) {
      const originalStudentCount = course.students.length;
      const originalPendingCount = course.pendingStudents.length;
  
      course.students = course.students.filter(
        student => student.toString() !== studentId
      );
  
      course.pendingStudents = course.pendingStudents.filter(
        student => student.toString() !== studentId
      );
  
      // Save course only if something changed
      if (
        course.students.length !== originalStudentCount ||
        course.pendingStudents.length !== originalPendingCount
      ) {
        await course.save();
      }
    }
  
    // 4. Remove any courses of this org from user's course list
    user.courses = user.courses.filter(
      courseId => !orgCourseIds.includes(courseId.toString())
    );
  
    await organization.save();
    await user.save();
  
    return res.status(200).json(
      new ApiResponse(200, {}, "Student removed from organization and its courses successfully")
    );
  });
  

  const assignCourseToTeacher = asyncHandler(async (req, res) => {
    const { courseId, teacherId, organizationId } = req.body;
  
    if (!courseId || !teacherId || !organizationId) {
      throw new ApiError(400, "Course ID, teacher ID, and organization ID are required");
    }
  
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
  
    // Check if teacher exists and is in the organization
    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
      // organizations: { $elemMatch: { organization: organizationId } }
    });
  
    if (!teacher) {
      throw new ApiError(404, "Teacher not found in this organization");
    }
  
    // Assign the course
    course.teachers.push(teacherId);
    await course.save();
    teacher.courses.push(courseId);
    await teacher.save();
    // console.log("done");
    return res.status(200).json(
      new ApiResponse(200, course, "Course assigned to teacher successfully")
    );
  });
// Get pending courses for approval
const getPendingCourses = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;
  
    const pendingCourses = await Course.find({ 
      organization: organizationId,
      status: "pending"
    })
    .populate("teacher", "name email")
    .sort({ createdAt: -1 });
  
    return res.status(200).json(
      new ApiResponse(200, pendingCourses, "Pending courses retrieved successfully")
    );
  });
  
  // Approve or reject course
  const updateCourseStatus = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { status, feedback } = req.body;
  
    if (!status || !["approved", "rejected"].includes(status)) {
      throw new ApiError(400, "Valid status (approved/rejected) is required");
    }
  
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
  
    course.status = status;
    if (feedback) {
      course.adminFeedback = feedback;
    }
    
    await course.save();
  
    // If approved, notify the teacher
    if (status === "approved") {
      const teacher = await User.findById(course.teacher);
      if (teacher) {
        await sendEmail.sendMail({
          email: teacher.email,
          subject: "Course Approved - Eklavya Foundation LMS",
          body: `Your course "${course.title}" has been approved and is now available to students.`
        });
      }
    }
  
    return res.status(200).json(
      new ApiResponse(200, course, `Course ${status} successfully`)
    );
  });
// Update organization details
const updateOrganizationDetails = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { name, description, contactDetails } = req.body;

  // Verify admin belongs to this organization
  const admin = await Admin.findOne({
    user: req.user._id,
    organization: organizationId,
    isActive: true
  });

  if (!admin) {
    throw new ApiError(403, "You are not authorized to update this organization");
  }

  const organization = await Organization.findById(organizationId);
  
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  try {
    // Update basic fields if provided
    if (name) organization.name = name;
    if (description) organization.description = description;
    if (contactDetails) {
      organization.contactDetails = {
        ...organization.contactDetails,
        ...contactDetails
      };
    }

    // Handle logo upload if file exists
    if (req.file) {
      // Delete old logo from Cloudinary if it exists
      if (organization.logo) {
        try {
          await cloudinary.uploader.destroy(organization.logo.public_id);
        } catch (error) {
          console.error("Error deleting old logo:", error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new logo with optimized settings
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `eklavya-lms/organizations/${organizationId}`,
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
        timeout: 120000, // Increased timeout to 120 seconds
      });

      // Save only the URL in the logo field
      organization.logo = result.secure_url; // Save only the URL
    }
    
    await organization.save();

    return res.status(200).json(
      new ApiResponse(200, organization, "Organization updated successfully")
    );
  } catch (error) {
    console.error("Error updating organization:", error);
    
    // Handle Cloudinary specific errors
    if (error.http_code === 499) {
      throw new ApiError(500, "Image upload timed out. Please try with a smaller image or try again.");
    }
    
    throw new ApiError(500, "Failed to update organization. " + (error.message || "Please try again."));
  }
});
  
  // Get organization details
  const getOrganizationDetails = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;
    const { populate } = req.query;
  
    if (!organizationId) {
      throw new ApiError(400, "Organization ID is required");
    }
  
    // Step 1: Find the organization
    const organization = await Organization.findById(organizationId);
  
    if (!organization) {
      throw new ApiError(404, "Organization not found");
    }
  
    // Step 2: Optionally populate related users based on role
    if (populate) {
      const fieldsToPopulate = populate.split(',');
  
      if (fieldsToPopulate.includes('admins')) {
        const admins = await User.find({
          role: 'admin',
          organizations: organizationId
        }).select('name email');
        organization._doc.admins = admins;
      }
  
      if (fieldsToPopulate.includes('teachers')) {
        const teachers = await User.find({
          role: 'teacher',
          organizations: organizationId
        }).select('name email');
        organization._doc.teachers = teachers;
      }
  
      if (fieldsToPopulate.includes('students')) {
        const students = await User.find({
          role: 'student',
          organizations: organizationId
        }).select('name email');
        organization._doc.students = students;
      }
  
      if (fieldsToPopulate.includes('courses')) {
        const courses = await Course.find({
          organization: organizationId
        }).select('name description');
        organization._doc.courses = courses;
      }
    }
  
    // Step 3: Send the response
    return res.status(200).json({
      success: true,
      data: organization
    });
  });
  // Get all students in an organization
const getOrganizationStudents = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  
  // First get the organization with populated students
  const organization = await Organization.findById(organizationId)
    .populate('students', 'name email createdAt');
    
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  return res.status(200).json(
    new ApiResponse(200, organization.students, "Organization students retrieved successfully")
  );
});
  
  // Approve student enrollment requests
  const getStudentEnrollmentRequests = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;
    // console.log('org is ',organizationId);
    const requests = await EnrollmentRequest.find({ 
      organization: organizationId,
      status: "pending"
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
    // console.log("requests are",requests);
    return res.status(200).json(
      new ApiResponse(200, requests, "Student enrollment requests retrieved successfully")
    );
  });
  
  // Approve or reject student enrollment
  const updateEnrollmentStatus = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;
  
    if (!status || !["approved", "rejected"].includes(status)) {
      throw new ApiError(400, "Valid status (approved/rejected) is required");
    }
  
    const request = await EnrollmentRequest.findById(requestId);
    if (!request) {
      throw new ApiError(404, "Enrollment request not found");
    }
  
    request.status = status;
    request.processedAt = new Date();
    request.processedBy = req.user._id;
    await request.save();
  
    if (status === "approved") {
      const user = await User.findById(request.user);
      if (user) {
        // Simply push the organization ID since organizations is an array of ObjectIds
        if (!user.organizations.includes(request.organization)) {
          user.organizations.push(request.organization);
          
          // Update user role to student if not already an admin
          if (user.role !== 'admin') {
            user.role = 'student';
          }

          await user.save();

          
          // console.log('org to join is',request.organization.toString());
          const organization = await Organization.findById(request.organization.toString());
          if (organization && !organization.students.includes(user._id)) {
            organization.students.push(user._id);
            await organization.save();
          }
        }
  
        // Send notification email
        await sendEmail({
          email: user.email,
          subject: "Organization Enrollment Approved - Eklavya Foundation LMS",
          html: `<p>Your request to join the organization has been approved. You can now access courses in this organization.</p>`
        });
      }
    }
  
    return res.status(200).json(
      new ApiResponse(200, request, `Enrollment request ${status} successfully`)
    );
  });
  // Invite all organization students to join a course
const inviteStudentsToCourse = asyncHandler(async (req, res) => {
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
  

const getCourseTeachers = asyncHandler(async (req, res) => {
  // console.log("hello");
    const { courseId } = req.query;
    // console.log("req is ",courseId);
    if (!courseId) {
        throw new ApiError(400, "Course ID is required");
    }

    const course = await Course.findById(courseId)
        .populate('teachers', 'name email')
        .select('teachers');

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res.status(200).json(
        new ApiResponse(200, course.teachers, "Course teachers fetched successfully")
    );
});

// Add this function in admin.controller.js
const removeCourseTeacher = asyncHandler(async (req, res) => {
    const { courseId, teacherId } = req.params;

    if (!courseId || !teacherId) {
        throw new ApiError(400, "Course ID and Teacher ID are required");
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // Remove teacher from course's teachers array
    course.teachers = course.teachers.filter(
        id => id.toString() !== teacherId
    );
    await course.save();

    // Remove course from teacher's courses array
    const teacher = await User.findById(teacherId);
    if (teacher) {
        teacher.courses = teacher.courses.filter(
            id => id.toString() !== courseId
        );
        await teacher.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Teacher removed from course successfully")
    );
});

const removeCourseStudent = asyncHandler(async (req, res) => {
  const { courseId, studentId } = req.params;

  if (!courseId || !studentId) {
      throw new ApiError(400, "Course ID and Teacher ID are required");
  }

  // Find the course
  const course = await Course.findById(courseId);
  if (!course) {
      throw new ApiError(404, "Course not found");
  }

  // Remove teacher from course's teachers array
  course.students = course.students.filter(
      id => id.toString() !== studentId
  );
  await course.save();

  // Remove course from teacher's courses array
  const student = await User.findById(studentId);
  if (student) {
      student.courses = student.courses.filter(
          id => id.toString() !== courseId
      );
      await student.save();
  }
  // console.log("done successfully");
  return res.status(200).json(
      new ApiResponse(200, {}, "Student removed from course successfully")
  );
});
// Bulk upload teachers
const bulkUploadTeachers = asyncHandler(async (req, res) => {
  const { emails, organizationId } = req.body;

  if (!emails || !Array.isArray(emails) || !organizationId) {
    throw new ApiError(400, "Valid email array and organization ID are required");
  }

  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const results = {
    total: emails.length,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    failedEmails: [],
  };

  for (const email of emails) {
    try {
      // Check if valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.failed++;
        results.failedEmails.push({
          email,
          reason: "Invalid email format"
        });
        continue;
      }

      // Check if user exists
      let user = await User.findOne({ email });
      
      // Check if already a teacher in this organization
      const isAlreadyTeacher = organization.teachers.some(
        teacherId => user && teacherId.toString() === user._id.toString()
      );

      if (isAlreadyTeacher) {
        results.skipped++;
        continue;
      }

      const strngpass = generateStrongPassword();

      if (!user) {
        user = await User.create({
          email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          password: strngpass,
          role: "teacher",
          isActive: true,
          isEmailVerified: true,
        });
        
        organization.teachers.push(user._id.toString());
        await organization.save();
        
        user.organizations.push(organization._id.toString());
        await user.save();
        
        await sendEmail({
          email,
          subject: "Teacher Account Created - Eklavya Foundation LMS",
          html: `<p> You have been added as a teacher for ${organization.name}. 
          Your temporary password is: ${strngpass}
          Please login and change your password immediately. </p>`
        });
        
        results.succeeded++;
      } else {
        // User exists but not a teacher in this org
        if (user.role !== "teacher" && user.role !== "admin" && user.role !== "superadmin") {
          user.role = "teacher";
          user.organizations = [];
          user.organizations.push(organization._id.toString());
          user.courses = [];
          
          await user.save();
        }
        
        // Add teacher to organization if not already there
        if (!organization.teachers.includes(user._id)) {
          organization.teachers.push(user._id);
          await organization.save();
          results.succeeded++;
        } else {
          results.skipped++;
        }
      }
    } catch (error) {
      console.error(`Error adding teacher ${email}:`, error);
      results.failed++;
      results.failedEmails.push({
        email,
        reason: error.message || "Unknown error"
      });
    }
  }

  return res.status(200).json(
    new ApiResponse(200, results, "Bulk upload processed")
  );
});

// Invite individual student to organization
const inviteStudentToOrganization = asyncHandler(async (req, res) => {
  const { email, organizationId } = req.body;

  if (!email || !organizationId) {
    throw new ApiError(400, "Email and organization ID are required");
  }

  // Check if organization exists
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if user is authorized to manage this organization
  const isAdminAuthorized = organization.admins.includes(req.user._id);
  if (!isAdminAuthorized) {
    throw new ApiError(403, "You are not authorized to manage this organization");
  }

  // Check if user already exists
  let user = await User.findOne({ email });
  let isNewUser = false;
  let tempPassword = '';

  if (!user) {
    // Generate a temporary password
    tempPassword = generateStrongPassword();
    isNewUser = true;
    
    // Create new user
    user = await User.create({
      email,
      username: email.split('@')[0],
      name: email.split('@')[0],
      password: tempPassword,
      role: "student",
      isActive: true,
      isEmailVerified: true
    });
  }

  // Check if user is already part of the organization
  const isAlreadyMember = organization.students.includes(user._id);
  
  if (!isAlreadyMember) {
    // Add user to organization's students
    organization.students.push(user._id);
    await organization.save();
    
    // Add organization to user's organizations
    user.organizations.push(organizationId);
    await user.save();
  }

  // Prepare the response
  const response = {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    isNewUser,
    isAlreadyMember
  };

  // Send email with credentials if it's a new user
  if (isNewUser) {
    await sendEmail({
      email,
      subject: `Welcome to ${organization.name} - Eklavya Foundation LMS`,
      html: `
        <p>Hello ${user.name},</p>
        <p>You have been invited to join ${organization.name} as a student on Eklavya Foundation LMS.</p>
        <p>Your account has been created with the following credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
        <p>You can access the platform at: ${process.env.FRONTEND_URL}</p>
        <p>Best regards,<br>Eklavya Foundation LMS Team</p>
      `
    });
  } else if (!isAlreadyMember) {
    // Send notification email to existing user
    await sendEmail({
      email,
      subject: `You've been added to ${organization.name} - Eklavya Foundation LMS`,
      html: `
        <p>Hello ${user.name},</p>
        <p>You have been added to ${organization.name} as a student on Eklavya Foundation LMS.</p>
        <p>You can access the platform at: ${process.env.FRONTEND_URL}</p>
        <p>Best regards,<br>Eklavya Foundation LMS Team</p>
      `
    });
  }

  return res.status(200).json(
    new ApiResponse(200, response, isAlreadyMember 
      ? "User is already a member of this organization" 
      : (isNewUser ? "New user created and added to organization" : "Existing user added to organization"))
  );
});

// Process CSV/Excel file and invite students to organization
const inviteStudentsFromFile = asyncHandler(async (req, res) => {
  const { organizationId } = req.body;
  
  if (!organizationId) {
    throw new ApiError(400, "Organization ID is required");
  }

  // Check if organization exists
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if user is authorized to manage this organization
  const isAdminAuthorized = organization.admins.includes(req.user._id);
  if (!isAdminAuthorized) {
    throw new ApiError(403, "You are not authorized to manage this organization");
  }

  if (!req.file) {
    throw new ApiError(400, "File is required");
  }

  const results = {
    total: 0,
    added: 0,
    newUsers: 0,
    existing: 0,
    alreadyInOrg: 0,
    invalidRows: [],
    failedEmails: []
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

  // Process each email
  for (const email of emails) {
    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      let tempPassword = '';
      
      if (!user) {
        // Generate a temporary password
        tempPassword = generateStrongPassword();
        
        // Create new user
        user = await User.create({
          email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          password: tempPassword,
          role: "student",
          isActive: true,
          isEmailVerified: true
        });
        results.newUsers++;
        
        // Send email with credentials to new user
        await sendEmail({
          email,
          subject: `Welcome to ${organization.name} - Eklavya Foundation LMS`,
          html: `
            <p>Hello ${user.name},</p>
            <p>You have been invited to join ${organization.name} as a student on Eklavya Foundation LMS.</p>
            <p>Your account has been created with the following credentials:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>Please login and change your password immediately.</p>
            <p>You can access the platform at: ${process.env.FRONTEND_URL}</p>
            <p>Best regards,<br>Eklavya Foundation LMS Team</p>
          `
        });
      } else {
        results.existing++;
      }

      // Check if user is already part of the organization
      if (organization.students.includes(user._id)) {
        results.alreadyInOrg++;
        continue;
      }
      
      // Add user to organization's students
      organization.students.push(user._id);
      
      // Add organization to user's organizations
      if (!user.organizations.includes(organizationId)) {
        user.organizations.push(organizationId);
        await user.save();
      }
      
      results.added++;
      
      // Send notification email to existing user
      if (tempPassword === '') {
        await sendEmail({
          email,
          subject: `You've been added to ${organization.name} - Eklavya Foundation LMS`,
          html: `
            <p>Hello ${user.name},</p>
            <p>You have been added to ${organization.name} as a student on Eklavya Foundation LMS.</p>
            <p>You can access the platform at: ${process.env.FRONTEND_URL}</p>
            <p>Best regards,<br>Eklavya Foundation LMS Team</p>
          `
        });
      }
    } catch (error) {
      console.error(`Error processing ${email}:`, error);
      results.failedEmails.push(email);
    }
  }
  
  // Save organization changes
  await organization.save();

  return res.status(200).json(
    new ApiResponse(200, results, "File processed and students invited")
  );
});

// Remove student from organization
const removeStudentFromOrganization = asyncHandler(async (req, res) => {
  const { organizationId, studentId } = req.params;

  if (!organizationId || !studentId) {
    throw new ApiError(400, "Organization ID and student ID are required");
  }

  // Check if organization exists
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  // Check if user is authorized to manage this organization
  const isAdminAuthorized = organization.admins.includes(req.user._id);
  if (!isAdminAuthorized) {
    throw new ApiError(403, "You are not authorized to manage this organization");
  }

  // Check if student exists in organization
  if (!organization.students.includes(studentId)) {
    throw new ApiError(404, "Student not found in this organization");
  }

  // Remove student from organization
  organization.students = organization.students.filter(
    id => id.toString() !== studentId
  );
  await organization.save();

  // Remove organization from student's organizations
  const student = await User.findById(studentId);
  if (student) {
    student.organizations = student.organizations.filter(
      id => id.toString() !== organizationId
    );
    await student.save();
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Student removed from organization successfully")
  );
});

// Get teacher activity data for admin dashboard visualization
const getTeacherActivity = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const userId = req.user._id;

  const admin = await Admin.findOne({
    user: userId,
    organization: organizationId,
    isActive: true
  });

  if (!admin) {
    throw new ApiError(403, "You are not authorized as an admin for this organization");
  }

  // Get all teachers in the organization
  const organization = await Organization.findById(organizationId)
    .populate({
      path: 'teachers',
      select: 'name email updatedAt'
    });

  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  const teacherIds = organization.teachers.map(teacher => teacher._id);
  
  // Get last content uploads (assignments and videos) for each teacher
  const teacherActivity = await Promise.all(
    organization.teachers.map(async (teacher) => {
      // Find the most recent section where teacher uploaded content
      // Look for both sections directly updated by teacher and sections with videos uploaded by teacher
        const sections = await Section.find({
        $or: [
          { updatedBy: teacher._id },
          { "videos.uploadedBy": teacher._id }
        ]
      }).sort({ updatedAt: -1 }).limit(1);

      // Find assignments created by this teacher
      const assignments = await Assignment.find({
        createdBy: teacher._id
      }).sort({ createdAt: -1 }).limit(1);

      // Find the most recent assignment review
      const submission = await Submission.find({
        "review.reviewedBy": teacher._id
      }).sort({ "review.reviewedAt": -1 }).limit(1);

      // Find most recent course where teacher is active
      const course = await Course.find({
        teachers: teacher._id
      }).sort({ updatedAt: -1 }).limit(1);

      // Determine the most recent content upload time
      let lastContentUploadedTime = null;
      
      if (sections.length > 0) {
        lastContentUploadedTime = sections[0].updatedAt;
      }
      
      if (assignments.length > 0) {
        const assignmentTime = assignments[0].createdAt;
        if (!lastContentUploadedTime || new Date(assignmentTime) > new Date(lastContentUploadedTime)) {
          lastContentUploadedTime = assignmentTime;
        }
      }

      return {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        lastActive: teacher.updatedAt,
        lastContentUploaded: lastContentUploadedTime,
        lastAssignmentReviewed: submission.length > 0 ? submission[0].review.reviewedAt : null,
        lastCourseActivity: course.length > 0 ? course[0].updatedAt : null
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, teacherActivity, "Teacher activity data retrieved successfully")
  );
});

export {
  createAdmin,
  getAdminsByOrganization,
  removeAdmin,
  updateAdminStatus,
  getAdminDashboard,
  getOrganizationTeachers,
  addTeacher,
  removeTeacher,
  removeStudent,
  assignCourseToTeacher,
  getPendingCourses,
  updateCourseStatus,
  updateOrganizationDetails,
  getOrganizationDetails,
  getOrganizationStudents,
  getStudentEnrollmentRequests,
  updateEnrollmentStatus,
  inviteStudentsToCourse,
  getCourseTeachers,
  removeCourseTeacher,
  removeCourseStudent,
  bulkUploadTeachers,
  inviteStudentToOrganization,
  inviteStudentsFromFile,
  removeStudentFromOrganization,
  getTeacherActivity
};
