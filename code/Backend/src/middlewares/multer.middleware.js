import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import cloudinaryPkg from 'cloudinary';
const { v2: cloudinary } = cloudinaryPkg;

import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary (add this at the top)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Keep your existing disk storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, file.originalname + "-" + uniqueSuffix);
    }
});

// Add Cloudinary storage for image uploads (after disk storage)
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eklavya-lms/temp",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }]
  }
});

// File filter for assignment uploads (keep your existing)
const fileFilter = (req, file, cb) => {
    // Define allowed mime types for documents
    const allowedMimeTypes = [
        'application/pdf',                                              // PDF
        'application/msword',                                          // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error("Unsupported file type. Please upload PDF or Word documents only."), false);
    }
};

// Multer instance with file type validation for documents (keep existing)
export const documentUpload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// General upload without file type restrictions (keep existing)
export const upload = multer({ storage });

// Add new Cloudinary upload middleware for images
export const imageUpload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for images
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});
