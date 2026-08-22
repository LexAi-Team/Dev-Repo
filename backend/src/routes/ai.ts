import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { lexaiService } from "../services/lexai.service.js";
import { contextResolverService } from "../services/context-resolver.service.js";
import { memoryContextStore } from "../cache/memory-context-store.js";
import { conversationService } from "../services/conversation.service.js";

const router = Router();

// GET /api/ai/conversations - List user's conversations
router.get("/conversations", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversations = await conversationService.getConversations(userId);
    res.status(200).json({
      status: "success",
      data: { conversations },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to fetch conversations.",
    });
  }
});

// GET /api/ai/conversations/:id - Fetch message transcript for a conversation
router.get("/conversations/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const conversation = await conversationService.getConversation(userId, conversationId);
    if (!conversation) {
      res.status(404).json({
        status: "error",
        message: "Conversation not found.",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { conversation },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    const status = err.message?.includes("FORBIDDEN") ? 403 : 500;
    res.status(status).json({
      status: "error",
      message: err.message || "Failed to fetch conversation.",
    });
  }
});

// DELETE /api/ai/conversations/:id - Delete a conversation
router.delete("/conversations/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const conversationId = req.params.id;

    const success = await conversationService.deleteConversation(userId, conversationId);
    if (!success) {
      res.status(404).json({
        status: "error",
        message: "Conversation not found.",
      });
      return;
    }

    // Invalidate context memory cache
    await memoryContextStore.clear(conversationId);

    res.status(200).json({
      status: "success",
      message: "Conversation deleted successfully.",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    const isForbidden = err.message?.includes("FORBIDDEN");
    const status = isForbidden ? 403 : 500;
    const message = isForbidden
      ? "You do not have permission to delete this conversation."
      : "Unable to delete this conversation. Please try again.";

    res.status(status).json({
      status: "error",
      message,
    });
  }
});

// POST /api/ai/chat - Process legal question with LexAI
router.post("/chat", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId, message } = req.body as { conversationId?: string; message?: string };

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        status: "error",
        message: "A non-empty message prompt is required.",
      });
      return;
    }

    const trimmedMessage = message.trim();
    let targetConvId = conversationId;

    // 1. Resolve or create conversation
    if (!targetConvId) {
      const newConv = await conversationService.createConversation(userId, trimmedMessage);
      targetConvId = newConv.id;
    } else {
      const existing = await conversationService.getConversation(userId, targetConvId);
      if (!existing) {
        res.status(404).json({
          status: "error",
          message: "Target conversation not found.",
        });
        return;
      }
    }

    const convId = targetConvId!;

    // 2. Persist user message to PostgreSQL
    const userMsgRecord = await conversationService.addMessage(convId, "user", trimmedMessage);

    // 3. Update context store with user turn
    const nowStr = new Date().toISOString();
    await memoryContextStore.appendTurn(convId, {
      role: "user",
      content: trimmedMessage,
      timestamp: nowStr,
    });

    // 4. Resolve query context
    const resolved = await contextResolverService.resolveContext(convId, trimmedMessage);

    // 5. Query LexAI RAG API
    let lexaiResult;
    try {
      lexaiResult = await lexaiService.ask(resolved.query);
    } catch (lexErr: unknown) {
      const err = lexErr as { message?: string };
      console.error("[LexAI] API Call Failed:", err.message);
      res.status(503).json({
        status: "error",
        message: "LEXAI is temporarily unavailable. Please try again in a few moments.",
      });
      return;
    }

    // 6. Format assistant response payload
    const assistantPayload = {
      text: lexaiResult.answer,
      claims: lexaiResult.claims,
      sources: lexaiResult.sources,
      timing: lexaiResult.timing,
    };

    const assistantJsonString = JSON.stringify(assistantPayload);

    // 7. Persist assistant response to PostgreSQL
    const assistantMsgRecord = await conversationService.addMessage(
      convId,
      "assistant",
      assistantJsonString
    );

    // 8. Update context store with assistant turn
    await memoryContextStore.appendTurn(convId, {
      role: "assistant",
      content: lexaiResult.answer,
      timestamp: new Date().toISOString(),
    });

    // 9. Return normalized response
    res.status(200).json({
      status: "success",
      data: {
        conversationId: convId,
        userMessage: {
          id: userMsgRecord.id,
          role: "user",
          content: trimmedMessage,
          createdAt: userMsgRecord.createdAt,
        },
        message: {
          id: assistantMsgRecord.id,
          role: "assistant",
          content: lexaiResult.answer,
          claims: lexaiResult.claims,
          sources: lexaiResult.sources,
          timing: lexaiResult.timing,
          createdAt: assistantMsgRecord.createdAt,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[AI Chat Error]:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "An unexpected error occurred processing your AI request.",
    });
  }
});

export default router;
