import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

export const uploadToCloudinary = (
  fileBuffer,
  folder,
  resourceType = 'auto',
  originalFilename
) => {
  return new Promise((resolve, reject) => {
    const safeOriginalName = originalFilename
      ?.replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const extension = originalFilename?.match(/\.[^/.]+$/)?.[0];
    const rawPublicId =
      resourceType === 'raw' && safeOriginalName && extension
        ? `${safeOriginalName}-${Date.now()}${extension.toLowerCase()}`
        : undefined;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: rawPublicId,
        use_filename: Boolean(originalFilename),
        unique_filename: true,
        filename_override: originalFilename,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
