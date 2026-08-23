"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  explanation: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  explanation,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#E2D5C1] rounded-2xl bg-[#F8F4EC]/30">
      <div className="w-10 h-10 rounded-full bg-[#E2D5C1]/20 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-[#766B5F]/75" />
      </div>
      <h3 className="text-sm font-bold text-[#21170F] mb-1">{title}</h3>
      <p className="text-xs text-[#766B5F] max-w-xs leading-relaxed mb-4">
        {explanation}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center h-9 px-4 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.99]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
