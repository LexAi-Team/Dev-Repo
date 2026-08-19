import cron from 'node-cron';
import fileService from './fileService.js';
import logger from '../utils/logger.js';
import prisma from '../prisma/client.js';

const { getFilePath, deletePhysicalFile } = fileService;

const startCleanupJob = () => {
  // Cron schedule: runs every 60 seconds (every minute)
  cron.schedule('* * * * *', async () => {
    logger.info('[Cron] Checking for expired temporary documents...');
    try {
      const now = new Date();

      // Find files that have expired and are still marked as Uploaded
      const expiredDocuments = await prisma.document.findMany({
        where: {
          expires_at: { lt: now },
          status: 'Uploaded'
        }
      });

      if (!expiredDocuments || expiredDocuments.length === 0) return;

      logger.info(`[Cron] Found ${expiredDocuments.length} expired document(s). Cleaning up...`);

      for (const doc of expiredDocuments) {
        const pathOnDisk = getFilePath(doc.file_url);

        // 1. Physically delete file
        deletePhysicalFile(pathOnDisk);

        // 2. Update database status to Expired
        await prisma.document.update({ where: { document_id: doc.document_id }, data: { status: 'Expired' } });

        logger.info(`[Cron] Marked document ID ${doc.document_id} ('${doc.file_name}') as Expired`);
      }
    } catch (error) {
      logger.error('[Cron Error] File cleanup task failed:', { error: error.message });
    }
  });

  logger.info('[Cron] Expired files cleanup service initialized (Runs every 60s)');
};

export { startCleanupJob };

export default {
  startCleanupJob
};
