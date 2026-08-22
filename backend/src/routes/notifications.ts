import { Router, Request, Response, NextFunction } from "express";
import { requireAuth } from "../middleware/auth.js";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/notifications
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ status: "success", data: { notifications } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;
    if (!userId) {
      return res.status(401).json({ status: "fail", message: "Unauthorized" });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ status: "fail", message: "Notification not found." });
    }

    // Verify ownership
    if (notification.userId !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "Access Denied: You do not own this notification.",
      });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.status(200).json({ status: "success", data: { notification: updated } });
  } catch (error) {
    next(error);
  }
});

export default router;
