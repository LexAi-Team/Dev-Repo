import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { z } from "zod";

const router = Router();

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  university: z.string().min(1, "University cannot be empty").max(150).optional(),
  course: z.string().min(1, "Course cannot be empty").max(100).optional(),
  yearOfStudy: z.number().int().min(1).max(5).optional(),
  interests: z.string().max(300).optional(),
  bio: z.string().max(1000).optional(),
  specialization: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  professionalTitle: z.string().optional(),
  enrollmentNumber: z.string().optional(),
}).strict();

// GET /api/users/me
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        lawyerProfile: true,
      },
    });

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/users/me
router.patch("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const parseResult = userUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid update payload.",
        errors: parseResult.error.errors,
      });
    }

    const {
      name,
      avatarUrl,
      university,
      course,
      yearOfStudy,
      interests,
      bio,
      specialization,
      experienceYears,
      location,
      professionalTitle,
      enrollmentNumber,
    } = parseResult.data;

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          avatarUrl: avatarUrl === null ? null : avatarUrl || undefined,
        },
      });

      if (updatedUser.role === "STUDENT") {
        await tx.studentProfile.upsert({
          where: { userId },
          create: {
            userId,
            university: university || "Law School",
            course: course || "LL.B",
            yearOfStudy: yearOfStudy || 1,
            interests: interests || null,
            bio: bio || null,
          },
          update: {
            university: university || undefined,
            course: course || undefined,
            yearOfStudy: yearOfStudy || undefined,
            interests: interests !== undefined ? interests : undefined,
            bio: bio !== undefined ? bio : undefined,
          },
        });
      } else if (updatedUser.role === "LAWYER") {
        await tx.lawyerProfile.upsert({
          where: { userId },
          create: {
            userId,
            specialization: specialization || "General Practice",
            experienceYears: experienceYears || 0,
            location: location || "India",
            professionalTitle: professionalTitle || "Advocate",
            enrollmentNumber: enrollmentNumber || "N/A",
            bio: bio || null,
          },
          update: {
            specialization: specialization || undefined,
            experienceYears: experienceYears || undefined,
            location: location || undefined,
            professionalTitle: professionalTitle || undefined,
            enrollmentNumber: enrollmentNumber || undefined,
            bio: bio !== undefined ? bio : undefined,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: {
          studentProfile: true,
          lawyerProfile: true,
        },
      });
    });

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    next(error);
  }
});

export default router;
