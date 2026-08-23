"use client";

import { Award } from "lucide-react";

interface PerformanceRadarProps {
  scores: {
    legalReasoningScore: number;
    issueIdentificationScore: number;
    evidenceHandlingScore: number;
    argumentationScore: number;
    proceduralAwarenessScore: number;
    counterargumentHandlingScore: number;
    strategyScore: number;
    overallScore: number;
  };
}

export default function PerformanceRadar({ scores }: PerformanceRadarProps) {
  const items = [
    { label: "Legal Reasoning (25%)", score: scores.legalReasoningScore },
    { label: "Argumentation (20%)", score: scores.argumentationScore },
    { label: "Issue Identification (15%)", score: scores.issueIdentificationScore },
    { label: "Evidence Handling (15%)", score: scores.evidenceHandlingScore },
    { label: "Procedural Awareness (10%)", score: scores.proceduralAwarenessScore },
    { label: "Counterarguments (10%)", score: scores.counterargumentHandlingScore },
    { label: "Legal Strategy (5%)", score: scores.strategyScore },
  ];

  return (
    <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-6 space-y-5 shadow-2xs">
      {/* Overall Score Badge Header */}
      <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-4">
        <div>
          <h3 className="font-serif font-bold text-base text-[#21170F]">Performance Scorecard</h3>
          <p className="text-xs text-[#766B5F]">Weighted analysis across 7 core legal dimensions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A66A22] text-[#FFFDF8] shadow-xs">
          <Award className="w-5 h-5 text-[#FFFDF8]" />
          <span className="font-serif font-bold text-lg">{scores.overallScore}%</span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#21170F]">
              <span>{item.label}</span>
              <span className="font-bold text-[#A66A22]">{item.score}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#F8F4EC] rounded-full overflow-hidden border border-[#E2D5C1]/60">
              <div
                className="h-full bg-gradient-to-r from-[#A66A22] to-[#C58A35] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
