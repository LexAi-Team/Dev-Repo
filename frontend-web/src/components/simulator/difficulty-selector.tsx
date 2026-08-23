"use client";

import { Award, Zap, Flame } from "lucide-react";

export const DIFFICULTIES = [
  {
    id: "BEGINNER",
    label: "Beginner",
    icon: Award,
    desc: "Focus on identifying basic legal issues, primary statutory sections, and straightforward factual evidence.",
  },
  {
    id: "INTERMEDIATE",
    label: "Intermediate",
    icon: Zap,
    desc: "Multiple legal issues, conflicting witness testimonies, procedural objections, and disputed exhibit evidence.",
  },
  {
    id: "ADVANCED",
    label: "Advanced",
    icon: Flame,
    desc: "Complex legal facts, ambiguous statutory provisions, aggressive opposing counsel challenges, and high-court precedent analysis.",
  },
];

interface DifficultySelectorProps {
  selectedDifficulty: string;
  onSelect: (diffId: string) => void;
}

export default function DifficultySelector({ selectedDifficulty, onSelect }: DifficultySelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {DIFFICULTIES.map((diff) => {
        const Icon = diff.icon;
        const isSelected = selectedDifficulty === diff.id;

        return (
          <button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 outline-none ${
              isSelected
                ? "bg-[#A66A22]/10 border-[#A66A22] shadow-xs"
                : "bg-[#FFFDF8] border-[#E2D5C1] hover:border-[#A66A22]/40 hover:bg-[#F8F4EC]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-[#A66A22] text-[#FFFDF8] border-[#A66A22]"
                      : "bg-[#A66A22]/10 text-[#A66A22] border-[#A66A22]/20"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-serif font-bold text-xs text-[#21170F] uppercase tracking-wider">
                  {diff.label}
                </h4>
              </div>
            </div>
            <p className="text-xs text-[#766B5F] leading-relaxed">{diff.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
