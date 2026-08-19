import express from 'express';
import citizenController from '../controllers/citizenController.js';
import advocateController from '../controllers/advocateController.js'; // Import uploadDocument
import { authenticateJWT, authorizeCitizen } from '../middleware/auth.js';
import fileService from '../services/fileService.js';

const { upload } = fileService;

const router = express.Router();

// Public routes
router.post('/register', citizenController.register);
router.post('/login', citizenController.login);
router.post('/google-login', citizenController.googleLogin);

// Protected routes (Citizen only)
router.post('/cases', authenticateJWT, authorizeCitizen, citizenController.saveCase);
router.get('/cases', authenticateJWT, authorizeCitizen, citizenController.viewCases);
router.post('/cases/:case_id/upload', authenticateJWT, authorizeCitizen, upload.single('file'), advocateController.uploadDocument);

export default router;
