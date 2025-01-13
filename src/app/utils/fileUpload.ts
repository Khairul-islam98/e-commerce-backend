import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "../config/cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
});

export const fileUpload = multer({ storage: storage });
