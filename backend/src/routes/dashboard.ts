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

    // Upcoming Hearings List
    const upcomingHearingsList = await prisma.calendarEvent.findMany({
      where: {
        OR: [
          { createdById: userId },
          { case: { collaborators: { some: { userId } } } },
        ],
        type: "HEARING",
        startAt: { gte: now },
      },
      include: {
        case: { select: { id: true, title: true, caseNumber: true, court: true } },
      },
      orderBy: { startAt: "asc" },
      take: 5,
    });

    // Active Cases List
    const activeCasesList = await prisma.case.findMany({
      where: {
        collaborators: { some: { userId } },
        status: "ACTIVE",
      },
      include: {
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // Recent Tasks List
    const recentTasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          { createdById: userId },
        ],
        status: { in: ["TODO", "IN_PROGRESS"] },
      },
      include: {
        case: { select: { id: true, title: true, caseNumber: true } },
      },
      orderBy: { dueAt: "asc" },
      take: 5,
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
        upcomingHearingsList,
        activeCasesList,
        recentTasks,
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

// GET /api/dashboard/lawyer/analytics - Comprehensive practice metrics
router.get("/lawyer/analytics", requireAuth, requireRole("LAWYER"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Get all case IDs the user has access to
    const userCases = await prisma.case.findMany({
      where: {
        OR: [
          { createdById: userId },
          { collaborators: { some: { userId } } }
        ]
      },
      select: { id: true, status: true, caseType: true, title: true, caseNumber: true }
    });

    const caseIds = userCases.map(c => c.id);

    // Caseload Metrics
    const totalCases = userCases.length;
    const activeCases = userCases.filter(c => c.status === "ACTIVE").length;
    const pendingCases = userCases.filter(c => c.status === "PENDING").length;
    const disposedCases = userCases.filter(c => c.status === "DISPOSED").length;
    const archivedCases = userCases.filter(c => c.status === "ARCHIVED").length;
    
    // Case Type Breakdown
    const typeCounts: Record<string, number> = {};
    userCases.forEach(c => {
      typeCounts[c.caseType] = (typeCounts[c.caseType] || 0) + 1;
    });

    // Hearings Pipeline
    const upcomingHearings = await prisma.calendarEvent.findMany({
      where: { caseId: { in: caseIds }, type: "HEARING", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      include: { case: { select: { title: true, caseNumber: true } } }
    });

    const next7Days = new Date(now);
    next7Days.setDate(now.getDate() + 7);
    const next30Days = new Date(now);
    next30Days.setDate(now.getDate() + 30);

    const hearingsNext7 = upcomingHearings.filter(h => h.startAt <= next7Days).length;
    const hearingsNext30 = upcomingHearings.filter(h => h.startAt <= next30Days).length;

    // Task Productivity
    const allTasks = await prisma.task.findMany({
      where: { caseId: { in: caseIds } }
    });

    const totalTasks = allTasks.length;
    const pendingTasks = allTasks.filter(t => t.status === "TODO").length;
    const inProgressTasks = allTasks.filter(t => t.status === "IN_PROGRESS").length;
    const completedTasks = allTasks.filter(t => t.status === "COMPLETED").length;
    const overdueTasks = allTasks.filter(t => t.dueAt && t.dueAt < now && t.status !== "COMPLETED");

    // Research Activity
    const allResearch = await prisma.caseResearch.findMany({
      where: { caseId: { in: caseIds } },
      orderBy: { createdAt: "desc" },
      include: { case: { select: { title: true } } }
    });

    const recentResearch = allResearch.slice(0, 10).map(r => ({
      id: r.id,
      query: r.query,
      createdAt: r.createdAt,
      case: r.case.title
    }));
    const thisMonthResearch = allResearch.filter(r => r.createdAt >= thirtyDaysAgo).length;

    // Workload Per Case (Top 5 requiring attention)
    const caseWorkload = userCases.map(c => {
      const cTasks = allTasks.filter(t => t.caseId === c.id && t.status !== "COMPLETED");
      const cHearings = upcomingHearings.filter(h => h.caseId === c.id);
      return {
        id: c.id,
        title: c.title,
        caseNumber: c.caseNumber,
        pendingTasks: cTasks.length,
        upcomingHearings: cHearings.length,
        score: cTasks.length + (cHearings.length * 2)
      };
    }).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

    // Document Intelligence stats
    const caseDocs = await prisma.caseDocument.findMany({
      where: { caseId: { in: caseIds } },
      include: { analysis: { select: { id: true } } }
    });

    const docsAddedThisMonth = caseDocs.filter(d => d.createdAt >= thirtyDaysAgo).length;
    const analyzedDocs = caseDocs.filter(d => d.analysis).length;

    // Extract urgent priorities (Overdue tasks + next 7 day hearings)
    const urgentPriorities = [
      ...overdueTasks.map(t => ({
        type: "OVERDUE_TASK",
        id: t.id,
        title: t.title,
        date: t.dueAt!,
        case: userCases.find(c => c.id === t.caseId)?.title || "Unknown"
      })),
      ...upcomingHearings.filter(h => h.startAt <= next7Days).map(h => ({
        type: "UPCOMING_HEARING",
        id: h.id,
        title: h.title,
        date: h.startAt,
        case: h.case?.title || "Unknown"
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 8);

    const analyticsData = {
      caseload: {
        total: totalCases,
        active: activeCases,
        pending: pendingCases,
        disposed: disposedCases,
        archived: archivedCases,
        byType: typeCounts
      },
      hearings: {
        upcoming: upcomingHearings.length,
        next7Days: hearingsNext7,
        next30Days: hearingsNext30,
        nextHearing: upcomingHearings[0] || null
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks.length
      },
      documents: {
        total: caseDocs.length,
        addedThisMonth: docsAddedThisMonth,
        analyzed: analyzedDocs,
        pending: caseDocs.length - analyzedDocs
      },
      research: {
        total: allResearch.length,
        thisMonth: thisMonthResearch,
        recent: recentResearch
      },
      workload: caseWorkload,
      priorities: urgentPriorities
    };

    res.status(200).json({ status: "success", data: analyticsData });
  } catch (error: any) {
    console.error("[Analytics Error]:", error);
    res.status(500).json({ status: "error", message: "Failed to generate analytics." });
  }
});

// GET /api/dashboard/lawyer/collaboration
router.get("/lawyer/collaboration", requireAuth, requireRole("LAWYER"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get all cases the user is collaborating on
    const userCases = await prisma.case.findMany({
      where: {
        collaborators: { some: { userId } }
      },
      include: {
        collaborators: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    });

    const caseIds = userCases.map(c => c.id);

    // Get all tasks for these cases
    const allTasks = await prisma.task.findMany({
      where: { caseId: { in: caseIds } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { dueAt: "asc" }
    });

    const myTasks = allTasks.filter(t => t.assignedToId === userId && t.status !== "COMPLETED");
    const teamTasks = allTasks.filter(t => t.status !== "COMPLETED");

    // Get recent documents
    const recentDocuments = await prisma.caseDocument.findMany({
      where: { caseId: { in: caseIds } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Get recent research
    const recentResearch = await prisma.caseResearch.findMany({
      where: { caseId: { in: caseIds } },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Get recent activity using AuditLog
    const recentActivity = await prisma.auditLog.findMany({
      where: { 
        entityType: "CASE",
        entityId: { in: caseIds } 
      },
      include: {
        user: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 15
    });

    // Map auditLog to caseActivity format expected by frontend
    const mappedActivity = recentActivity.map(act => {
      const caseData = userCases.find(c => c.id === act.entityId);
      return {
        id: act.id,
        title: act.action,
        description: act.metadata ? JSON.parse(act.metadata) : "",
        createdAt: act.createdAt,
        createdBy: act.user,
        case: caseData ? { id: caseData.id, caseNumber: caseData.caseNumber, title: caseData.title } : null
      };
    });

    const payload = {
      cases: userCases,
      myTasks,
      teamTasks,
      recentDocuments,
      recentResearch,
      recentActivity: mappedActivity
    };

    res.status(200).json({ status: "success", data: payload });
  } catch (error: any) {
    console.error("[Collaboration Dashboard Error]:", error);
    res.status(500).json({ status: "error", message: "Failed to load collaboration data." });
  }
});

export default router;
