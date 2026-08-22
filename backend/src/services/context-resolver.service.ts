import { memoryContextStore } from "../cache/memory-context-store.js";
import { ContextTurn } from "../cache/context-store.js";

export interface ResolvedContext {
  query: string;
  isFollowUp: boolean;
  turnsUsed: number;
}

export class ContextResolverService {
  private followUpTriggers = [
    "what about",
    "explain further",
    "give an example",
    "can he",
    "can she",
    "can they",
    "why",
    "how",
    "what does this mean",
    "continue",
    "more details",
    "explain that",
    "tell me more",
    "what is another",
    "under which section",
    "what are the conditions",
    "what are the exceptions",
  ];

  async resolveContext(conversationId: string, newMessage: string): Promise<ResolvedContext> {
    const history: ContextTurn[] = await memoryContextStore.getTurns(conversationId);

    if (!history || history.length === 0) {
      return { query: newMessage, isFollowUp: false, turnsUsed: 0 };
    }

    const lowerNew = newMessage.toLowerCase().trim();

    // Check 1: Explicit follow-up phrase trigger
    const hasFollowUpPhrase = this.followUpTriggers.some((trigger) =>
      lowerNew.includes(trigger)
    );

    // Check 2: Short query continuation (less than 6 words)
    const isShortQuery = lowerNew.split(/\s+/).length <= 6;

    // Check 3: Pronoun or reference indicators ("he", "it", "this", "that")
    const hasReference = /\b(he|it|this|that|they|his|their|same)\b/i.test(newMessage);

    const isFollowUp = hasFollowUpPhrase || isShortQuery || hasReference;

    if (!isFollowUp) {
      // Topic change or standalone query: do not attach old context
      return { query: newMessage, isFollowUp: false, turnsUsed: 0 };
    }

    // Select recent relevant turns (up to last 4 turns: 2 user + 2 assistant)
    const relevantTurns = history.slice(-4);
    if (relevantTurns.length === 0) {
      return { query: newMessage, isFollowUp: false, turnsUsed: 0 };
    }

    // Build compact context summary
    const contextPrefix = relevantTurns
      .map((t) => `${t.role === "user" ? "User asked" : "Assistant answered"}: "${t.content.substring(0, 180)}"`)
      .join("\n");

    const combinedQuery = `[Previous Context:\n${contextPrefix}\n]\n\nFollow-up question: ${newMessage}`;

    return {
      query: combinedQuery,
      isFollowUp: true,
      turnsUsed: relevantTurns.length,
    };
  }
}

export const contextResolverService = new ContextResolverService();
