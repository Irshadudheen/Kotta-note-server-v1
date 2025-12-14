import multer from 'multer';
import { MAX_FILE_SIZE } from '../constants/common.constants.js';
// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, validation will be done in controller
    cb(null, true);
  },
});