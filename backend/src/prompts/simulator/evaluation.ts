export interface FullTranscriptItem {
  stage: string;
  prompt: string;
  studentResponse: string;
}

export function buildEvaluationPrompt(
  caseTitle: string,
  practiceArea: string,
  difficulty: string,
  facts: string[],
  evidence: string[],
  transcript: FullTranscriptItem[]
): string {
  const formattedTranscript = transcript
    .map(
      (t, i) => `--- Stage ${i + 1}: ${t.stage} ---\nPrompt/Question: ${t.prompt}\nStudent Response: ${t.studentResponse}`
    )
    .join("\n\n");

  return `Act as an expert Judicial Examiner and Senior Advocate evaluating a law student's full performance in the simulated courtroom case: "${caseTitle}" (${practiceArea}, ${difficulty} difficulty).

CASE FACTS:
${facts.join("\n")}

AVAILABLE EXHIBITS:
${evidence.join("\n")}

FULL STUDENT SIMULATION TRANSCRIPT:
${formattedTranscript}

=========================================
STRICT EVALUATION INSTRUCTIONS
=========================================
1. YOU MUST EVALUATE ONLY WHAT THE STUDENT ACTUALLY SUBMITTED IN THE TRANSCRIPT.
2. DO NOT assume the student identified an issue, cited a statute, or used evidence unless their response explicitly demonstrates it.
3. If the student answers "I don't know", "Not sure", or provides an empty/irrelevant response, they MUST receive a VERY LOW score for that section. 
4. DO NOT award points for reasoning that exists only in the reference solution. The reference solution is what they SHOULD have done, not what they DID.
5. If ALL responses are "I don't know" or similar, the overall score MUST be extremely low (e.g. 0-20), and strengths MUST be empty.
6. DO NOT fabricate strengths, arguments, or citations that never happened.
7. Weaknesses and missed issues MUST be derived from the actual student answers.

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

Return the evaluation in valid JSON format matching this exact shape (DO NOT copy these dummy 0 values, generate real scores based on the rules above):
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
