import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import { TaskStatus, CasePriority } from "@prisma/client";
import { z } from "zod";

const router = Router();

// Protect all task workspace routes for LAWYER role only
router.use(requireAuth, requireRole("LAWYER"));

const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum([CasePriority.LOW, CasePriority.MEDIUM, CasePriority.HIGH, CasePriority.URGENT]).optional(),
  dueAt: z.string().datetime().optional().nullable(),
  assignedToId: z.string().optional(),
  caseId: z.string().optional(),
});

// GET /api/tasks
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
          message: "Access Denied: You cannot view tasks for this case.",
        });
      }

      const tasks = await prisma.task.findMany({
        where: { caseId },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { dueAt: "asc" },
      });

      return res.status(200).json({ status: "success", data: { tasks } });
    }

    // Default: Get all tasks assigned to or created by current user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { createdById: userId },
        ],
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        case: { select: { id: true, title: true, caseNumber: true } },
      },
      orderBy: { dueAt: "asc" },
    });

    res.status(200).json({ status: "success", data: { tasks } });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const parseResult = taskCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid task data.",
        errors: parseResult.error.errors,
      });
    }

    const taskData = parseResult.data;

    // Verify case access if caseId is supplied
    if (taskData.caseId) {
      const collab = await prisma.caseCollaborator.findUnique({
        where: {
          caseId_userId: {
            caseId: taskData.caseId,
            userId,
          },
        },
      });

      if (!collab) {
        return res.status(403).json({
          status: "fail",
          message: "Access Denied: You cannot assign tasks to this case.",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueAt: taskData.dueAt ? new Date(taskData.dueAt) : null,
        assignedToId: taskData.assignedToId || null,
        caseId: taskData.caseId || null,
        createdById: userId,
      },
    });

    // Notify assignee if assigned to someone else
    if (taskData.assignedToId && taskData.assignedToId !== userId) {
      await prisma.notification.create({
        data: {
          userId: taskData.assignedToId,
          type: "TASK_ASSIGNED",
          title: "New Task Assigned",
          message: `You have been assigned a task: ${taskData.title}`,
          relatedEntityType: "TASK",
          relatedEntityId: task.id,
        },
      });
    }

    res.status(201).json({ status: "success", data: { task } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ status: "fail", message: "Task not found." });
    }

    // Verify access: Creator, assignee, or case collaborator
    let hasAccess = task.createdById === userId || task.assignedToId === userId;

    if (!hasAccess && task.caseId) {
      const collab = await prisma.caseCollaborator.findUnique({
        where: {
          caseId_userId: {
            caseId: task.caseId,
            userId,
          },
        },
      });
      if (collab) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You do not have access to this task.",
      });
    }

    const taskUpdateSchema = taskCreateSchema.partial().extend({
      status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]).optional(),
    });

    const parseResult = taskUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid task update data.",
        errors: parseResult.error.errors,
      });
    }

    const updateData = parseResult.data;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updateData,
        dueAt: updateData.dueAt ? new Date(updateData.dueAt) : undefined,
      },
    });

    res.status(200).json({ status: "success", data: { task: updatedTask } });
  } catch (error) {
    next(error);
  }
});

export default router;
