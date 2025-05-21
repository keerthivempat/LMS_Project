import fs from "fs";
// utils/cloudinary.js
import cloudinaryPkg from 'cloudinary';
const { v2: cloudinary } = cloudinaryPkg;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folderPath = '') => {
    try {  
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
                folder: folderPath
            }
        );
        console.log("File uploaded to cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        console.log("successfull file upload ");
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("failed upload for me",error);
        return null;
    }
}

export { uploadOnCloudinary };