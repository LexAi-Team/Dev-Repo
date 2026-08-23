"use client";

import { Gavel, AlertCircle } from "lucide-react";

interface SimulatedJudgmentProps {
  judgmentText: string;
}

export default function SimulatedJudgment({ judgmentText }: SimulatedJudgmentProps) {
  return (
    <div className="bg-[#21170F] text-[#FFFDF8] rounded-2xl p-6 border border-[#A66A22]/40 shadow-md space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[#A66A22]/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A66A22] text-[#FFFDF8] flex items-center justify-center border border-[#D9B16A]/40 shadow-sm shrink-0">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#D9B16A] tracking-tight">
              Simulated Judicial Outcome
            </h3>
            <p className="text-[11px] text-[#FFFDF8]/70 font-sans">
              High Court / Magistrate Bench Simulation Ruling
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A66A22]/20 border border-[#A66A22]/40 text-[#D9B16A] text-[10px] font-bold uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Educational Simulation</span>
        </div>
      </div>

      {/* Judgment Text */}
      <div className="p-4 bg-[#F8F4EC]/10 border border-[#A66A22]/20 rounded-xl text-xs sm:text-sm text-[#FFFDF8]/90 leading-relaxed font-sans">
        {judgmentText}
      </div>

      {/* Required Legal Disclaimer */}
      <div className="p-3 bg-[#A66A22]/15 border border-[#A66A22]/30 rounded-xl flex items-center gap-2 text-[11px] text-[#D9B16A]">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          <strong>AI-Simulated Outcome — For Educational Practice Only.</strong> This outcome is generated solely for law student educational training and does not constitute formal legal advice or binding judicial authority.
        </span>
      </div>
    </div>
  );
}
