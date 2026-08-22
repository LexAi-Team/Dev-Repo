import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { EventType } from "@prisma/client";
import { z } from "zod";

const router = Router();

// Protect all calendar workspace routes for LAWYER role only
router.use(requireAuth, requireRole("LAWYER"));

const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    EventType.HEARING,
    EventType.MEETING,
    EventType.DEADLINE,
    EventType.REMINDER,
    EventType.OTHER,
  ]),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().optional(),
  caseId: z.string().optional(),
});

// GET /api/calendar
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const { caseId } = req.query;

    if (caseId && typeof caseId === "string") {
      // Check case collaborator access
      const collab = await prisma.caseCollaborator.findUnique({
        where: {
          caseId_userId: {
            caseId,
            userId,
          },
        },
      });

      if (!collab) {
        return res.status(403).json({
          status: "fail",
          message: "Access Denied: You cannot view events for this case.",
        });
      }

      const events = await prisma.calendarEvent.findMany({
        where: { caseId },
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { startAt: "asc" },
      });

      return res.status(200).json({ status: "success", data: { events } });
    }

    // Default: Get all events created by user OR linked to cases the user collaborates on
    const events = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            case: {
              collaborators: {
                some: { userId },
              },
            },
          },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        case: { select: { id: true, title: true, caseNumber: true } },
      },
      orderBy: { startAt: "asc" },
    });

    res.status(200).json({ status: "success", data: { events } });
  } catch (error) {
    next(error);
  }
});

// POST /api/calendar
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const parseResult = eventCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid event data.",
        errors: parseResult.error.errors,
      });
    }

    const eventData = parseResult.data;

    // Verify case access if caseId is supplied
    if (eventData.caseId) {
      const collab = await prisma.caseCollaborator.findUnique({
        where: {
          caseId_userId: {
            caseId: eventData.caseId,
            userId,
          },
        },
      });

      if (!collab) {
        return res.status(403).json({
          status: "fail",
          message: "Access Denied: You cannot add events to this case.",
        });
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        startAt: new Date(eventData.startAt),
        endAt: new Date(eventData.endAt),
        location: eventData.location || null,
        caseId: eventData.caseId || null,
        createdById: userId,
      },
    });

    res.status(201).json({ status: "success", data: { event } });
  } catch (error) {
    next(error);
  }
});

export default router;
