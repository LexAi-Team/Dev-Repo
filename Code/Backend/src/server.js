import express from 'express';
import cors from 'cors';
import fileCleanup from './services/fileCleanup.js';
import healthRoutes from './routes/healthRoutes.js';
import citizenRoutes from './routes/citizenRoutes.js';
import advocateRoutes from './routes/advocateRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin requests
app.use(cors());

// Parse incoming request JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint (basic)
app.get('/health-basic', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date(), service: 'LEX AI Backend' });
});

// Register routes
app.use('/api/citizens', citizenRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Route aliases for authentication compatibility
app.use('/api/auth/citizen', citizenRoutes);
app.use('/api/auth/advocate', advocateRoutes);

// Start cleanup background cron task
if (fileCleanup && typeof fileCleanup.startCleanupJob === 'function') {
  fileCleanup.startCleanupJob();
} else {
  logger.warn('File cleanup service not available');
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Bind and listen
const server = app.listen(PORT, () => {
  logger.info(`LEX AI Backend Server running on port ${PORT}`);
});

// Handle graceful shutdowns
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
