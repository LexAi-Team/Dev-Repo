import { ContextStore, ContextTurn } from "./context-store.js";

interface CacheEntry {
  turns: ContextTurn[];
  expiresAt: number;
}

export class MemoryContextStore implements ContextStore {
  private cache: Map<string, CacheEntry> = new Map();
  private maxTurns: number;
  private ttlSeconds: number;

  constructor() {
    this.maxTurns = Number(process.env.MAX_CONTEXT_TURNS) || 10;
    this.ttlSeconds = Number(process.env.CACHE_TTL) || 3600;
  }

  private getKey(conversationId: string): string {
    return `lexai:conversation:${conversationId}`;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  async getTurns(conversationId: string): Promise<ContextTurn[]> {
    this.cleanExpired();
    const key = this.getKey(conversationId);
    const entry = this.cache.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return [];
    }
    return entry.turns;
  }

  async appendTurn(conversationId: string, turn: ContextTurn): Promise<void> {
    this.cleanExpired();
    const key = this.getKey(conversationId);
    let turns = (await this.getTurns(conversationId)) || [];
    turns.push(turn);

    // Trim to max context turns
    if (turns.length > this.maxTurns) {
      turns = turns.slice(turns.length - this.maxTurns);
    }

    const expiresAt = Date.now() + this.ttlSeconds * 1000;
    this.cache.set(key, { turns, expiresAt });
  }

  async clear(conversationId: string): Promise<void> {
    const key = this.getKey(conversationId);
    this.cache.delete(key);
  }
}

export const memoryContextStore = new MemoryContextStore();
