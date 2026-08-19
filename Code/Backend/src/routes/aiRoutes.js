import express from 'express';
import aiController from '../controllers/aiController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticateJWT);

router.get('/questions', aiController.getQuestionsByCategory);
router.get('/questions/:category', aiController.getQuestionsByCategory);
router.post('/generate-summary', aiController.generateSummary);
router.post('/generate-checklist', aiController.generateChecklist);
router.post('/procedure-guide', aiController.generateProcedureGuide);

export default router;
