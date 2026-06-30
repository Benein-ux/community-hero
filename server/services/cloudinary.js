import { v2 as cloudinary } from "cloudinary";

export async function uploadImage(base64Image, mimeType = "image/jpeg") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const result = await cloudinary.uploader.upload(`data:${mimeType};base64,${base64Image}`, {
    folder: "community-hero/issues",
    transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
  });
  return result.secure_url;
}