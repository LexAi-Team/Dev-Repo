export function buildCaseGenerationPrompt(practiceArea: string, difficulty: string): string {
  return `Act as an expert senior legal educator and judicial officer specializing in ${practiceArea} under Indian Jurisprudence.
Generate a realistic, immersive legal case scenario for a law student at the ${difficulty} difficulty level.

Strictly adhere to Indian Legal Principles (Statutes such as IPC/BNS, CrPC/BNSS, Evidence Act/BSA, Contract Act, Constitution of India, etc.).

Return the response in valid, clear JSON format matching this exact shape (do not include markdown ticks or unformatted text outside JSON):
{
  "title": "State of Karnataka v. Ramesh Kumar (or relevant case title)",
  "summary": "Concise 2-sentence background summary of the dispute.",
  "facts": [
    "Fact 1: Chronological fact detail...",
    "Fact 2: Chronological fact detail...",
    "Fact 3: Key dispute or allegation..."
  ],
  "parties": [
    { "name": "Party A", "role": "Petitioner / Prosecution", "description": "Details..." },
    { "name": "Party B", "role": "Respondent / Defense", "description": "Details..." }
  ],
  "legalIssues": [
    "Primary Issue 1: Whether Section ... is attracted...",
    "Secondary Issue 2: Whether Exhibit B is admissible under..."
  ],
  "evidence": [
    {
      "id": "EXHIBIT A",
      "type": "Document / Police Report / Contract",
      "title": "First Information Report (FIR) / Agreement",
      "description": "Content of Exhibit A...",
      "relevance": "Key prosecution / claimant evidence."
    },
    {
      "id": "EXHIBIT B",
      "type": "Witness Statement / Email",
      "title": "Statement of Key Witness",
      "description": "Content of Exhibit B...",
      "relevance": "Contradictory witness testimony."
    }
  ],
  "relevantLaw": [
    "Section ... of Indian Statute...",
    "Supreme Court Precedent..."
  ]
}

Ensure the scenario is legally accurate, challenging, realistic, and tailored to ${difficulty} difficulty.
Practice Area: ${practiceArea}`;
}
