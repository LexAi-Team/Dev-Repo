import { Router, Response } from "express";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/dashboard/student - Real database metrics for Student
router.get("/student", requireAuth, requireRole("STUDENT"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Count real completed simulator sessions
    const completedSimulationsCount = await prisma.simulationSession.count({
      where: { userId, status: "COMPLETED" },
    });

    const totalSessionsCount = await prisma.simulationSession.count({
      where: { userId },
    });

    // Calculate real average score
    const avgScoreResult = await prisma.simulationSession.aggregate({
      _avg: { overallScore: true },
      where: { userId, status: "COMPLETED" },
    });
    const avgScore = avgScoreResult._avg.overallScore
      ? Math.round(avgScoreResult._avg.overallScore)
      : 0;

    // Distinct practice areas explored
    const distinctAreas = await prisma.caseScenario.findMany({
      where: {
        sessions: { some: { userId } },
      },
      select: { practiceArea: true },
      distinct: ["practiceArea"],
    });

    // Fetch recent completed simulations
    const recentSimulations = await prisma.simulationSession.findMany({
      where: { userId },
      include: { caseScenario: true, evaluation: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          casesPracticed: completedSimulationsCount,
          averageScore: avgScore,
          practiceSessions: totalSessionsCount,
          topicsExplored: distinctAreas.length,
        },
        recentActivity: recentSimulations.map((s) => ({
          id: s.id,
          title: s.caseScenario.title,
          practiceArea: s.caseScenario.practiceArea,
          difficulty: s.caseScenario.difficulty,
          status: s.status,
          score: s.overallScore,
          date: s.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to load student dashboard stats.",
    });
  }
});

// GET /api/dashboard/lawyer - Real database metrics for Lawyer
router.get("/lawyer", requireAuth, requireRole("LAWYER"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Real database counts
    const activeCasesCount = await prisma.case.count({
      where: {
        OR: [
          { createdById: userId },
          { collaborators: { some: { userId } } },
        ],
        status: "ACTIVE",
      },
    });

    const now = new Date();
    const upcomingHearingsCount = await prisma.calendarEvent.count({
      where: {
        createdById: userId,
        type: "HEARING",
        startAt: { gte: now },
      },
    });

    const pendingTasksCount = await prisma.task.count({
      where: {
        createdById: userId,
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
    });

    const highPriorityTasksCount = await prisma.task.count({
      where: {
        createdById: userId,
        priority: "HIGH",
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          activeCases: activeCasesCount,
          upcomingHearings: upcomingHearingsCount,
          pendingTasks: pendingTasksCount,
          highPriorityTasks: highPriorityTasksCount,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to load lawyer dashboard stats.",
    });
  }
});

export default router;
