import multer from 'multer';

const storage = multer.memoryStorage();

// Reject uploads above this size before they're ever buffered into memory,
// separate from the compression step in uploadImageService — this is
// about not letting an oversized file sit in server RAM at all, not about
// storage size.
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
});
