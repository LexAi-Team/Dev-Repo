"use client";

import { LucideIcon, Sparkles } from "lucide-react";

interface PolishedPlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function PolishedPlaceholderPage({
  title,
  description,
  icon: Icon,
}: PolishedPlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-2xl mx-auto space-y-6">
      {/* Icon frame */}
      <div className="w-16 h-16 rounded-2xl bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20 shadow-xs relative">
        <Icon className="w-8 h-8 text-[#A66A22]" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFFDF8] rounded-full flex items-center justify-center shadow-xs border border-[#E2D5C1]">
          <Sparkles className="w-2.5 h-2.5 text-[#C58A35]" />
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#766B5F] leading-relaxed max-w-md">
          {description}
        </p>
      </div>

      {/* Feature Details Panel */}
      <div className="p-6 bg-[#FFFDF8] rounded-2xl border border-[#E2D5C1] text-left w-full shadow-xs">
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#A66A22] uppercase tracking-wider mb-2.5">
          <div className="w-2 h-2 rounded-full bg-[#A66A22] animate-ping" />
          <span>Interactive module scheduled for next release</span>
        </div>
        <p className="text-xs text-[#766B5F] leading-relaxed">
          The baseline authenticated layout and navigation shells are ready. The underlying AI prompt pipelines, interactive moot simulators, precedent databases, and counsel collaboration logic will connect to this node in subsequent development phases.
        </p>
      </div>
    </div>
  );
}
