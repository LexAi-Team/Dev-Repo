"use client";

import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 my-4 max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-[#A66A22] text-[#FFFDF8] flex items-center justify-center shrink-0 shadow-xs">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>
      <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl rounded-tl-none p-4 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#21170F]">LEXAI Assistant</span>
          <span className="text-[10px] text-[#A66A22] font-semibold uppercase tracking-wider bg-[#A66A22]/10 px-2 py-0.5 rounded-full">
            Searching Statutory RAG...
          </span>
        </div>
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-2 h-2 rounded-full bg-[#A66A22] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#A66A22] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#A66A22] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
