"use client";

import { CheckCircle2 } from "lucide-react";

export const STAGES = [
  { id: "CASE_BRIEF", label: "1. Brief" },
  { id: "FACT_ANALYSIS", label: "2. Facts" },
  { id: "EVIDENCE_REVIEW", label: "3. Evidence" },
  { id: "ISSUE_IDENTIFICATION", label: "4. Issues" },
  { id: "LEGAL_STRATEGY", label: "5. Strategy" },
  { id: "PROCEEDINGS", label: "6. Courtroom" },
  { id: "FINAL_ARGUMENT", label: "7. Argument" },
  { id: "EVALUATION", label: "8. Judgment" },
];

interface StageProgressProps {
  currentStage: string;
  onSelectStage?: (stageId: string) => void;
}

export default function StageProgress({ currentStage, onSelectStage }: StageProgressProps) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="w-full bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-3 shadow-2xs overflow-x-auto custom-scrollbar">
      <div className="flex items-center justify-between min-w-[640px] gap-2">
        {STAGES.map((stage, idx) => {
          const isCurrent = stage.id === currentStage;
          const isCompleted = idx < currentIndex;
          const isClickable = idx <= currentIndex;

          return (
            <button
              key={stage.id}
              disabled={!isClickable}
              onClick={() => onSelectStage && isClickable && onSelectStage(stage.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all outline-none ${
                isCurrent
                  ? "bg-[#A66A22] text-[#FFFDF8] shadow-xs"
                  : isCompleted
                  ? "bg-[#A66A22]/10 text-[#A66A22] hover:bg-[#A66A22]/20"
                  : "text-[#766B5F]/50 cursor-not-allowed"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A66A22]" />
              ) : (
                <span className="text-[10px] opacity-80">{idx + 1}</span>
              )}
              <span className="truncate">{stage.label.split(". ")[1]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
