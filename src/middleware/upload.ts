import multer from 'multer';

import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export const upload = multer({
  storage,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 5,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new ApiError(400, 'Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});
