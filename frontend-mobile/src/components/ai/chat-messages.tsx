"use client";

import { useRef, useEffect } from "react";
import { Sparkles, User as UserIcon } from "lucide-react";
import { AIChatMessage } from "@/lib/api";
import CitationList from "./citation-list";
import TypingIndicator from "./typing-indicator";

interface ChatMessagesProps {
  messages: AIChatMessage[];
  loading?: boolean;
  userAvatar?: string | null;
  userName?: string;
}

export default function ChatMessages({
  messages,
  loading,
  userAvatar,
  userName = "You",
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const messageDate = new Date(msg.createdAt).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (isUser) {
          return (
            <div key={msg.id} className="flex items-start justify-end gap-3 max-w-3xl ml-auto">
              <div className="bg-[#A66A22] text-[#FFFDF8] border border-[#A66A22] rounded-2xl rounded-tr-none p-4 shadow-2xs space-y-1 max-w-xl">
                <div className="flex items-center justify-between gap-4 text-[10px] text-[#FFFDF8]/80">
                  <span className="font-bold uppercase tracking-wider">{userName}</span>
                  <span>{messageDate}</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#A66A22]/20 border border-[#A66A22]/30 flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold text-[#A66A22]">
                {userAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial || <UserIcon className="w-4 h-4" />}</span>
                )}
              </div>
            </div>
          );
        }

        // Assistant Message
        let parsedContent = {
          text: msg.content,
          claims: msg.claims,
          sources: msg.sources,
          timing: msg.timing,
        };

        // If content was stored as JSON string in PostgreSQL, parse it
        if (msg.content.startsWith("{")) {
          try {
            const parsed = JSON.parse(msg.content);
            parsedContent = {
              text: parsed.text || msg.content,
              claims: parsed.claims || msg.claims,
              sources: parsed.sources || msg.sources,
              timing: parsed.timing || msg.timing,
            };
          } catch {
            // Keep default text if JSON parsing fails
          }
        }

        return (
          <div key={msg.id} className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-[#A66A22] text-[#FFFDF8] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl rounded-tl-none p-4 shadow-2xs space-y-2 max-w-2xl w-full">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#21170F] uppercase tracking-wider">
                    LEXAI Assistant
                  </span>
                  <span className="text-[#A66A22] font-semibold bg-[#A66A22]/10 px-2 py-0.5 rounded-full">
                    Statutory RAG
                  </span>
                </div>
                <span className="text-[#766B5F]">{messageDate}</span>
              </div>

              <div className="text-xs text-[#21170F] leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                {parsedContent.text}
              </div>

              {/* Citations & Sources */}
              <CitationList claims={parsedContent.claims} sources={parsedContent.sources} />
            </div>
          </div>
        );
      })}

      {loading && <TypingIndicator />}
    </div>
  );
}
