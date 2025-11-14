import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,    // Your cloud name
  api_key: process.env.CLOUDINARY_API_KEY,          // Your API key  
  api_secret: process.env.CLOUDINARY_API_SECRET,    // Your API secret
});

// Set up storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',  // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Allowed file types
    transformation: [
      { width: 500, height: 500, crop: 'limit' } // Resize images
    ]
  },
});

// Create multer instance with cloudinary storage
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

export default cloudinary;