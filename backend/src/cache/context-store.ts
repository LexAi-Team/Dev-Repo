export interface ContextTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ContextStore {
  getTurns(conversationId: string): Promise<ContextTurn[]>;
  appendTurn(conversationId: string, turn: ContextTurn): Promise<void>;
  clear(conversationId: string): Promise<void>;
}
