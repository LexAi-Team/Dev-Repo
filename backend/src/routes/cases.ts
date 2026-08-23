import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { CollaboratorRole, CaseStatus, CasePriority, CaseType } from "@prisma/client";
import { z } from "zod";
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import { lexaiService } from "../services/lexai.service.js";

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

    await logCaseActivity(newCase.id, userId, "CREATE_CASE", `Created case: ${newCase.title} (${newCase.caseNumber})`);
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

    await logCaseActivity(caseId, userId, "UPDATE_CASE", `Updated case details`);
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

    await logCaseActivity(caseId, userId, "ADD_COLLABORATOR", `Added team collaborator: ${targetUser.name} (${role})`);
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

    await logCaseActivity(caseId, userId, "REMOVE_COLLABORATOR", `Removed team collaborator: ${targetUserId}`);
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

// POST /api/cases/:id/handoff - Transfer primary responsibility
router.post("/:id/handoff", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const { newOwnerId } = req.body;

    if (req.user?.role !== "LAWYER") {
      return res.status(403).json({ status: "fail", message: "Only advocates can transfer case responsibility." });
    }

    if (!newOwnerId) {
      return res.status(400).json({ status: "fail", message: "newOwnerId is required." });
    }

    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { collaborators: true }
    });

    if (!currentCase) {
      return res.status(404).json({ status: "fail", message: "Case not found." });
    }

    // Verify current user is the owner
    if (currentCase.createdById !== userId) {
      return res.status(403).json({ status: "fail", message: "Only the primary owner can hand off a case." });
    }

    // Verify new owner is an existing collaborator
    const newOwnerCollab = currentCase.collaborators.find(c => c.userId === newOwnerId);
    if (!newOwnerCollab) {
      return res.status(403).json({ status: "fail", message: "New owner must already be a collaborator on this case." });
    }

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // 1. Update case owner
      await tx.case.update({
        where: { id: caseId },
        data: { createdById: newOwnerId }
      });

      // 2. Update former owner collaborator to LEAD_LAWYER if they weren't already
      const previousOwnerCollab = await tx.caseCollaborator.findUnique({
        where: { caseId_userId: { caseId, userId } }
      });
      if (previousOwnerCollab) {
        await tx.caseCollaborator.update({
          where: { id: previousOwnerCollab.id },
          data: { role: "LEAD_LAWYER" }
        });
      } else {
        await tx.caseCollaborator.create({
          data: { caseId, userId, role: "LEAD_LAWYER" }
        });
      }

      // 3. Make new owner LEAD_LAWYER in collaborators (if not already)
      await tx.caseCollaborator.update({
        where: { id: newOwnerCollab.id },
        data: { role: "LEAD_LAWYER" }
      });

      // 4. Activity Log
      await tx.auditLog.create({
        data: {
          action: "HANDOFF_CASE",
          entityType: "CASE",
          entityId: caseId,
          userId: userId,
          metadata: JSON.stringify({ previousOwnerId: userId, newOwnerId: newOwnerId })
        }
      });
    });

    res.status(200).json({ status: "success", message: "Case successfully handed off." });
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

    await logCaseActivity(caseId, userId, "UPLOAD_DOCUMENT", `Uploaded document: ${name}`);
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

    await logCaseActivity(caseId, userId, "DELETE_DOCUMENT", `Removed document: ${doc.name}`);
    res.status(200).json({ status: "success", message: "Document removed." });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/documents/:documentId/analyze - Analyze a document with LexAI
router.post("/:id/documents/:documentId/analyze", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const doc = await prisma.caseDocument.findUnique({ where: { id: documentId } });
    if (!doc || doc.caseId !== caseId) return res.status(404).json({ status: "fail", message: "Document not found." });

    // Ensure we don't re-analyze unless requested
    let existingAnalysis = await prisma.documentAnalysis.findUnique({ where: { documentId } });
    if (existingAnalysis && !req.body.forceReanalyze) {
      return res.status(200).json({ status: "success", data: { analysis: existingAnalysis } });
    }

    let textContent = doc.textContent;

    if (!textContent) {
      // 1. Fetch file
      try {
        const fileRes = await fetch(doc.fileUrl);
        if (!fileRes.ok) throw new Error("Failed to fetch file from storage.");
        const buffer = await fileRes.arrayBuffer();

        // 2. Extract text based on type
        const fileType = doc.fileType.toUpperCase();
        if (fileType.includes("PDF")) {
          const pdfData = await pdfParse(Buffer.from(buffer));
          textContent = pdfData.text;
        } else if (fileType.includes("DOCX") || fileType.includes("WORD")) {
          const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
          textContent = result.value;
        } else if (fileType.includes("TXT") || fileType.includes("TEXT")) {
          textContent = Buffer.from(buffer).toString("utf-8");
        } else {
          return res.status(400).json({ status: "fail", message: "Document analysis is not supported for this file type." });
        }

        // Save extracted text
        await prisma.caseDocument.update({
          where: { id: documentId },
          data: { textContent }
        });
      } catch (err: any) {
        console.error("Text extraction failed:", err);
        return res.status(500).json({ status: "fail", message: "Failed to extract text from document." });
      }
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ status: "fail", message: "No text could be extracted from this document." });
    }

    // 3. Prepare LexAI Prompt
    const analysisPrompt = `
You are an expert legal AI assistant. Analyze the following legal document and extract structured insights.

Document Content:
${textContent.substring(0, 15000)} // Limit to avoid massive tokens

Please provide a comprehensive legal analysis with the following sections clearly labeled:
- SUMMARY: A concise summary of the document.
- KEY FACTS: Bullet points of the most important facts.
- LEGAL ISSUES: The core legal questions or issues raised.
- STATUTORY PROVISIONS: Any laws, acts, or sections mentioned.
- ARGUMENTS: Key arguments or positions taken.
- PRECEDENTS: Any case laws or precedents cited.
- IMPORTANT DATES: Key dates mentioned in the document.
- PARTIES: The main parties involved.
- EVIDENCE: Any exhibits or evidence referred to.
- FOLLOW-UP RESEARCH: Suggestions for further legal research based on this document.
    `;

    // 4. Query LexAI
    let lexaiResult;
    try {
      lexaiResult = await lexaiService.ask(analysisPrompt);
    } catch (err: any) {
      console.error("[LexAI] Document Analysis Failed:", err.message);
      return res.status(503).json({ status: "error", message: "LexAI is temporarily unavailable. Your case data has not been affected." });
    }

    // 5. Parse LexAI Response
    const rawAnswer = lexaiResult.answer;
    
    const extractSection = (sectionName: string) => {
      const regex = new RegExp(`(?:^|\\n)-\\s*${sectionName}:?\\s*([\\s\\S]*?)(?=\\n-\\s*[A-Z ]+:|$)`, 'i');
      const match = rawAnswer.match(regex);
      return match ? match[1].trim() : null;
    };

    const summary = extractSection("SUMMARY") || "Analysis complete. See raw output.";
    const keyFacts = extractSection("KEY FACTS");
    const legalIssues = extractSection("LEGAL ISSUES");
    const statutoryProvisions = extractSection("STATUTORY PROVISIONS");
    const argumentsText = extractSection("ARGUMENTS");
    const precedents = extractSection("PRECEDENTS");
    const importantDates = extractSection("IMPORTANT DATES");
    const parties = extractSection("PARTIES");
    const evidence = extractSection("EVIDENCE");
    const followUpResearch = extractSection("FOLLOW-UP RESEARCH");

    // 6. Save Analysis
    const analysisData = {
      summary,
      keyFacts,
      legalIssues,
      statutoryProvisions,
      arguments: argumentsText,
      precedents,
      importantDates,
      parties,
      evidence,
      followUpResearch,
      rawAnalysis: rawAnswer,
      analyzedById: userId,
    };

    let savedAnalysis;
    if (existingAnalysis) {
      savedAnalysis = await prisma.documentAnalysis.update({
        where: { documentId },
        data: analysisData
      });
    } else {
      savedAnalysis = await prisma.documentAnalysis.create({
        data: {
          documentId,
          ...analysisData
        }
      });
    }

    await logCaseActivity(caseId, userId, "ANALYZE_DOCUMENT", `Analyzed document: ${doc.name} with LexAI`);

    return res.status(200).json({ status: "success", data: { analysis: savedAnalysis } });

  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/documents/:documentId/analysis - Get document analysis
router.get("/:id/documents/:documentId/analysis", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const analysis = await prisma.documentAnalysis.findUnique({ where: { documentId } });
    if (!analysis) return res.status(404).json({ status: "fail", message: "Analysis not found for this document." });

    return res.status(200).json({ status: "success", data: { analysis } });
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

    await logCaseActivity(caseId, userId, "CREATE_NOTE", `Added note: ${title}`);
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

    await logCaseActivity(caseId, userId, "DELETE_NOTE", `Removed note: ${note.title}`);
    res.status(200).json({ status: "success", message: "Note removed." });
  } catch (error) {
    next(error);
  }
});

export async function logCaseActivity(caseId: string, userId: string, action: string, metadata?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType: "CASE",
        entityId: caseId,
        metadata: metadata || null,
      }
    });
  } catch (err) {
    console.error("[logCaseActivity Error]:", err);
  }
}

export function isEditor(role: CollaboratorRole) {
  return role === CollaboratorRole.LEAD_LAWYER || role === CollaboratorRole.ASSOCIATE;
}

// Zod schemas
const factSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  isImportant: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

const partySchema = z.object({
  name: z.string().min(1),
  partyType: z.string().default("PETITIONER"),
  role: z.string().optional().nullable(),
  contactInfo: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const researchSchema = z.object({
  query: z.string().min(1),
  aiAnalysis: z.string().min(1),
  sources: z.string().optional().nullable(),
  citations: z.string().optional().nullable(),
});

// GET /api/cases/:id/facts
router.get("/:id/facts", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const facts = await prisma.caseFact.findMany({
      where: { caseId },
      orderBy: { orderIndex: "asc" },
    });

    res.status(200).json({ status: "success", data: { facts } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/facts
router.post("/:id/facts", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const parseResult = factSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid fact data.", errors: parseResult.error.errors });
    }

    const { title, description, isImportant, orderIndex } = parseResult.data;

    const fact = await prisma.caseFact.create({
      data: {
        caseId,
        title,
        description,
        isImportant,
        orderIndex,
        createdById: userId,
      },
    });

    await logCaseActivity(caseId, userId, "CREATE_FACT", `Added case fact: ${title}`);

    res.status(201).json({ status: "success", data: { fact } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cases/:id/facts/:factId
router.patch("/:id/facts/:factId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const factId = req.params.factId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const parseResult = factSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid fact data.", errors: parseResult.error.errors });
    }

    const fact = await prisma.caseFact.findFirst({
      where: { id: factId, caseId },
    });
    if (!fact) return res.status(404).json({ status: "fail", message: "Fact not found." });

    const updatedFact = await prisma.caseFact.update({
      where: { id: factId },
      data: parseResult.data,
    });

    await logCaseActivity(caseId, userId, "UPDATE_FACT", `Updated case fact: ${updatedFact.title}`);

    res.status(200).json({ status: "success", data: { fact: updatedFact } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/facts/:factId
router.delete("/:id/facts/:factId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const factId = req.params.factId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const fact = await prisma.caseFact.findFirst({
      where: { id: factId, caseId },
    });
    if (!fact) return res.status(404).json({ status: "fail", message: "Fact not found." });

    await prisma.caseFact.delete({
      where: { id: factId },
    });

    await logCaseActivity(caseId, userId, "DELETE_FACT", `Deleted case fact: ${fact.title}`);

    res.status(200).json({ status: "success", message: "Fact removed." });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/parties
router.get("/:id/parties", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const parties = await prisma.caseParty.findMany({
      where: { caseId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ status: "success", data: { parties } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/parties
router.post("/:id/parties", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const parseResult = partySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid party data.", errors: parseResult.error.errors });
    }

    const { name, partyType, role, contactInfo, notes } = parseResult.data;

    const party = await prisma.caseParty.create({
      data: {
        caseId,
        name,
        partyType,
        role,
        contactInfo,
        notes,
        createdById: userId,
      },
    });

    await logCaseActivity(caseId, userId, "CREATE_PARTY", `Added case party: ${name} (${partyType})`);

    res.status(201).json({ status: "success", data: { party } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cases/:id/parties/:partyId
router.patch("/:id/parties/:partyId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const partyId = req.params.partyId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const parseResult = partySchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid party data.", errors: parseResult.error.errors });
    }

    const party = await prisma.caseParty.findFirst({
      where: { id: partyId, caseId },
    });
    if (!party) return res.status(404).json({ status: "fail", message: "Party not found." });

    const updatedParty = await prisma.caseParty.update({
      where: { id: partyId },
      data: parseResult.data,
    });

    await logCaseActivity(caseId, userId, "UPDATE_PARTY", `Updated case party: ${updatedParty.name}`);

    res.status(200).json({ status: "success", data: { party: updatedParty } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/parties/:partyId
router.delete("/:id/parties/:partyId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const partyId = req.params.partyId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const party = await prisma.caseParty.findFirst({
      where: { id: partyId, caseId },
    });
    if (!party) return res.status(404).json({ status: "fail", message: "Party not found." });

    await prisma.caseParty.delete({
      where: { id: partyId },
    });

    await logCaseActivity(caseId, userId, "DELETE_PARTY", `Deleted case party: ${party.name}`);

    res.status(200).json({ status: "success", message: "Party removed." });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/research
router.get("/:id/research", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const researches = await prisma.caseResearch.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { researches } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/research
router.post("/:id/research", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const parseResult = researchSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ status: "fail", message: "Invalid research data.", errors: parseResult.error.errors });
    }

    const { query, aiAnalysis, sources, citations } = parseResult.data;

    const research = await prisma.caseResearch.create({
      data: {
        caseId,
        query,
        aiAnalysis,
        sources,
        citations,
        createdById: userId,
      },
    });

    await logCaseActivity(caseId, userId, "SAVE_RESEARCH", `Saved research query: ${query}`);

    res.status(201).json({ status: "success", data: { research } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cases/:id/research/:researchId
router.delete("/:id/research/:researchId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    const researchId = req.params.researchId;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const research = await prisma.caseResearch.findFirst({
      where: { id: researchId, caseId },
    });
    if (!research) return res.status(404).json({ status: "fail", message: "Research record not found." });

    await prisma.caseResearch.delete({
      where: { id: researchId },
    });

    await logCaseActivity(caseId, userId, "DELETE_RESEARCH", `Removed saved research query: ${research.query}`);

    res.status(200).json({ status: "success", message: "Research record removed." });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/activity
router.get("/:id/activity", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const activities = await prisma.auditLog.findMany({
      where: {
        entityType: "CASE",
        entityId: caseId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { activities } });
  } catch (error) {
    next(error);
  }
});

// GET /api/cases/:id/intelligence
router.get("/:id/intelligence", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const intelligence = await prisma.caseIntelligence.findUnique({
      where: { caseId }
    });

    res.status(200).json({ status: "success", data: { intelligence } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/intelligence - Generate or refresh case intelligence
router.post("/:id/intelligence", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        facts: { orderBy: { orderIndex: "asc" } },
        parties: true,
        documents: { include: { analysis: true } },
        researches: true,
        notes: true,
      }
    });

    if (!caseRecord) return res.status(404).json({ status: "fail", message: "Case not found." });

    let contextString = `CASE OVERVIEW:
Title: ${caseRecord.title}
Type: ${caseRecord.caseType}
Client: ${caseRecord.clientName}
Opposing Party: ${caseRecord.opposingParty}

FACTS:
${caseRecord.facts.map(f => `- ${f.title}: ${f.description}`).join("\n")}

PARTIES:
${caseRecord.parties.map(p => `- ${p.name} (${p.partyType})`).join("\n")}

DOCUMENTS & ANALYSIS:
${caseRecord.documents.map(d => `- ${d.name}\n  Analysis: ${d.analysis ? d.analysis.summary : "Not analyzed"}`).join("\n")}

SAVED RESEARCH:
${caseRecord.researches.map(r => `- Query: ${r.query}\n  Insights: ${r.aiAnalysis}`).join("\n")}

NOTES:
${caseRecord.notes.map(n => `- ${n.title}: ${n.content}`).join("\n")}
`;

    const prompt = `You are an expert legal AI assistant generating a comprehensive "Case Intelligence Report".
Analyze the provided authorized case context. Do NOT invent facts, statutes, or precedents. Use only grounded material or standard legal knowledge relevant to the provided facts.

Case Context:
${contextString.substring(0, 15000)}

Respond with the following labeled sections exactly:
- SUMMARY: A brief overview.
- LEGAL ISSUES: Numbered list of core legal questions.
- KEY FACTS: Most critical facts.
- STATUTES: Relevant statutes.
- PRECEDENTS: Relevant case laws.
- SUPPORTING ARGUMENTS: Arguments for the client.
- OPPOSING ARGUMENTS: Arguments against the client.
- EVIDENCE GAPS: Missing information.
- CONTRADICTIONS: Inconsistencies.
- RESEARCH AREAS: Areas needing more research.
- ACTION ITEMS: Recommended next steps.
- IMPORTANT DATES: Key dates.
`;

    let lexaiResult;
    try {
      lexaiResult = await lexaiService.ask(prompt);
    } catch (err: any) {
      console.error("[LexAI] Case Intelligence Failed:", err.message);
      return res.status(503).json({ status: "error", message: "LexAI is receiving many requests right now. Please try again shortly." });
    }

    const rawAnswer = lexaiResult.answer;
    
    const extractSectionList = (sectionName: string): string[] => {
      const regex = new RegExp(`(?:^|\\n)-\\s*${sectionName}:?\\s*([\\s\\S]*?)(?=\\n-\\s*[A-Z ]+:|$)`, 'i');
      const match = rawAnswer.match(regex);
      if (!match) return [];
      return match[1]
        .split('\\n')
        .map(line => line.replace(/^[-*•0-9.)]+\\s*/, '').trim())
        .filter(line => line.length > 0);
    };

    const extractSectionString = (sectionName: string): string => {
      const regex = new RegExp(`(?:^|\\n)-\\s*${sectionName}:?\\s*([\\s\\S]*?)(?=\\n-\\s*[A-Z ]+:|$)`, 'i');
      const match = rawAnswer.match(regex);
      return match ? match[1].trim() : "";
    };

    const summary = extractSectionString("SUMMARY") || "Analysis complete.";
    const legalIssues = extractSectionList("LEGAL ISSUES");
    const keyFacts = extractSectionList("KEY FACTS");
    const statutes = extractSectionList("STATUTES");
    const precedents = extractSectionList("PRECEDENTS");
    const supportingArguments = extractSectionList("SUPPORTING ARGUMENTS");
    const opposingArguments = extractSectionList("OPPOSING ARGUMENTS");
    const evidenceGaps = extractSectionList("EVIDENCE GAPS");
    const contradictions = extractSectionList("CONTRADICTIONS");
    const researchAreas = extractSectionList("RESEARCH AREAS");
    const actionItems = extractSectionList("ACTION ITEMS");
    const importantDates = extractSectionList("IMPORTANT DATES");

    const data = {
      summary,
      legalIssues,
      keyFacts,
      statutes,
      precedents,
      supportingArguments,
      opposingArguments,
      evidenceGaps,
      contradictions,
      researchAreas,
      actionItems,
      importantDates,
      generatedById: userId,
    };

    const intelligence = await prisma.caseIntelligence.upsert({
      where: { caseId },
      update: data,
      create: {
        caseId,
        ...data
      }
    });

    const existingLog = await prisma.auditLog.findFirst({ where: { entityType: "CASE_INTELLIGENCE", entityId: caseId }});
    await logCaseActivity(caseId, userId, "CASE_INTELLIGENCE", existingLog ? "Case intelligence refreshed" : "Case intelligence generated");

    res.status(200).json({ status: "success", data: { intelligence } });
  } catch (error) {
    next(error);
  }
});
// GET /api/cases/:id/hearings/:eventId/prepare
router.get("/:id/hearings/:eventId/prepare", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: caseId, eventId } = req.params;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });
    
    if (!event || event.caseId !== caseId) {
      return res.status(404).json({ status: "fail", message: "Hearing not found in this case." });
    }

    const hearingPrep = await prisma.hearingPreparation.findUnique({
      where: { eventId }
    });

    res.status(200).json({ status: "success", data: { hearingPrep } });
  } catch (error) {
    next(error);
  }
});

// POST /api/cases/:id/hearings/:eventId/prepare
router.post("/:id/hearings/:eventId/prepare", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { id: caseId, eventId } = req.params;
    if (!userId) return res.status(401).json({ status: "fail", message: "Unauthorized" });

    const collab = await getCollaboratorRecord(caseId, userId);
    if (!collab) return res.status(403).json({ status: "fail", message: "Access Denied: Not a case collaborator." });
    if (!isEditor(collab.role)) return res.status(403).json({ status: "fail", message: "Access Denied: Read-only access." });

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });
    
    if (!event || event.caseId !== caseId) {
      return res.status(404).json({ status: "fail", message: "Hearing not found." });
    }

    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        facts: { orderBy: { orderIndex: "asc" } },
        parties: true,
        documents: { include: { analysis: true } },
        researches: true,
        notes: true,
        tasks: { where: { status: { in: ["TODO", "IN_PROGRESS"] } } },
        intelligence: true
      }
    });

    if (!caseRecord) return res.status(404).json({ status: "fail", message: "Case not found." });

    let contextString = `CASE OVERVIEW:
Title: ${caseRecord.title}
Status: ${caseRecord.status}
Court: ${caseRecord.court}

HEARING DETAILS:
Title: ${event.title}
Date: ${new Date(event.startAt).toLocaleString()}
Type: ${event.type}
Location: ${event.location || "N/A"}

FACTS:
${caseRecord.facts.map(f => `- ${f.title}`).join("\n")}

DOCUMENTS:
${caseRecord.documents.map(d => `- ${d.name}\n  Analysis: ${d.analysis ? d.analysis.summary : "Not analyzed"}`).join("\n")}

RESEARCH:
${caseRecord.researches.map(r => `- ${r.query}`).join("\n")}

TASKS (PENDING):
${caseRecord.tasks.map(t => `- ${t.title}`).join("\n")}

CASE INTELLIGENCE:
${caseRecord.intelligence ? `Issues: ${caseRecord.intelligence.legalIssues.join(", ")}` : "None"}
`;

    const prompt = `You are an expert legal AI assistant generating a comprehensive "Hearing Preparation Brief".
Analyze the provided authorized case and hearing context. Do NOT invent facts, statutes, or precedents. Use only grounded material or standard legal knowledge relevant to the provided facts.

Context:
${contextString.substring(0, 15000)}

Respond with the following labeled sections exactly:
- SUMMARY: A brief overview of the hearing objective and context.
- DISPUTED ISSUES: Numbered list of core disputed legal issues to address at this hearing.
- KEY FACTS: Most critical facts for this hearing.
- LEGAL AUTHORITIES: Relevant statutes or provisions.
- EVIDENCE TO REVIEW: Critical evidence to prioritize for this hearing.
- SUPPORTING ARGUMENTS: Grounded supporting arguments.
- POTENTIAL OPPOSING ARGUMENTS: Potential opposing arguments based ONLY on available case materials.
- QUESTIONS TO PREPARE: AI-generated preparation suggestions for questions (e.g., for opposing party, regarding evidence, disputed facts).
- PENDING TASKS: Outstanding tasks relevant to this hearing.
- CHECKLIST: A practical preparation checklist based on real case information.
`;

    let lexaiResult;
    try {
      lexaiResult = await lexaiService.ask(prompt);
    } catch (err: any) {
      console.error("[LexAI] Hearing Prep Failed:", err.message);
      return res.status(503).json({ status: "error", message: "LexAI is receiving many requests right now. Please try again shortly." });
    }

    const rawAnswer = lexaiResult.answer;
    
    const extractSectionList = (sectionName: string): string[] => {
      const regex = new RegExp(`(?:^|\\n)-\\s*${sectionName}:?\\s*([\\s\\S]*?)(?=\\n-\\s*[A-Z ]+:|$)`, 'i');
      const match = rawAnswer.match(regex);
      if (!match) return [];
      return match[1]
        .split('\\n')
        .map(line => line.replace(/^[-*•0-9.)]+\\s*/, '').trim())
        .filter(line => line.length > 0);
    };

    const extractSectionString = (sectionName: string): string => {
      const regex = new RegExp(`(?:^|\\n)-\\s*${sectionName}:?\\s*([\\s\\S]*?)(?=\\n-\\s*[A-Z ]+:|$)`, 'i');
      const match = rawAnswer.match(regex);
      return match ? match[1].trim() : "";
    };

    const data = {
      summary: extractSectionString("SUMMARY") || "Preparation complete.",
      disputedIssues: extractSectionList("DISPUTED ISSUES"),
      keyFacts: extractSectionList("KEY FACTS"),
      legalAuthorities: extractSectionList("LEGAL AUTHORITIES"),
      evidenceToReview: extractSectionList("EVIDENCE TO REVIEW"),
      supportingArguments: extractSectionList("SUPPORTING ARGUMENTS"),
      opposingArguments: extractSectionList("POTENTIAL OPPOSING ARGUMENTS"),
      questionsToPrepare: extractSectionList("QUESTIONS TO PREPARE"),
      pendingTasks: extractSectionList("PENDING TASKS"),
      checklist: extractSectionList("CHECKLIST"),
      generatedById: userId,
      caseId: caseId
    };

    const hearingPrep = await prisma.hearingPreparation.upsert({
      where: { eventId },
      update: data,
      create: {
        eventId,
        ...data
      }
    });

    const existingLog = await prisma.auditLog.findFirst({ where: { entityType: "HEARING_PREP", entityId: eventId }});
    await logCaseActivity(caseId, userId, "HEARING_PREP", existingLog ? "Hearing brief refreshed" : "Hearing brief generated");

    res.status(200).json({ status: "success", data: { hearingPrep } });
  } catch (error) {
    next(error);
  }
});

export default router;
