import { User} from "../models/schema.model.js";
import {Admin} from "../models/admin.model.js";
import { Organization } from "../models/schema.model.js"; // Adjust path if needed
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import cloudinaryPkg from 'cloudinary';
const { v2: cloudinary } = cloudinaryPkg;

// Create a new organization
const createOrganization = asyncHandler(async (req, res) => {
  const { name, description, contactDetails } = req.body;

  if (!name) {
    throw new ApiError(400, "Organization name is required");
  }

  try {
    // Create the basic organization object
    const organizationData = {
      name,
      description,
      contactDetails: contactDetails ? JSON.parse(contactDetails) : {}
    };

    // Handle logo upload if file exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "eklavya-lms/organizations",
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
        timeout: 120000, // 120 seconds timeout
      });

      // Save the logo URL
      organizationData.logo = result.secure_url;
    }

    // Create the organization
    const organization = await Organization.create(organizationData);

    return res.status(201).json(
      new ApiResponse(201, organization, "Organization created successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to create organization");
  }
});

// Get all organizations
const getAllOrganizations = asyncHandler(async (req, res) => {
  const organizations = await Organization.find();

  return res.status(200).json(
    new ApiResponse(200, organizations, "Organizations retrieved successfully")
  );
});

const fetchAdmins = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  // Validate organization existence (optional but good practice)
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    return res.status(404).json(
      new ApiResponse(404, null, "Organization not found")
    );
  }

  // Fetch admins for this organization, and populate the user field
  const admins = await Admin.find({ organization: organizationId, isActive: true })
    .populate("user", "-password -refreshToken") // Exclude sensitive fields
    .lean();

  return res.status(200).json(
    new ApiResponse(200, admins, "Admins retrieved successfully")
  );
});

// const fetchAdmins = asyncHandler(async (req, res) => {
//   const organizations = await Organization.find();

//   return res.status(200).json(
//     new ApiResponse(200, organizations, "Organizations retrieved successfully")
//   );
// });

// Update organization
const updateOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { name, description, logoUrl, isActive } = req.body;

  const organization = await Organization.findById(organizationId);
  
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  if (name) organization.name = name;
  if (description) organization.description = description;
  if (logoUrl) organization.logoUrl = logoUrl;
  if (isActive !== undefined) organization.isActive = isActive;

  await organization.save();

  return res.status(200).json(
    new ApiResponse(200, organization, "Organization updated successfully")
  );
});

// Delete organization
const deleteOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const organization = await Organization.findById(organizationId);
  
  if (!organization) {
    throw new ApiError(404, "Organization not found");
  }

  await Organization.findByIdAndDelete(organizationId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Organization deleted successfully")
  );
});

// Get super admin dashboard data
const getSuperAdminDashboard = asyncHandler(async (req, res) => {
  // Get counts
  const organizationsCount = await Organization.countDocuments();
  const usersCount = await User.countDocuments();
  const adminsCount = await User.countDocuments({ role: "admin" });
  const teachersCount = await User.countDocuments({ role: "teacher" });
  const studentsCount = await User.countDocuments({ role: "student" });

  // Get recent organizations
  const recentOrganizations = await Organization.find()
    .sort({ createdAt: -1 })
    .limit(5);

  // Get recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email role createdAt");

  return res.status(200).json(
    new ApiResponse(200, {
      stats: {
        organizationsCount,
        usersCount,
        adminsCount,
        teachersCount,
        studentsCount
      },
      recentOrganizations,
      recentUsers
    }, "Super admin dashboard data retrieved successfully")
  );
});

export {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  deleteOrganization,
  getSuperAdminDashboard,
  fetchAdmins
};
