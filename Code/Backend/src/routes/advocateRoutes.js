import express from 'express';
import advocateController from '../controllers/advocateController.js';
import { authenticateJWT, authorizeAdvocate } from '../middleware/auth.js';
import fileService from '../services/fileService.js';

const { upload } = fileService;
const router = express.Router();

// Public routes
router.post('/login', advocateController.login);

// Protected routes (Advocate only)
router.get('/cases', authenticateJWT, authorizeAdvocate, advocateController.viewCases);
router.post('/cases/:case_id/claim', authenticateJWT, authorizeAdvocate, advocateController.claimCase);
router.post('/cases/request-document', authenticateJWT, authorizeAdvocate, advocateController.requestDocument);
router.post('/cases/:case_id/upload', authenticateJWT, authorizeAdvocate, upload.single('file'), advocateController.uploadDocument);
router.get('/documents/download/:document_id', authenticateJWT, authorizeAdvocate, advocateController.downloadDocument);

export default router;
