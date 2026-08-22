import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const router = Router();

const syncSchema = z.object({
  role: z.enum([UserRole.STUDENT, UserRole.LAWYER]).optional(),
  name: z.string().min(1).optional(),
  // Onboarding parameters
  university: z.string().min(1).optional(),
  course: z.string().min(1).optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
  specialization: z.string().min(1).optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  enrollmentNumber: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(200).json({
      status: "onboarding_required",
      message: "User profile needs initialization.",
      firebaseInfo: {
        uid: (req as any).firebaseUid,
        email: (req as any).firebaseEmail,
        name: (req as any).firebaseName,
        avatarUrl: (req as any).firebaseAvatarUrl,
      }
    });
  }

  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
});

// POST /api/auth/sync
router.post("/sync", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = syncSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid request payload.",
        errors: parseResult.error.errors,
      });
    }

    const {
      role,
      name,
      university,
      course,
      yearOfStudy,
      specialization,
      experienceYears,
      enrollmentNumber,
      location,
    } = parseResult.data;

    // 1. User already exists in PostgreSQL
    if (req.user) {
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name || req.user.name,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "User profile updated successfully.",
        data: { user: updatedUser },
      });
    }

    // 2. User does not exist yet
    const firebaseUid = (req as any).firebaseUid;
    const email = (req as any).firebaseEmail;
    const defaultName = (req as any).firebaseName || "User";
    const avatarUrl = (req as any).firebaseAvatarUrl || null;

    if (!firebaseUid || !email) {
      return res.status(400).json({
        status: "fail",
        message: "Firebase authentication context not found.",
      });
    }

    // Check if role is supplied. If not, prompt onboarding
    if (!role) {
      return res.status(200).json({
        status: "onboarding_required",
        message: "Role selection is required to finalize registration.",
        firebaseInfo: {
          uid: firebaseUid,
          email,
          name: defaultName,
          avatarUrl,
        }
      });
    }

    // Finalize creation based on selected role
    const finalName = name || defaultName;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firebaseUid,
          email,
          name: finalName,
          role,
          avatarUrl,
        },
      });

      if (role === UserRole.STUDENT) {
        if (!university || !course || yearOfStudy === undefined) {
          throw new Error("Student profile fields (university, course, yearOfStudy) are required.");
        }
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            university,
            course,
            yearOfStudy,
          },
        });
      } else if (role === UserRole.LAWYER) {
        if (!specialization || experienceYears === undefined || !enrollmentNumber || !location) {
          throw new Error("Lawyer profile fields (specialization, experienceYears, enrollmentNumber, location) are required.");
        }
        await tx.lawyerProfile.create({
          data: {
            userId: newUser.id,
            specialization,
            experienceYears,
            enrollmentNumber,
            location,
            professionalTitle: "Advocate",
          },
        });
      }

      // Create initial alert notification
      await tx.notification.create({
        data: {
          userId: newUser.id,
          type: "WELCOME",
          title: "Welcome to LEXCONNECT!",
          message: `Hello ${finalName}, your legal ecosystem profile is verified.`,
        },
      });

      return newUser;
    });

    res.status(201).json({
      status: "success",
      message: "User profile synchronized successfully.",
      data: { user },
    });
  } catch (error: any) {
    if (error.message.includes("required")) {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
