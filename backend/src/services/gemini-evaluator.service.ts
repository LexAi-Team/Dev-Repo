import { GoogleGenAI } from "@google/genai";
import { buildGeminiEvaluationPrompt, LexAIGroundingContext } from "../prompts/simulator/gemini-evaluation.js";
import { FullTranscriptItem } from "../prompts/simulator/evaluation.js";
import { z } from "zod";

export const evaluationSchema = z.object({
  scores: z.object({
    legalReasoningScore: z.number().min(0).max(100),
    issueIdentificationScore: z.number().min(0).max(100),
    evidenceHandlingScore: z.number().min(0).max(100),
    argumentationScore: z.number().min(0).max(100),
    proceduralAwarenessScore: z.number().min(0).max(100),
    counterargumentHandlingScore: z.number().min(0).max(100),
    strategyScore: z.number().min(0).max(100)
  }),
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missedIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
  simulatedJudgment: z.string()
});

export class GeminiEvaluatorService {
  private ai: GoogleGenAI | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("[GeminiEvaluatorService] GEMINI_API_KEY environment variable is not defined.");
    }
  }

  async evaluateStudentPerformance(
    caseTitle: string,
    practiceArea: string,
    difficulty: string,
    facts: string[],
    evidence: string[],
    transcript: FullTranscriptItem[],
    grounding: LexAIGroundingContext
  ) {
    if (!this.ai) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const prompt = buildGeminiEvaluationPrompt(
      caseTitle,
      practiceArea,
      difficulty,
      facts,
      evidence,
      transcript,
      grounding
    );

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        console.log(`[GeminiEvaluatorService] Calling Gemini (attempt ${attempts + 1}/${maxAttempts}) using model: ${this.model}...`);
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const responseText = response.text || "";
        if (!responseText.trim()) {
          throw new Error("Gemini returned an empty response.");
        }

        // Clean/parse JSON response
        let rawText = responseText.trim();
        const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (codeBlockMatch) {
          rawText = codeBlockMatch[1].trim();
        }

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const targetJsonString = jsonMatch ? jsonMatch[0] : rawText;

        let parsed: any;
        try {
          parsed = JSON.parse(targetJsonString);
        } catch {
          const sanitized = targetJsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");
          parsed = JSON.parse(sanitized);
        }

        // Validate schema
        const validated = evaluationSchema.parse(parsed);
        return validated;
      } catch (err: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error("[GeminiEvaluatorService] All attempts failed. Error during Gemini evaluation:", err.message);
          throw err;
        }
        console.warn(`[GeminiEvaluatorService] Attempt ${attempts} failed: ${err.message}. Retrying in 1.5s...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }
}

export const geminiEvaluatorService = new GeminiEvaluatorService();
