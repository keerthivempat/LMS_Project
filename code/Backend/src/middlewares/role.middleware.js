import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user || !req.user.role) {
            throw new ApiError(401, "You must be logged in to access this route");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(
                403,
                `Role: ${req.user.role} is not allowed to access this resource`
            );
        }

        next();
    });
};

export const isAdmin = asyncHandler(async (req, res, next) => {
  console.log("req.user.role is for me",req.user.role);
    // If user is superadmin, allow access without checking admin records
    if (req.user.role === "superadmin") {
      return next();
    }
    
    // For users with admin role, verify they have at least one active admin record
    if (req.user.role === "admin") {
      const adminExists = await Admin.findOne({
        user: req.user._id,
        isActive: true
      });
      
      if (!adminExists) {
        throw new ApiError(403, "Your admin privileges have been revoked");
      }
    } else {
      throw new ApiError(403, "You are not authorized to access this resource");
    }
    
    next();
  });
  
export const isSuperAdmin = asyncHandler(async (req, res, next) => {
    console.log("req.user.role is ",req.user.role);
    if (req.user.role !== "superadmin") {
      throw new ApiError(403, "Only super admins can access this resource");
    }
    next();
  });
  
export const isTeacher = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "teacher" && req.user.role !== "admin" && req.user.role !== "superadmin") {
      throw new ApiError(403, "You are not authorized to access this resource");
    }
    next();
  });
  
export const isAdminForOrg = asyncHandler(async (req, res, next) => {
    const { organizationId } = req.params;
    
    if (!organizationId) {
      throw new ApiError(400, "Organization ID is required");
    }
  
    // Super admins can access all organizations
    if (req.user.role === "superadmin") {
      return next();
    }
  
    // Check if user is admin for this organization
    const admin = await Admin.findOne({
      user: req.user._id,
      organization: organizationId,
      isActive: true
    });
  
    if (!admin) {
      throw new ApiError(403, "You are not an admin for this organization");
    }
  
    next();
  });
