import cloudinary from '../config/cloudinary.js';

// Uploads an in-memory buffer straight to Cloudinary via a stream —
// no temp files touch disk, works well with multer's memoryStorage.
export function uploadBufferToCloudinary(buffer, folder, resourceType = 'image') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}