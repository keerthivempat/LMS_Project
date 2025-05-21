import { Organization, User, Course, EnrollmentRequest } from '../models/schema.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all organizations
export const getAllOrganizations = asyncHandler(async (req, res) => {
    const organizations = await Organization.find().select('-admins -courses');
    res.status(200).json(new ApiResponse(200, organizations, 'Organizations fetched successfully'));
});

export const getJoinedOrganizations = asyncHandler(async (req, res) => {
    const organizations = await User.findById(req.user._id).select('organizations');
    res.status(200).json(new ApiResponse(200, organizations, 'Joined organizations fetched successfully'));
});

export const getNotJoinedOrganizations = asyncHandler(async (req, res) => {
    const organizations = await Organization.find().select('-admins -courses');
    const user = await User.findById(req.user._id).select('organizations');
    const notJoinedOrganizations = organizations.filter(org => !user.organizations.includes(org._id));
    res.status(200).json(new ApiResponse(200, notJoinedOrganizations, 'Not joined organizations fetched successfully'));
});

// Get organization by ID
export const getOrganizationById = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.orgId)
        .populate('admins', 'name email')
        .populate('teachers', 'name email')
        .populate('students', 'name email')
        .populate('courses', 'name description');

    if (!organization) {
        throw new ApiError(404, 'Organization not found');
    }

    res.status(200).json(
        new ApiResponse(
            200, 
            organization,
            'Organization details fetched successfully'
        )
    );
});

// Create new organization
export const createOrganization = asyncHandler(async (req, res) => {
    const { name, description, logo, contactDetails } = req.body;
    if (!name) throw new ApiError(400, 'Organization name is required');

    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) throw new ApiError(400, 'Organization already exists');

    const organization = new Organization({
        name, description, logo, contactDetails,
        admins: [req.user._id]
    });
    await organization.save();
    res.status(201).json(new ApiResponse(201, organization, 'Organization created successfully'));
});

// Update organization details
export const updateOrganization = asyncHandler(async (req, res) => {
    const { name, description, logo, contactDetails } = req.body;
    if (!name) throw new ApiError(400, 'Organization name is required');
    console.log("hell");
    const organization = await Organization.findById(req.params.orgId);
    if (!organization) throw new ApiError(404, 'Organization not found');

    if (!organization.admins.includes(req.user._id)) {
        throw new ApiError(403, 'Only admins can update organization details');
    }
    console.log("all details are",contactDetails,logo);
    Object.assign(organization, { name, description, logo, contactDetails });
    await organization.save();
    res.status(200).json(new ApiResponse(200, organization, 'Organization updated successfully'));
});

// Delete organization
export const deleteOrganization = asyncHandler(async (req, res) => {
    // Insert code here
});


// Get courses in an organization
export const getOrganizationCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ organization: req.params.orgId }).select('-students');
    res.status(200).json(new ApiResponse(200, courses, 'Organization courses fetched'));
});

// Get members of an organization
export const getOrganizationMembers = asyncHandler(async (req, res) => {
    const organization = await Organization
        .findById(req.params.orgId)
        .populate({
            path: 'students',
            match: { role: 'student' },
            select: 'name email role'
        });
        console.log("hellow fetching them ....");
    if (!organization) {
        throw new ApiError(404, 'Organization not found');
    }
    console.log('organization students a',organization.students);
    // Filter out any null values that might result from the match condition
    const students = organization.students?.filter(student => student !== null) || [];

    res.status(200).json(
        new ApiResponse(
            200,
            { students },
            'Organization members fetched successfully'
        )
    );
});

// Request to join an organization as a student
export const requestToJoinOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.orgId);
    if (!organization) {
        throw new ApiError(404, 'Organization not found');
    }

    if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user.role === 'super_admin') {
        throw new ApiError(403, 'Only students can join organizations');
    }

    // Check if user is already a student
    const isStudent = organization.students?.includes(req.user._id);
    if (isStudent) {
        throw new ApiError(400, 'You are already a student of this organization');
    }

    // Check if there's already a pending request
    const existingRequest = await EnrollmentRequest.findOne({
        user: req.user._id,
        organization: organization._id,
        status: 'pending'
    });

    if (existingRequest) {
        throw new ApiError(400, 'You already have a pending request for this organization');
    }

    // Create new enrollment request
    const enrollmentRequest = await EnrollmentRequest.create({
        user: req.user._id,
        organization: organization._id,
        requestedAt: new Date()
    });

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { 
                enrollmentRequest: enrollmentRequest._id,
                status: 'pending'
            },
            'Enrollment request sent successfully'
        ));
});

// Approve user request as a student
export const approveUserRequest = asyncHandler(async (req, res) => {
    // Insert code here
});

// Reject user request
export const rejectUserRequest = asyncHandler(async (req, res) => {
    // Insert code here
});
