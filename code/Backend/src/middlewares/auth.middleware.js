import jwt from "jsonwebtoken";
import { User }  from '../models/schema.model.js';
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    // console.log(req);
    try {
        const accessToken = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "Access token is required");
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "User not found");
        }
        
        // Check if user account is active
        if (!user.isActive) {
            throw new ApiError(401, "User account has been deactivated");
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json(new ApiResponse(401, null, "Invalid token"));
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json(new ApiResponse(401, null, "Token has expired"));
        } else if (error instanceof ApiError) {
            return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
        }
        return res.status(401).json(new ApiResponse(401, null, "Authentication failed"));
    }
});

export { verifyAccessToken }; 
