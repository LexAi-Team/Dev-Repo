import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { CollaboratorRole, CaseStatus, CasePriority, CaseType } from "@prisma/client";
import { z } from "zod";

const router = Router();

// Protect all cases workspace routes for LAWYER role only
router.use(requireAuth, requireRole("LAWYER"));

const caseCreateSchema = z.object({
  title: z.string().min(1),
  caseNumber: z.string().min(1),
  description: z.string().optional(),
  caseType: z.enum([
    CaseType.CRIMINAL,
    CaseType.CIVIL,
    CaseType.CORPORATE,
    CaseType.CONSTITUTIONAL,
    CaseType.INTELLECTUAL_PROPERTY,
    CaseType.FAMILY,
    CaseType.OTHER,
  ]),
  priority: z.enum([
    CasePriority.LOW,
    CasePriority.MEDIUM,
    CasePriority.HIGH,
    CasePriority.URGENT,
  ]).optional(),
  court: z.string().min(1),
  clientName: z.string().min(1),
  opposingParty: z.string().min(1),
  nextHearingAt: z.string().datetime().optional().nullable(),
});

const collaboratorAddSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum([
    CollaboratorRole.LEAD_LAWYER,
    CollaboratorRole.ASSOCIATE,
    CollaboratorRole.JUNIOR,
    CollaboratorRole.CONSULTANT,
    CollaboratorRole.VIEWER,
  ]),
});

// Helper: Check case access
async function getCollaboratorRecord(caseId: string, userId: string) {
  return await prisma.caseCollaborator.findUnique({
    where: {
      caseId_userId: {
        caseId,
        userId,
      },
    },
  });
}

// GET /api/cases
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const cases = await prisma.case.findMany({
      where: {
        collaborators: {
          some: { userId },
        },
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { cases } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const parseResult = caseCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid case data.",
        errors: parseResult.error.errors,
      });
    }

    const caseData = parseResult.data;

    // Check unique case number
    const existing = await prisma.case.findUnique({
      where: { caseNumber: caseData.caseNumber },
    });
    if (existing) {
      return res.status(409).json({
        status: "fail",
        message: `Case number ${caseData.caseNumber} already exists.`,
      });
    }

    const newCase = await prisma.$transaction(async (tx) => {
      const createdCase = await tx.case.create({
        data: {
          ...caseData,
          nextHearingAt: caseData.nextHearingAt ? new Date(caseData.nextHearingAt) : null,
          createdById: userId,
        },
      });

      // Automatically add creator as LEAD_LAWYER collaborator
      await tx.caseCollaborator.create({
        data: {
          caseId: createdCase.id,
          userId,
          role: CollaboratorRole.LEAD_LAWYER,
        },
      });

      return createdCase;
    });

    res.status(201).json({ status: "success", data: { case: newCase } });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You are not a collaborator on this case.",
      });
    }

    const caseDetails = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatarUrl: true },
            },
          },
        },
        tasks: true,
        events: true,
      },
    });

    res.status(200).json({ status: "success", data: { case: caseDetails, role: collab.role } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cases/:id
router.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You are not a collaborator on this case.",
      });
    }

    // Role restriction: Only LEAD_LAWYER and ASSOCIATE can modify case details
    if (collab.role !== CollaboratorRole.LEAD_LAWYER && collab.role !== CollaboratorRole.ASSOCIATE) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You do not have edit rights for this case.",
      });
    }

    const updateSchema = caseCreateSchema.partial().extend({
      status: z.enum([
        CaseStatus.ACTIVE,
        CaseStatus.PENDING,
        CaseStatus.DISPOSED,
        CaseStatus.ARCHIVED,
      ]).optional(),
    });

    const parseResult = updateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid update data.",
        errors: parseResult.error.errors,
      });
    }

    const updateData = parseResult.data;

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        ...updateData,
        nextHearingAt: updateData.nextHearingAt ? new Date(updateData.nextHearingAt) : undefined,
      },
    });

    res.status(200).json({ status: "success", data: { case: updatedCase } });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/collaborators
router.get("/:id/collaborators", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You are not authorized to view collaborators.",
      });
    }

    const collaborators = await prisma.caseCollaborator.findMany({
      where: { caseId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    res.status(200).json({ status: "success", data: { collaborators } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/collaborators
router.post("/:id/collaborators", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const requesterCollab = await getCollaboratorRecord(caseId, userId);
    if (!requesterCollab || requesterCollab.role !== CollaboratorRole.LEAD_LAWYER) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: Only Lead Lawyers can manage collaborators.",
      });
    }

    const parseResult = collaboratorAddSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid collaborator input.",
        errors: parseResult.error.errors,
      });
    }

    const { userEmail, role } = parseResult.data;

    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!targetUser) {
      return res.status(404).json({
        status: "fail",
        message: `User with email ${userEmail} not found in LEXCONNECT database.`,
      });
    }

    // Check if already a collaborator
    const existingCollab = await getCollaboratorRecord(caseId, targetUser.id);
    if (existingCollab) {
      return res.status(409).json({
        status: "fail",
        message: "User is already a collaborator on this case.",
      });
    }

    const collaborator = await prisma.caseCollaborator.create({
      data: {
        caseId,
        userId: targetUser.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatarUrl: true },
        },
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: "COLLABORATOR_ADDED",
        title: "Added to Case Team",
        message: `You were added as a ${role} on the case: ${caseId}`,
        relatedEntityType: "CASE",
        relatedEntityId: caseId,
      },
    });

    res.status(201).json({ status: "success", data: { collaborator } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/collaborators/:userId
router.delete("/:id/collaborators/:userId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const targetUserId = req.params.userId;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const requesterCollab = await getCollaboratorRecord(caseId, userId);
    if (!requesterCollab || requesterCollab.role !== CollaboratorRole.LEAD_LAWYER) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: Only Lead Lawyers can remove collaborators.",
      });
    }

    if (userId === targetUserId) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot remove yourself. Hand over ownership or delete the case file instead.",
      });
    }

    await prisma.caseCollaborator.delete({
      where: {
        caseId_userId: {
          caseId,
          userId: targetUserId,
        },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Collaborator removed from case file.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/documents - List case documents
router.get("/:id/documents", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const documents = await prisma.caseDocument.findMany({
      where: { caseId },
      include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { documents } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/documents - Upload case document metadata
router.post("/:id/documents", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const documentSchema = z.object({
      name: z.string().min(1),
      fileUrl: z.string().min(1),
      fileType: z.string().default("DOCUMENT"),
      fileSize: z.number().int().default(1024),
    });

    const parseResult = documentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid document data.", errors: parseResult.error.errors });
    }

    const { name, fileUrl, fileType, fileSize } = parseResult.data;

    const document = await prisma.caseDocument.create({
      data: {
        caseId,
        name,
        fileUrl,
        fileType,
        fileSize,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ status: "success", data: { document } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/documents/:documentId - Delete case document
router.delete("/:id/documents/:documentId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const doc = await prisma.caseDocument.findUnique({ where: { id: documentId } });
    if (!doc || doc.caseId !== caseId) return res.status(404).json({ status: "fail", message: "Document not found." });

    await prisma.caseDocument.delete({ where: { id: documentId } });

    res.status(200).json({ status: "success", message: "Document removed." });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/notes - List case notes
router.get("/:id/notes", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const notes = await prisma.caseNote.findMany({
      where: {
        caseId,
        OR: [
          { isPrivate: false },
          { createdById: userId },
        ],
      },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { notes } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/notes - Add case note
router.post("/:id/notes", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const noteSchema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      isPrivate: z.boolean().default(true),
    });

    const parseResult = noteSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid note data.", errors: parseResult.error.errors });
    }

    const { title, content, isPrivate } = parseResult.data;

    const note = await prisma.caseNote.create({
      data: {
        caseId,
        title,
        content,
        isPrivate,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ status: "success", data: { note } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/notes/:noteId - Delete case note
router.delete("/:id/notes/:noteId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const noteId = req.params.noteId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const note = await prisma.caseNote.findUnique({ where: { id: noteId } });
    if (!note || note.caseId !== caseId) return res.status(404).json({ status: "fail", message: "Note not found." });

    if (note.createdById !== userId && collab.role !== CollaboratorRole.LEAD_LAWYER) {
      return res.status(403).json({ status: "fail", message: "Access Denied: Only note author or Lead Lawyer can delete this note." });
    }

    await prisma.caseNote.delete({ where: { id: noteId } });

    res.status(200).json({ status: "success", message: "Note removed." });
  } catch (error) {
    next(error);
  }
});

export default router;
