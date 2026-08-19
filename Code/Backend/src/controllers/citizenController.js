import prisma from '../prisma/client.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils.js';
import { findUserByEmail, createUser } from '../utils/dbUtils.js';
import aiController from './aiController.js';
import logger from '../utils/logger.js';

// Unified Register Endpoint for Citizens and Advocates
const register = catchAsync(async (req, res) => {
  const { name, email, phone, password, role, bar_council_id, practice_area, languages } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new AppError('Missing required registration fields', 400);
  }

  if (role !== 'Citizen' && role !== 'Advocate') {
    throw new AppError('Role must be Citizen or Advocate', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }]
    }
  });

  if (existingUser) {
    throw new AppError('User with this email or phone number already exists', 409);
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create User (and Advocate profile if role = Advocate)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone,
        password_hash,
        role
      }
    });

    if (role === 'Advocate') {
      if (!bar_council_id || !practice_area || !languages) {
        throw new AppError('Advocate profile fields (bar_council_id, practice_area, languages) are required', 400);
      }

      await tx.advocate.create({
        data: {
          user_id: user.user_id,
          bar_council_id,
          practice_area,
          languages,
          verification_status: 'Pending'
        }
      });
    }

    return user;
  });

  // Generate JWT Token
  const token = generateToken(result);

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      phone: result.phone,
      role: result.role
    }
  });
});

// Citizen Login
const login = catchAsync(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    throw new AppError('Must provide password and either email or phone', 400);
  }

  // Find citizen
  const user = await prisma.user.findFirst({
    where: {
      AND: [email ? { email } : { phone }, { role: 'Citizen' }]
    }
  });

  if (!user) throw new AppError('Invalid login credentials', 401);

  // Compare passwords
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new AppError('Invalid login credentials', 401);

  // Generate JWT Token
  const token = generateToken(user);

  res.json({
    message: 'Citizen login successful',
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// Create or Save Citizen Case (Supports Draft or Saved status)
const saveCase = catchAsync(async (req, res) => {
  const citizen_id = req.user.user_id;
  const { category, sub_issue, status, answers } = req.body;

  if (!category || !sub_issue || !answers || !Array.isArray(answers)) {
    throw new AppError('Missing required case fields or answers format', 400);
  }

  // Check CaseStatus (Draft, Saved, UnderReview)
  const caseStatus = status || 'Draft';
  if (!['Draft', 'Saved', 'UnderReview'].includes(caseStatus)) {
    throw new AppError('Invalid case status', 400);
  }

  // 1. Compile answers map for summary generation
  const answersMap = {};
  answers.forEach((ans) => {
    answersMap[ans.question_key] = ans.answer_value;
  });

  // 2. Generate AI Summary (Mock) via aiController helper if needed
  let aiSummary = '';
  if (category === 'Theft') {
    const date = answersMap.incident_date || 'an unspecified date';
    const loc = answersMap.location || 'an unknown location';
    const suspect = answersMap.know_suspect === 'true' || answersMap.know_suspect === true ? 'is known' : 'is unknown';
    const imei = answersMap.imei_number ? ` (IMEI: ${answersMap.imei_number})` : '';
    aiSummary = `The citizen reports that a theft of '${sub_issue}' occurred on ${date} at ${loc}. The suspect ${suspect}. Stolen item details${imei}.`;
  } else if (category === 'Property Dispute') {
    const deed = answersMap.has_sale_deed === 'true' || answersMap.has_sale_deed === true ? 'possesses' : 'does not possess';
    const patta = answersMap.has_patta === 'true' || answersMap.has_patta === true ? 'is' : 'is not';
    const reg = answersMap.is_registered === 'true' || answersMap.is_registered === true ? 'registered' : 'unregistered';
    aiSummary = `Property dispute concerning '${sub_issue}'. The citizen ${deed} the Sale Deed. Patta ${patta} available. The property is currently ${reg}.`;
  } else {
    const formatted = Object.entries(answersMap).map(([k, v]) => `${k}: ${v}`).join(', ');
    aiSummary = `The citizen has filed a case under '${category}' for the issue '${sub_issue}'. Case details: ${formatted}.`;
  }

  // 3. Get Category Config for Procedure Guide and Checklist Items
  const categoryConfig = aiController.categoryData[category] || aiController.categoryData['Other'];
  const procedureGuideText = categoryConfig.procedure.join(' → ');

  // 4. Create case, questions, and checklist items inside transaction
  const caseRecord = await prisma.$transaction(async (tx) => {
    // Create Case
    const caseRecord = await tx.case.create({
      data: {
        citizen_id,
        category,
        sub_issue,
        status: caseStatus,
        ai_summary: aiSummary,
        procedure_guide: procedureGuideText
      }
    });

    // Create Questions Answers
    await tx.caseQuestionsAnswers.createMany({
      data: answers.map((ans) => ({
        case_id: caseRecord.case_id,
        question_key: ans.question_key,
        question_text: ans.question_text,
        answer_value: String(ans.answer_value)
      }))
    });

    // Create Checklist Items (Required Documents and Evidences)
    const checklistItemsData = [];
    categoryConfig.checklist.required.forEach((item) => {
      checklistItemsData.push({
        case_id: caseRecord.case_id,
        list_type: 'Required_Document',
        item_label: item,
        is_collected: false
      });
    });
    categoryConfig.checklist.evidence.forEach((item) => {
      checklistItemsData.push({
        case_id: caseRecord.case_id,
        list_type: 'Evidence',
        item_label: item,
        is_collected: false
      });
    });

    await tx.checklistItem.createMany({ data: checklistItemsData });

    return caseRecord;
  });

  // For demo convenience, let's auto-assign case to the first available advocate if status is 'Saved'
  if (caseRecord.status === 'Saved') {
    const advocate = await prisma.advocate.findFirst();
    if (advocate) {
      await prisma.case.update({
        where: { case_id: caseRecord.case_id },
        data: { advocate_id: advocate.advocate_id }
      });
      logger.info(`Auto-assigned Case ID ${caseRecord.case_id} to Advocate ID ${advocate.advocate_id}`);
    }
  }

  // Retrieve full newly created case
  const fullCase = await prisma.case.findUnique({
    where: { case_id: caseRecord.case_id },
    include: {
      questions_answers: true,
      checklist_items: true
    }
  });

  res.status(201).json(fullCase);
});

// View Citizen's cases
const viewCases = catchAsync(async (req, res) => {
  const citizen_id = req.user.user_id;

  const cases = await prisma.case.findMany({
    where: { citizen_id },
    include: {
      questions_answers: true,
      checklist_items: true,
      documents: true,
      advocate: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json(cases);
});

// Google OAuth / Single Sign-On Handler
const googleLogin = catchAsync(async (req, res) => {
  const { email, name, role } = req.body;

  if (!email) {
    throw new AppError('Google account email is required', 400);
  }

  const userRole = role === 'advocate' || role === 'Advocate' ? 'Advocate' : 'Citizen';
  const userName = name || email.split('@')[0];

  // Find existing user by email
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Auto-provision user account
    const dummyPasswordHash = await hashPassword(`GoogleAuthSecret_${Date.now()}`);
    const randomPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: userName,
          email,
          phone: randomPhone,
          password_hash: dummyPasswordHash,
          role: userRole
        }
      });

      if (userRole === 'Advocate') {
        await tx.advocate.create({
          data: {
            user_id: newUser.user_id,
            bar_council_id: `BAR/2026/${Math.floor(1000 + Math.random() * 9000)}`,
            practice_area: 'General Legal Practice',
            languages: 'English, Hindi',
            verification_status: 'Verified'
          }
        });
      }

      return newUser;
    });
  }

  // Generate JWT Token
  const token = generateToken(user);

  res.json({
    message: 'Google login successful',
    token,
    user: {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

export default {
  register,
  login,
  googleLogin,
  saveCase,
  viewCases
};

