import { Course, Organization, User, Section, Video, Assignment,CourseEnrollmentRequest } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// Get course details by ID
export const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId)
    .populate('sections')
    .populate({
      path: 'teachers',
      select: 'name email' // choose which fields you want to fetch
    });
    if (!course) throw new ApiError(404, 'Course not found');
    res.status(200).json(new ApiResponse(200, course, 'Course details fetched successfully'));
});

// Create a new course
export const createCourse = asyncHandler(async (req, res) => {
    console.log(req.body);
    const { name, description, teachers } = req.body;
    
    // Validate required fields
    if (!name || !description) {
        throw new ApiError(400, 'Name and description are required');
    }

    const organization = await Organization.findById(req.params.orgId);
    if (!organization) {
        throw new ApiError(404, 'Organization not found');
    }
    
    if (!organization.admins.includes(req.user._id)) {
        throw new ApiError(403, 'Only admins can create courses');
    }
    
    // Create course
    const course = new Course({
        name,
        description,
        organization: req.params.orgId,
        teachers: teachers || [],
        students: [],
        pendingStudents: []
    });
    
    await course.save();

    // Add course to organization
    organization.courses.push(course._id);
    await organization.save();

    // Fetch populated course
    const populatedCourse = await Course.findById(course._id)
        .populate('sections')
        .populate('teachers', 'name email');

    res.status(201).json(
        new ApiResponse(
            201, 
            populatedCourse, 
            'Course created successfully'
        )
    );
});

// Update course details
export const updateCourse = asyncHandler(async (req, res) => {
    const { name, description, teachers } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (!course.teachers.includes(req.user._id)) {
        throw new ApiError(403, 'Only teachers of this course can update this course');
    }

    course.name = name;
    course.description = description;
    course.teachers = teachers;
    await course.save();
    // Populate the course with the teachers and sections
    const populatedCourse = await Course.findById(course._id)
        .populate('sections')
        .populate('teachers', 'name email');
    res.status(200).json(new ApiResponse(200, populatedCourse, 'Course updated successfully'));
});

// Delete a course
export const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    if (!course.teachers.includes(req.user._id)) {
        throw new ApiError(403, 'Only teachers of this course can delete this course');
    }
    await course.deleteOne();
    await User.updateMany({ courses: req.params.courseId }, { $pull: { courses: req.params.courseId } });
    await Section.updateMany({ course: req.params.courseId }, { $set: { course: null } });
    await Video.updateMany({ course: req.params.courseId }, { $set: { course: null } });
    await Assignment.updateMany({ course: req.params.courseId }, { $set: { course: null } });

    res.status(200).json(new ApiResponse(200, null, 'Course deleted successfully'));
});

// Get all sections of a course
export const getCourseSections = asyncHandler(async (req, res) => {
    const sections = await Section.find({ course: req.params.courseId })
        .populate({
            path: 'videos',
            select: 'title url'  // Select only the fields we need
        });
        // console.log("sections are ",sections);
    res.status(200).json(new ApiResponse(200, sections, 'Course sections fetched successfully'));
});

export const getCourseStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ courses: req.params.courseId,role:"student" })
        // console.log("sections are ",students);
    res.status(200).json(new ApiResponse(200, students, 'Course students fetched successfully'));
});

// Request to join a course
export const requestToJoinCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    // console.log("sdkb",course);
    if (!course) {
        throw new ApiError(404, 'Organization not found');
    }

    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'super_admin') {
        throw new ApiError(403, 'Only students can join organizations');
    }

    // Check if user is already a student
    const isStudent = course.students?.includes(req.user._id);
    if (isStudent) {
        return res
        .status(400)
        .json(new ApiResponse(
            400,
            {
            success:'false',
            message: 'You are already a part of this course'
            },
             'You are already a part of this course'
        ))
    }

    const existingRequest = await CourseEnrollmentRequest.findOne({
        user: req.user._id,
        course: course._id,
        status: 'pending'
    });
    // if(existingRequest)console.log("request is ",existingRequest);
    if (existingRequest) {
        return res
        .status(200)
        .json(new ApiResponse(
            400,
            {
            success:'false',
            message: 'Already have a pending request for this course'
            },
             'Already have a pending request for this course'
        ))
        // throw new ApiError(400, 'You already have a pending request for this course');
    }

    // Create new enrollment request
    const CourseenrollmentRequest = await CourseEnrollmentRequest.create({
        user: req.user._id,
        course: course._id,
        requestedAt: new Date()
    });
    
    console.log("request to join is ",CourseenrollmentRequest);

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { 
                CourseenrollmentRequest: CourseenrollmentRequest._id,
                status: 'pending'
            },
            'Enrollment request sent successfully'
        ));
});

export const acceptRequest = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    // console.log("sdkb",course);
    if (!course) {
        throw new ApiError(404, 'Organization not found');
    }
    // console.log("approving request");
    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'super_admin') {
        throw new ApiError(403, 'Only students can join organizations');
    }
    // Check if user is already a student
    const isStudent = course.students?.includes(req.user._id);
    // if(isStudent)console.log("already exists ");
    if (isStudent) {
        return res
        .status(400)
        .json(new ApiResponse(
            400,
            {
            success:'false',
            message: 'You are already a part of this course'
            },
             'You are already a part of this course'
        ))
    }


    const student = await User.findById(req.user._id);
    student.courses.push(course._id);
    await student.save();
    course.students.push(student._id);
    
    await course.save();
   
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { 
                status: 'done'
            },
            'request accepted'
        ));
});

export const approveEnrollment = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    const studentId = req.body.studentId;
    if (!course.pendingStudents.includes(studentId)) {
        throw new ApiError(400, 'Student has not requested to join this course');
    }

    if (!course.teachers.includes(req.user._id)) {
        throw new ApiError(403, 'Only teachers of this course can approve enrollment');
    }

    // Remove from pending and add to students
    course.pendingStudents = course.pendingStudents.filter(id => id.toString() !== studentId);
    course.students.push(studentId);
    await course.save();

    const student = await User.findById(studentId);
    student.courses.push(course._id);
    await student.save();

    res.status(200).json(new ApiResponse(200, null, 'Student enrollment approved successfully'));
});

// Reject student enrollment
export const rejectEnrollment = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    const studentId = req.body.studentId;
    if (!course.pendingStudents.includes(studentId)) {
        throw new ApiError(400, 'Student has not requested to join this course');
    }  

    course.pendingStudents = course.pendingStudents.filter(id => id.toString() !== studentId);
    await course.save();

    res.status(200).json(new ApiResponse(200, null, 'Student enrollment rejected successfully'));
});

export const getMyEnrolledCourses = asyncHandler(async (req, res) => {
    // Get the courses by populating the courses field from the user object
    const user = await User.findById(req.user._id)
        .populate({
            path: 'courses',
            select: 'name description organization teachers students',
            populate: [
                {
                    path: 'organization',
                    select: 'name slug logo'
                },
                {
                    path: 'teachers',
                    select: 'name email'
                }
            ]
        });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            user.courses,
            'Enrolled courses fetched successfully'
        )
    );
});

export const getNotMyEnrolledCourses = asyncHandler(async (req, res) => {
    // Get the courses by populating the courses field from the user object
    const user = await User.findById(req.user._id)
        .populate({
            path: 'courses',
            select: 'name description organization teachers students'
        });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const notJoinedCourses = await Course.find({ _id: { $nin: user.courses } });    

    res.status(200).json(
        new ApiResponse(
            200,
            notJoinedCourses,
            'Not joined courses fetched successfully'
        )
    );
});

export const getNotMyEnrolledCoursesByOrgId = asyncHandler(async (req, res) => {
    const { orgId } = req.params;

    // Retrieve courses for the given organization
    const courses = await Course.find({ organization: orgId });
    
    // Retrieve the user and populate their courses
    const user = await User.findById(req.user._id).populate({
        path: 'courses',
        select: 'name description organization teachers students pendingStudents'
    });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    // Filter courses where the user is neither enrolled nor pending enrollment
    const notJoinedCourses = courses.filter(course => {
        const isEnrolled = user.courses.some(userCourse => userCourse._id.toString() === course._id.toString());
        const isPending = course.pendingStudents && course.pendingStudents.some(studentId => studentId.toString() === req.user._id.toString());
        return !isEnrolled && !isPending;
    });

    res.status(200).json(new ApiResponse(200, notJoinedCourses, 'Not joined courses fetched successfully'));
});

