import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads/temp');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename prefixing with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_SIZE // default 10MB limit
  }
});

// Helper to get absolute path from file URL/key
const getFilePath = (fileUrl) => {
  // If stored as relative/absolute name, resolve it
  const filename = path.basename(fileUrl);
  return path.join(UPLOAD_DIR, filename);
};

// Instantly delete file physically
const deletePhysicalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Physically deleted temporary file: ${filePath}`);
      return true;
    }
  } catch (error) {
    logger.error(`Failed to delete file physically: ${filePath}`, { error: error.message });
  }
  return false;
};

export { upload, getFilePath, deletePhysicalFile, UPLOAD_DIR };

export default {
  upload,
  getFilePath,
  deletePhysicalFile,
  UPLOAD_DIR
};
