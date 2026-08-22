"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/provider";
import { api, AIChatMessage, AIConversationItem } from "@/lib/api";
import { Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import ConversationList from "./conversation-list";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";

export default function AIChatShell() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load previous conversations list
  useEffect(() => {
    async function loadConversations() {
      try {
        const response = await api.getConversations();
        if (response && response.status === "success") {
          setConversations(response.data.conversations || []);
        }
      } catch (err) {
        console.debug("[AI Shell] Load conversations failed:", err);
      } finally {
        setFetchingHistory(false);
      }
    }
    loadConversations();
  }, []);

  // Load messages when an active conversation is selected
  useEffect(() => {
    if (!activeConversationId) return;

    let active = true;
    async function loadConversationMessages() {
      try {
        const response = await api.getConversation(activeConversationId!);
        if (active && response && response.status === "success") {
          setMessages(response.data.conversation.messages || []);
        }
      } catch (err) {
        console.debug("[AI Shell] Load transcript failed:", err);
      }
    }
    loadConversationMessages();
    return () => {
      active = false;
    };
  }, [activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setErrorMessage("");
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setErrorMessage("");
  };

  const handleDeleteConversation = async (id: string) => {
    setErrorMessage("");
    try {
      const response = await api.deleteConversation(id);
      if (response && response.status === "success") {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          handleNewConversation();
        }
      } else {
        setErrorMessage("Unable to delete this conversation. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[AI Chat Delete Error]:", err);
      setErrorMessage("Unable to delete this conversation. Please try again.");
    }
  };

  const handleSendMessage = async (text: string) => {
    setErrorMessage("");
    setLoading(true);

    // Optimistically add user message to transcript
    const tempUserMsg: AIChatMessage = {
      id: `temp-${messages.length + 1}`,
      role: "user",
      content: text,
      createdAt: "Just now",
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(text, activeConversationId || undefined);
      if (res && res.status === "success") {
        setActiveConversationId(res.data.conversationId);
        setMessages((prev) => {
          // Replace temp message with actual user message and assistant message
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          return [...filtered, res.data.userMessage, res.data.message];
        });

        // Refresh conversation history list in sidebar
        const convsRes = await api.getConversations();
        if (convsRes && convsRes.status === "success") {
          setConversations(convsRes.data.conversations || []);
        }
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("[AI Chat Send Error]:", error);
      setErrorMessage(
        error.message || "LEXAI is temporarily unavailable. Please check your network and try again."
      );
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "What is anticipatory bail under Indian law?",
    "Explain the essential ingredients of Section 420 IPC.",
    "What are the rights of an arrested person under CrPC?",
    "How is a contract formed under the Indian Contract Act?",
  ];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl overflow-hidden shadow-sm">
      {/* LEFT SIDEBAR — Conversation History */}
      <div className="w-full md:w-72 shrink-0 h-48 md:h-full">
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
          loading={fetchingHistory}
        />
      </div>

      {/* CENTER & RIGHT — Messages & Input */}
      <div className="flex-1 flex flex-col h-full bg-[#F8F4EC]/30 min-w-0">
        {/* Header Bar */}
        <div className="p-4 bg-[#FFFDF8] border-b border-[#E2D5C1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#A66A22] text-[#FFFDF8] flex items-center justify-center font-serif font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm text-[#21170F]">LEXAI Legal Assistant</h2>
              <p className="text-[11px] text-[#766B5F]">
                Powered by Statutory RAG & Statutory Reasoning Engine
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Messages or Empty State */}
        {messages.length === 0 && !loading ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/20 flex items-center justify-center text-[#A66A22]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-serif text-lg font-bold text-[#21170F]">
                Ask LEXAI any Statutory Question
              </h3>
              <p className="text-xs text-[#766B5F] leading-relaxed">
                Receive instant legal provisions, statutory analysis, case law citations, and structured reasoning.
              </p>
            </div>

            {/* Quick Sample Questions */}
            <div className="w-full max-w-lg space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Suggested Queries
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="p-3 bg-[#FFFDF8] hover:bg-[#A66A22]/5 border border-[#E2D5C1] rounded-xl text-left text-xs font-semibold text-[#21170F] hover:text-[#A66A22] transition-all shadow-2xs leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ChatMessages
            messages={messages}
            loading={loading}
            userAvatar={user?.avatarUrl}
            userName={user?.name}
          />
        )}

        {/* Bottom Input & Disclaimer */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E2D5C1] space-y-2">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
          <p className="text-[10px] text-center text-[#766B5F]/70 italic">
            LEXAI provides legal information for educational and research purposes and is not a substitute for professional legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
