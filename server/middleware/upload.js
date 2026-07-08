import multer from 'multer';

// Memory storage: files are kept as in-memory Buffers so we can
// (a) send them directly to Whisper / Gemini Vision with no extra network round-trip, and
// (b) manually stream them to Cloudinary for permanent storage.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB — covers short voice notes + photos
});

export default upload;