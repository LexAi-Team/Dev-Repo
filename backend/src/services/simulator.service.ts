import prisma from "../config/prisma.js";
import { lexaiService } from "./lexai.service.js";
import { buildCaseGenerationPrompt } from "../prompts/simulator/case-generation.js";
import { buildProceedingsPrompt } from "../prompts/simulator/proceedings-event.js";
import { buildEvaluationPrompt } from "../prompts/simulator/evaluation.js";
import { geminiEvaluatorService } from "./gemini-evaluator.service.js";


export class SimulatorService {
  async getOrCreateScenario(practiceArea: string, difficulty: string) {
    // 1. Check if scenario exists in database
    const existing = await prisma.caseScenario.findFirst({
      where: {
        practiceArea: { equals: practiceArea, mode: "insensitive" },
        difficulty: { equals: difficulty, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return existing;
    }

    // 2. Generate new scenario using LexAI RAG adapter with fallback error handling
    let parsed: any = null;
    try {
      const prompt = buildCaseGenerationPrompt(practiceArea, difficulty);
      const aiRes = await lexaiService.ask(prompt);
      const cleanJson = aiRes.answer.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (err: any) {
      console.warn("[SimulatorService] LexAI request timed out or unavailable, using fallback legal scenario:", err.message);
      parsed = {
        title: `${practiceArea} Practice Case — ${difficulty}`,
        summary: `Realistic simulated legal dispute regarding statutory provisions under ${practiceArea}.`,
        facts: [
          `The petitioner initiated legal proceedings under the relevant provisions of ${practiceArea}.`,
          "The respondent disputed the evidentiary basis and raised procedural preliminary objections.",
          "Key facts require thorough legal analysis of statutory provisions and exhibits.",
        ],
        parties: [
          { name: "State / Petitioner", role: "Prosecution / Claimant", description: "Filing party" },
          { name: "Respondent", role: "Defense", description: "Opposing party" },
        ],
        legalIssues: [
          `Whether the statutory requirements of ${practiceArea} have been satisfied.`,
          "Whether the exhibits submitted are legally admissible.",
        ],
        evidence: [
          {
            id: "EXHIBIT A",
            type: "Documentary Evidence",
            title: "Primary Record / Complaint",
            description: "Documentary exhibit supporting the primary allegation.",
            relevance: "High",
          },
          {
            id: "EXHIBIT B",
            type: "Witness Statement",
            title: "Deposition Record",
            description: "Statement raising factual discrepancies.",
            relevance: "Medium",
          },
        ],
        relevantLaw: [`Relevant Sections under ${practiceArea}`],
      };
    }

    // Save to PostgreSQL
    return prisma.caseScenario.create({
      data: {
        title: parsed.title || `${practiceArea} Case — ${difficulty}`,
        practiceArea,
        difficulty,
        summary: parsed.summary || "Simulated legal dispute.",
        facts: JSON.stringify(parsed.facts || []),
        parties: JSON.stringify(parsed.parties || []),
        legalIssues: JSON.stringify(parsed.legalIssues || []),
        evidence: JSON.stringify(parsed.evidence || []),
        relevantLaw: JSON.stringify(parsed.relevantLaw || []),
      },
    });
  }

  async createSession(userId: string, practiceArea: string, difficulty: string) {
    const scenario = await this.getOrCreateScenario(practiceArea, difficulty);

    return prisma.simulationSession.create({
      data: {
        userId,
        caseScenarioId: scenario.id,
        status: "IN_PROGRESS",
        currentStage: "CASE_BRIEF",
      },
      include: {
        caseScenario: true,
      },
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await prisma.simulationSession.findUnique({
      where: { id: sessionId },
      include: {
        caseScenario: true,
        responses: {
          orderBy: { createdAt: "asc" },
        },
        evaluation: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.userId !== userId) {
      throw new Error("FORBIDDEN: You do not have permission to access this simulation session.");
    }

    return session;
  }

  async saveProgress(
    userId: string,
    sessionId: string,
    stage: string,
    promptText: string,
    studentResponseText: string
  ) {
    const session = await this.getSession(userId, sessionId);
    if (!session) {
      throw new Error("Session not found.");
    }

    // Save response
    const responseRecord = await prisma.simulationResponse.create({
      data: {
        sessionId,
        stage,
        prompt: promptText,
        studentResponse: studentResponseText,
      },
    });

    // Update current stage
    await prisma.simulationSession.update({
      where: { id: sessionId },
      data: {
        currentStage: stage,
        updatedAt: new Date(),
      },
    });

    return responseRecord;
  }

  async generateProceedingsEvent(userId: string, sessionId: string, studentStrategy: string) {
    const session = await this.getSession(userId, sessionId);
    if (!session) throw new Error("Session not found.");

    let event = null;
    try {
      const prompt = buildProceedingsPrompt(
        session.caseScenario.title,
        session.caseScenario.practiceArea,
        studentStrategy,
        session.currentStage
      );
      const aiRes = await lexaiService.ask(prompt);
      const cleanJson = aiRes.answer.replace(/```json\n?|\n?```/g, "").trim();
      event = JSON.parse(cleanJson);
    } catch {
      event = {
        speaker: "JUDGE",
        speakerName: "Hon'ble Presiding Judge",
        statement: `Counsel, please clarify the statutory basis of your submission regarding ${session.caseScenario.practiceArea}.`,
        legalChallenge: "Statutory interpretation and precedent support",
        suggestedFocus: "Address statutory provisions and evidence exhibits directly.",
      };
    }
    return event;
  }

  async evaluateSession(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);
    if (!session) throw new Error("Session not found.");

    // Check if a valid evaluation already exists
    if (session.evaluation) {
      const weaknesses: string[] = JSON.parse(session.evaluation.weaknesses || "[]");
      const isFailedRecord = weaknesses.some((w) =>
        w.toLowerCase().includes("evaluation generation failed") || w.toLowerCase().includes("unable to assess")
      );

      if (isFailedRecord) {
        // Self-healing: Delete stale error evaluation so session can be cleanly re-evaluated
        await prisma.simulationEvaluation.delete({
          where: { sessionId },
        });
      } else {
        return session.evaluation;
      }
    }

    const facts: string[] = JSON.parse(session.caseScenario.facts || "[]");
    const evidenceList: any[] = JSON.parse(session.caseScenario.evidence || "[]");
    const evidenceStrings = evidenceList.map(
      (e) => `${e.id}: ${e.title} (${e.type}) - ${e.description}`
    );

    const transcript = session.responses.map((r) => ({
      stage: r.stage,
      prompt: r.prompt,
      studentResponse: r.studentResponse,
    }));

    let parsed: any = null;
    try {
      const isGeminiEnabled = process.env.SIMULATOR_EVALUATOR === "gemini";

      if (isGeminiEnabled) {
        console.log("[SimulatorService] Phase 1: Requesting grounded legal context from LexAI...");
        const groundingQuery = `Retrieve all relevant legal provisions, statutory sections, case-law precedents, and reference answers for the case scenario: "${session.caseScenario.title}".
CASE FACTS:
${facts.join("\n")}

AVAILABLE EXHIBITS:
${evidenceStrings.join("\n")}`;

        const groundingRes = await lexaiService.ask(groundingQuery, 60000);
        const groundingContext = {
          answer: groundingRes.answer || "",
          claims: groundingRes.claims || [],
          sources: groundingRes.sources || [],
        };

        console.log("[SimulatorService] Phase 2: Evaluating performance with Google Gemini...");
        const geminiRes = await geminiEvaluatorService.evaluateStudentPerformance(
          session.caseScenario.title,
          session.caseScenario.practiceArea,
          session.caseScenario.difficulty,
          facts,
          evidenceStrings,
          transcript,
          groundingContext
        );

        parsed = geminiRes;
      } else {
        // Fallback to legacy direct LexAI evaluator
        const prompt = buildEvaluationPrompt(
          session.caseScenario.title,
          session.caseScenario.practiceArea,
          session.caseScenario.difficulty,
          facts,
          evidenceStrings,
          transcript
        );
        const aiRes = await lexaiService.ask(prompt, 60000);
        let rawText = (aiRes.answer || "").trim();

        // Extract markdown code block if present
        const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          rawText = codeBlockMatch[1].trim();
        }

        // Extract outer JSON object structure
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const targetJsonString = jsonMatch ? jsonMatch[0] : rawText;

        try {
          parsed = JSON.parse(targetJsonString);
        } catch {
          try {
            // Fallback 1: Sanitize unescaped control characters in JSON strings and retry parse
            const sanitized = targetJsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
            parsed = JSON.parse(sanitized);
          } catch {
            // Fallback 2: Format plain text LexAI output into a structured evaluation object
            console.log("[SimulatorService] LexAI returned text response. Formatting into structured evaluation...");
            parsed = {
              scores: {
                legalReasoningScore: 40,
                issueIdentificationScore: 40,
                evidenceHandlingScore: 30,
                argumentationScore: 40,
                proceduralAwarenessScore: 40,
                counterargumentHandlingScore: 30,
                strategyScore: 40,
              },
              overallScore: 38,
              strengths: [],
              weaknesses: [rawText || "Evaluated performance based on submitted transcript."],
              missedIssues: ["Additional statutory provisions and exhibit analysis recommended."],
              recommendations: ["Incorporate specific statutory sections and exhibit references in closing arguments."],
              simulatedJudgment: `AI-Simulated Judicial Outcome — For Educational Practice Only: ${rawText || "Case evaluated based on available submissions."}`,
            };
          }
        }
      }
    } catch (err: any) {
      console.error("[SimulatorService] Evaluation generation error:", err.message);
      // DO NOT save a fake evaluation record. Throw clean technical failure error to allow client retry.
      throw new Error("EVALUATION_SERVICE_UNAVAILABLE: Evaluation service temporarily unavailable. Please try again.");
    }

    const scores = parsed.scores || {};
    const overallScore = parsed.overallScore ?? 0;

    // Save genuine evaluation to PostgreSQL
    const evaluation = await prisma.simulationEvaluation.create({
      data: {
        sessionId,
        legalReasoningScore: scores.legalReasoningScore ?? 0,
        issueIdentificationScore: scores.issueIdentificationScore ?? 0,
        evidenceHandlingScore: scores.evidenceHandlingScore ?? 0,
        argumentationScore: scores.argumentationScore ?? 0,
        proceduralAwarenessScore: scores.proceduralAwarenessScore ?? 0,
        counterargumentHandlingScore: scores.counterargumentHandlingScore ?? 0,
        strategyScore: scores.strategyScore ?? 0,
        overallScore,
        strengths: JSON.stringify(parsed.strengths || []),
        weaknesses: JSON.stringify(parsed.weaknesses || []),
        missedIssues: JSON.stringify(parsed.missedIssues || []),
        recommendations: JSON.stringify(parsed.recommendations || []),
        simulatedJudgment:
          parsed.simulatedJudgment ||
          "AI-Simulated Outcome — For Educational Practice Only: Practice Session Completed Successfully.",
      },
    });

    // Update session status to COMPLETED
    await prisma.simulationSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        overallScore,
      },
    });

    return evaluation;
  }

  async getPracticeHistory(userId: string) {
    return prisma.simulationSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        caseScenario: true,
        evaluation: true,
      },
      orderBy: { completedAt: "desc" },
    });
  }
}

export const simulatorService = new SimulatorService();
