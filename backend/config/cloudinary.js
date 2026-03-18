import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured } from '../utils/imageFallback.js';

const connectCloudinary = async () => {
    if (!isCloudinaryConfigured()) {
        console.warn('Cloudinary is not configured. Image uploads will use placeholders.')
        return
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    });

}

export default connectCloudinary;
