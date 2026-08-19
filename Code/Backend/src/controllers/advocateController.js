import prisma from '../prisma/client.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { comparePassword, generateToken } from '../utils/authUtils.js';
import fileService from '../services/fileService.js';
import fs from 'fs';
import logger from '../utils/logger.js';

const { getFilePath, deletePhysicalFile } = fileService;

// Advocate Login
const login = catchAsync(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    throw new AppError('Must provide password and either email or phone', 400);
  }

  // Find advocate
  const user = await prisma.user.findFirst({
    where: {
      AND: [email ? { email } : { phone }, { role: 'Advocate' }]
    },
    include: { advocate_profile: true }
  });

  if (!user || !user.advocate_profile) {
    throw new AppError('Invalid login credentials', 401);
  }

  // Compare passwords
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new AppError('Invalid login credentials', 401);

  // Generate JWT Token
  const token = generateToken({
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    advocate_id: user.advocate_profile.advocate_id
  });

  res.json({
    message: 'Advocate login successful',
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      advocate_id: user.advocate_profile.advocate_id
    }
  });
});

// View Cases scoped to Advocate (Assigned to them or Unassigned but 'Saved')
const viewCases = catchAsync(async (req, res) => {
  const advocate_id = req.user.advocate_id;

  // Fetch cases where assigned to this advocate OR unassigned saved cases (available to pick up)
  const cases = await prisma.case.findMany({
    where: {
      OR: [
        { advocate_id: advocate_id },
        { AND: [{ advocate_id: null }, { status: 'Saved' }] }
      ]
    },
    include: {
      questions_answers: true,
      checklist_items: true,
      documents: true,
      citizen: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json(cases);
});

// Claim an unassigned case
const claimCase = catchAsync(async (req, res) => {
  const advocate_id = req.user.advocate_id;
  const case_id = parseInt(req.params.case_id);

  const caseRecord = await prisma.case.findUnique({ where: { case_id } });

  if (!caseRecord) throw new AppError('Case not found', 404);

  if (caseRecord.advocate_id !== null && caseRecord.advocate_id !== advocate_id) {
    throw new AppError('Case is already claimed by another advocate', 400);
  }

  // Update status to UnderReview and assign advocate
  const updatedCase = await prisma.case.update({
    where: { case_id },
    data: { advocate_id: advocate_id, status: 'UnderReview' },
    include: { questions_answers: true, checklist_items: true }
  });

  res.json({ message: 'Case claimed successfully', case: updatedCase });
});

// Request a new document (Creates a checklist item)
const requestDocument = catchAsync(async (req, res) => {
  const { case_id, item_label, list_type } = req.body;

  if (!case_id || !item_label) throw new AppError('Missing required parameters: case_id, item_label', 400);

  const type = list_type || 'Required_Document';
  if (!['Required_Document', 'Evidence'].includes(type)) throw new AppError('Invalid checklist list_type', 400);

  // Check case ownership
  const caseRecord = await prisma.case.findUnique({ where: { case_id: parseInt(case_id) } });
  if (!caseRecord) throw new AppError('Case not found', 404);

  // Add required document request to checklist items
  const checklistItem = await prisma.checklistItem.create({
    data: { case_id: parseInt(case_id), list_type: type, item_label, is_collected: false }
  });

  res.status(201).json(checklistItem);
});

// Upload document (Available for both Citizen and Advocate)
const uploadDocument = catchAsync(async (req, res) => {
  const case_id = parseInt(req.params.case_id);
  const uploaded_by = req.user.user_id;
  const { category, checklist_item_id } = req.body;

  if (!req.file) throw new AppError('No file uploaded', 400);

  // Verify case exists
  const caseRecord = await prisma.case.findUnique({ where: { case_id } });
  if (!caseRecord) {
    // Clean up uploaded file since case is missing
    deletePhysicalFile(req.file.path);
    throw new AppError('Case not found', 404);
  }

  const expiryMinutes = parseInt(process.env.UPLOAD_EXPIRY_MINUTES || '5', 10);
  const expires_at = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const document = await prisma.$transaction(async (tx) => {
    const doc = await tx.document.create({
      data: {
        case_id,
        uploaded_by,
        file_name: req.file.originalname,
        file_url: req.file.filename, // Store filename key
        category: category || 'Evidence',
        expires_at,
        status: 'Uploaded'
      }
    });

    // If linking to a checklist item, update it
    if (checklist_item_id) {
      await tx.checklistItem.update({ where: { checklist_item_id: parseInt(checklist_item_id) }, data: { is_collected: true, linked_document_id: doc.document_id } });
    }

    return doc;
  });

  res.status(201).json({ message: `Document uploaded successfully. It will expire in ${expiryMinutes} minutes.`, document });
});

// Download document (Triggers instant filesystem delete)
const downloadDocument = catchAsync(async (req, res) => {
  const document_id = parseInt(req.params.document_id);

  const doc = await prisma.document.findUnique({ where: { document_id }, include: { case: true } });
  if (!doc) throw new AppError('Document not found', 404);

  if (doc.status === 'Downloaded') throw new AppError('This file has already been downloaded and purged from temporary storage', 410);
  if (doc.status === 'Expired') throw new AppError('This temporary file has expired and been deleted', 410);

  const filePath = getFilePath(doc.file_url);

  if (!fs.existsSync(filePath)) {
    // Sync DB state if file disappeared
    await prisma.document.update({ where: { document_id }, data: { status: 'Expired' } });
    throw new AppError('Physical file not found. Marked as Expired.', 404);
  }

  // Set headers to trigger download in browser/client
  res.setHeader('Content-Disposition', `attachment; filename=\"${doc.file_name}\"`);
  res.setHeader('Content-Type', 'application/octet-stream');

  // Stream the file and delete instantly on completion
  res.download(filePath, doc.file_name, async (err) => {
    if (err) {
      logger.error('Error during file transfer:', err);
      if (!res.headersSent) {
        throw new AppError('Error downloading file', 500);
      }
    } else {
      logger.info(`Document ID ${document_id} downloaded successfully. Deleting from disk...`);

      // Instant deletion on download
      deletePhysicalFile(filePath);

      // Update database status
      await prisma.document.update({ where: { document_id }, data: { status: 'Downloaded', expires_at: null } });
    }
  });
});

export default {
  login,
  viewCases,
  claimCase,
  requestDocument,
  uploadDocument,
  downloadDocument
};
