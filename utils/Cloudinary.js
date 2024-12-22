
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadPhoto = async(filePath, folderName) => {
    console.log(filePath, folderName);
    try {
        const result = cloudinary.uploader.upload(filePath, {
            folder: {folderName},
        });
        console.log('Upload Successful:', result);
        return result;
    } 
    catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

module.exports = uploadPhoto;