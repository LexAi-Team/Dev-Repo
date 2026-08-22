import { Router, Response } from "express";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { simulatorService } from "../services/simulator.service.js";

const router = Router();

// Protect all simulator routes for STUDENT role only
router.use(requireAuth, requireRole("STUDENT"));

// POST /api/simulator/sessions - Start new simulation session
router.post("/sessions", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { practiceArea, difficulty } = req.body as { practiceArea?: string; difficulty?: string };

    if (!practiceArea || !difficulty) {
      res.status(400).json({
        status: "error",
        message: "Practice Area and Difficulty level are required to start a case simulation.",
      });
      return;
    }

    const session = await simulatorService.createSession(userId, practiceArea, difficulty);
    res.status(201).json({
      status: "success",
      data: { session },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Simulator] Create session error:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to initialize legal simulator session.",
    });
  }
});

// GET /api/simulator/sessions - Get user practice history sessions
router.get("/sessions", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const history = await simulatorService.getPracticeHistory(userId);
    res.status(200).json({
      status: "success",
      data: { history },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to fetch practice history.",
    });
  }
});

// GET /api/simulator/sessions/:sessionId - Load active session state
router.get("/sessions/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId;

    const session = await simulatorService.getSession(userId, sessionId);
    if (!session) {
      res.status(404).json({
        status: "error",
        message: "Simulation session not found.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { session },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    const status = err.message?.includes("FORBIDDEN") ? 403 : 500;
    res.status(status).json({
      status: "error",
      message: err.message || "Failed to load simulation session.",
    });
  }
});

// PATCH /api/simulator/sessions/:sessionId - Autosave stage progress and student response
router.patch("/sessions/:sessionId", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.sessionId;
    const { stage, promptText, studentResponseText } = req.body as {
      stage?: string;
      promptText?: string;
      studentResponseText?: string;
    };

    if (!stage) {
      res.status(400).json({
        status: "error",
        message: "Stage parameter is required.",
      });
      return;
    }

    const responseRecord = await simulatorService.saveProgress(
      userId,
      sessionId,
      stage,
      promptText || "",
      studentResponseText || ""
    );

    res.status(200).json({
      status: "success",
      data: { responseRecord },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    const status = err.message?.includes("FORBIDDEN") ? 403 : 500;
    res.status(status).json({
      status: "error",
      message: err.message || "Failed to save simulation progress.",
    });
  }
});

// POST /api/simulator/sessions/:sessionId/proceedings-event - Generate dynamic court proceeding event
router.post(
  "/sessions/:sessionId/proceedings-event",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId;
      const { studentStrategy } = req.body as { studentStrategy?: string };

      const event = await simulatorService.generateProceedingsEvent(
        userId,
        sessionId,
        studentStrategy || "Submitting oral argument on legal provisions."
      );

      res.status(200).json({
        status: "success",
        data: { event },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      res.status(500).json({
        status: "error",
        message: err.message || "Failed to generate courtroom proceedings event.",
      });
    }
  }
);

// POST /api/simulator/sessions/:sessionId/evaluate - Evaluate full session and generate judgment
router.post(
  "/sessions/:sessionId/evaluate",
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId;

      const evaluation = await simulatorService.evaluateSession(userId, sessionId);

      res.status(200).json({
        status: "success",
        data: { evaluation },
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("[Simulator] Evaluate session error:", err.message);
      res.status(500).json({
        status: "error",
        message: err.message || "Failed to evaluate case simulation session.",
      });
    }
  }
);

export default router;
