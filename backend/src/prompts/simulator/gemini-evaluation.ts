import { FullTranscriptItem } from "./evaluation.js";

export interface LexAIGroundingContext {
  answer: string;
  claims: Array<{ claim: string; source_ids: string[] }>;
  sources: Array<{ id: string; title: string; category: string; snippet: string }>;
}

export function buildGeminiEvaluationPrompt(
  caseTitle: string,
  practiceArea: string,
  difficulty: string,
  facts: string[],
  evidence: string[],
  transcript: FullTranscriptItem[],
  grounding: LexAIGroundingContext
): string {
  const formattedTranscript = transcript
    .map(
      (t, i) => `--- Stage ${i + 1}: ${t.stage} ---\nPrompt/Question: ${t.prompt}\nStudent Response: ${t.studentResponse}`
    )
    .join("\n\n");

  const formattedSources = grounding.sources
    .map((s) => `- ${s.title} [${s.category}]: ${s.snippet}`)
    .join("\n");

  const formattedClaims = grounding.claims
    .map((c) => `- ${c.claim} (Linked Sources: ${c.source_ids.join(", ")})`)
    .join("\n");

  return `Act as an expert Judicial Examiner and Senior Advocate evaluating a law student's full performance in the simulated courtroom case: "${caseTitle}" (${practiceArea}, ${difficulty} difficulty).

CASE FACTS:
${facts.join("\n")}

AVAILABLE EXHIBITS/EVIDENCE:
${evidence.join("\n")}

GROUNDED LEGAL CONTEXT (Retrieved from LexAI Legal Knowledge Base):
RAG Summary:
${grounding.answer}

Key Legal Grounding Claims:
${formattedClaims || "None specified"}

Retrieved Source Documents:
${formattedSources || "None specified"}

FULL STUDENT SIMULATION TRANSCRIPT:
${formattedTranscript}

=========================================
STRICT EVALUATION INSTRUCTIONS
=========================================
1. YOU MUST EVALUATE ONLY WHAT THE STUDENT ACTUALLY SUBMITTED IN THE TRANSCRIPT.
2. DO NOT credit the student for reasoning, statutory citations, or arguments that exist only in the legal grounding or case scenario if the student did not write them.
3. If the student answers "I don't know", "Not sure", or provides an empty/irrelevant response for any stage, they MUST receive a VERY LOW score for that section.
4. If ALL responses are "I don't know" or similar, the overall score MUST be extremely low (e.g., 0-20), and strengths MUST be empty ([]).
5. DO NOT fabricate strengths, arguments, or citations that never happened in the transcript.
6. Weaknesses, missed issues, and recommendations must be derived directly from comparing the student's actual answers against the legal grounding and exhibits.
7. Identify incorrect legal reasoning, missed legal issues, unconsidered evidence, ignored procedural issues, counterarguments, and strategy.

Perform a rigorous legal evaluation across 7 key legal dimensions (scores from 0 to 100):
1. Legal Reasoning (25%)
2. Issue Identification (15%)
3. Evidence Handling (15%)
4. Argument Structure (20%)
5. Procedural Awareness (10%)
6. Counterargument Handling (10%)
7. Strategy (5%)

CRITICAL RESPONSE FORMAT REQUIREMENT:
Your ENTIRE response MUST be a single raw valid JSON object starting with '{' and ending with '}'.
DO NOT include any introductory sentences, conversational preambles, notes, or concluding text outside the JSON object.
DO NOT wrap the JSON inside markdown \`\`\`json block. Just output raw JSON.

Return the evaluation matching this exact JSON shape:
{
  "scores": {
    "legalReasoningScore": 0,
    "issueIdentificationScore": 0,
    "evidenceHandlingScore": 0,
    "argumentationScore": 0,
    "proceduralAwarenessScore": 0,
    "counterargumentHandlingScore": 0,
    "strategyScore": 0
  },
  "overallScore": 0,
  "strengths": [],
  "weaknesses": [
    "..."
  ],
  "missedIssues": [
    "..."
  ],
  "recommendations": [
    "..."
  ],
  "simulatedJudgment": "AI-Simulated Outcome — For Educational Practice Only: ..."
}`;
}
