export interface LexAIClaim {
  claim: string;
  source_ids: string[];
}

export interface LexAISource {
  id: string;
  title: string;
  category: string;
  snippet: string;
  score?: number;
}

export interface LexAINormalizedResponse {
  answer: string;
  claims: LexAIClaim[];
  sources: LexAISource[];
  timing?: {
    retrieval?: number;
    reranking?: number;
    generation?: number;
    total?: number;
  };
}

export class LexAIService {
  private baseUrl: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl = process.env.LEXAI_BASE_URL || "https://unaudited-swiftness-starry.ngrok-free.dev";
    this.timeoutMs = Number(process.env.LEXAI_TIMEOUT_MS) || 30000;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async ask(query: string, customTimeoutMs?: number): Promise<LexAINormalizedResponse> {
    const timeoutDuration = customTimeoutMs || Number(process.env.LEXAI_EVALUATION_TIMEOUT_MS) || 45000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      const response = await fetch(`${this.baseUrl}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          "User-Agent": "LEXCONNECT-Backend",
        },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`LexAI API returned status ${response.status}: ${errorText}`);
      }

      const raw = await response.json() as {
        answer?: string;
        claims?: Array<{ claim: string; source_ids: string[] }>;
        retrieved_documents?: Array<{
          document_id?: string;
          document?: {
            id?: string;
            question?: string;
            category?: string;
            citation?: string;
            answer?: string;
          };
          text?: string;
          reranker_score?: number;
        }>;
        timing?: {
          retrieval?: number;
          reranking?: number;
          generation?: number;
          total?: number;
        };
      };

      return this.normalizeResponse(raw);
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      const err = error as { name?: string; message?: string };
      if (err.name === "AbortError") {
        throw new Error("LexAI request timed out after 30 seconds.");
      }
      throw new Error(err.message || "Failed to reach LexAI API.");
    }
  }

  private normalizeResponse(raw: {
    answer?: string;
    claims?: Array<{ claim: string; source_ids: string[] }>;
    retrieved_documents?: Array<{
      document_id?: string;
      document?: {
        id?: string;
        question?: string;
        category?: string;
        citation?: string;
        answer?: string;
      };
      text?: string;
      reranker_score?: number;
    }>;
    timing?: {
      retrieval?: number;
      reranking?: number;
      generation?: number;
      total?: number;
    };
  }): LexAINormalizedResponse {
    const answer = raw.answer || "No response content generated.";
    const claims = (raw.claims || []).map((c) => ({
      claim: c.claim,
      source_ids: c.source_ids || [],
    }));

    const sources: LexAISource[] = (raw.retrieved_documents || []).map((doc) => ({
      id: doc.document_id || doc.document?.id || "DOC",
      title: doc.document?.question || doc.document?.citation || "Legal Document Citation",
      category: doc.document?.category || "Indian Statutory Law",
      snippet: doc.text || doc.document?.answer || "",
      score: doc.reranker_score,
    }));

    return {
      answer,
      claims,
      sources,
      timing: raw.timing,
    };
  }
}

export const lexaiService = new LexAIService();
