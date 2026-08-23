import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { lexaiService } from "../services/lexai.service.js";
import { contextResolverService } from "../services/context-resolver.service.js";
import { memoryContextStore } from "../cache/memory-context-store.js";
import { conversationService } from "../services/conversation.service.js";
import prisma from "../config/prisma.js";

const router = Router();

// GET /api/ai/conversations - List user's conversations
router.get("/conversations", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const caseId = req.query.caseId as string | undefined;
    const conversations = await conversationService.getConversations(userId, caseId);
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
    const { conversationId, message, caseId } = req.body as { conversationId?: string; message?: string; caseId?: string };

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
      const newConv = await conversationService.createConversation(userId, trimmedMessage, caseId);
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

    // Resolve caseId from conversation if not supplied in body
    const convRecord = await prisma.aIConversation.findUnique({
      where: { id: convId },
    });
    const activeCaseId = caseId || convRecord?.caseId;

    // Validate case collaborator access
    if (activeCaseId) {
      const collab = await prisma.caseCollaborator.findUnique({
        where: {
          caseId_userId: {
            caseId: activeCaseId,
            userId,
          },
        },
      });
      if (!collab) {
        res.status(403).json({
          status: "error",
          message: "Access Denied: You do not have permissions for the associated case.",
        });
        return;
      }
    }

    // Build case context prompt if caseId is active
    let caseContextPrompt = "";
    if (activeCaseId) {
      const caseData = await prisma.case.findUnique({
        where: { id: activeCaseId },
        include: {
          facts: {
            orderBy: { orderIndex: "asc" },
            take: 10,
          },
          parties: {
            take: 10,
          },
          notes: {
            where: {
              OR: [
                { isPrivate: false },
                { createdById: userId },
              ],
            },
            include: { createdBy: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          researches: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          documents: {
            select: { name: true, fileType: true },
            take: 10,
          },
        },
      });

      if (caseData) {
        const factsStr = caseData.facts.map((f) => `- ${f.title}: ${f.description}${f.isImportant ? " (Important)" : ""}`).join("\n");
        const partiesStr = caseData.parties.map((p) => `- ${p.name} (${p.partyType}${p.role ? ` - ${p.role}` : ""})`).join("\n");
        const notesStr = caseData.notes.map((n) => `- ${n.title}: ${n.content} (by ${n.createdBy?.name || "Unknown"})`).join("\n");
        const researchStr = caseData.researches.map((r) => `- Query: ${r.query}\n  Analysis Summary: ${r.aiAnalysis}`).join("\n");
        const docsStr = caseData.documents.map((d) => `- ${d.name} (${d.fileType})`).join("\n");

        caseContextPrompt = `=== CASE FILES AND METADATA ===
Title: ${caseData.title}
Case Number: ${caseData.caseNumber}
Court: ${caseData.court}
Client: ${caseData.clientName}
Opposing Party: ${caseData.opposingParty}
Description: ${caseData.description || "N/A"}

${factsStr ? `Key Facts:\n${factsStr}\n` : ""}
${partiesStr ? `Involved Parties:\n${partiesStr}\n` : ""}
${notesStr ? `Case Notes & Arguments:\n${notesStr}\n` : ""}
${researchStr ? `Prior Saved Research:\n${researchStr}\n` : ""}
${docsStr ? `Case Documents:\n${docsStr}\n` : ""}
=================================
Use the above case context to answer the user's question accurately. Focus your response on the specifics of this case.

`;
      }
    }

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
    const finalQuery = caseContextPrompt ? `${caseContextPrompt}\nQuestion: ${resolved.query}` : resolved.query;

    // 5. Query LexAI RAG API
    let lexaiResult;
    try {
      lexaiResult = await lexaiService.ask(finalQuery);
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
// POST /api/ai/compare-authorities
router.post("/compare-authorities", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { query, authorities, caseId } = req.body;

    if (!authorities || !Array.isArray(authorities) || authorities.length < 2) {
      res.status(400).json({ status: "error", message: "At least two authorities are required for comparison." });
      return;
    }

    if (caseId) {
      const collab = await prisma.caseCollaborator.findUnique({
        where: { caseId_userId: { caseId, userId } },
      });
      if (!collab) {
        res.status(403).json({ status: "error", message: "Access Denied." });
        return;
      }
    }

    const prompt = `You are a legal AI assistant. Compare the following legal authorities regarding the query: "${query}".

Authorities:
${authorities.map((a: any, i: number) => `Authority ${i+1}:\nTitle: ${a.title}\nSnippet: ${a.snippet}`).join("\n\n")}

Provide a structured comparison highlighting:
1. Legal Issue Addressed
2. Core Principle of each
3. Relevant differences or similarities
4. Potential applicability or limitations (Use cautious wording like "These authorities appear distinguishable because...").
Do NOT fabricate any legal facts.`;

    const lexaiResult = await lexaiService.ask(prompt);
    
    res.status(200).json({
      status: "success",
      data: { comparison: lexaiResult.answer }
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Compare Authorities Error]:", err.message);
    res.status(500).json({ status: "error", message: "Failed to compare authorities." });
  }
});

export default router;
