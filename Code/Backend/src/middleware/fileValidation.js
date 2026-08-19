import fs from 'fs';
import logger from '../utils/logger.js';

export const validateFileType = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    });
  }

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    // Delete the file if invalid
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      logger.error('Failed to delete invalid upload', { error: err.message });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Allowed: PDF, Word, Excel, JPEG, PNG'
    });
  }

  next();
};
