import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configure cloudinary. Copy the code from clouinary account
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer returns us the file path of the server's local storage
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded on cloudinary. File src: " + response.url);
    // once the file is uploaded we would like to delete from our server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // if there is an error, delete the file from the local storage
    return null;
  }
};

export { uploadOnCloudinary };
