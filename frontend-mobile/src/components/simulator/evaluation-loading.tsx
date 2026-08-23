"use client";

import { useEffect, useState } from "react";
import { Scale, Sparkles, ShieldCheck, Gavel, CheckCircle } from "lucide-react";

const EVALUATION_STEPS = [
  { label: "Analyzing Legal Reasoning", icon: Scale },
  { label: "Reviewing Evidence Handling", icon: ShieldCheck },
  { label: "Evaluating Argument Structure", icon: Sparkles },
  { label: "Assessing Courtroom Strategy", icon: Gavel },
  { label: "Synthesizing Judicial Outcome", icon: CheckCircle },
];

export default function EvaluationLoading() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % EVALUATION_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const ActiveStepIcon = EVALUATION_STEPS[currentStepIndex].icon;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="LEXAI is evaluating your case performance"
      className="p-8 sm:p-12 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl text-center space-y-8 max-w-xl mx-auto my-8 shadow-sm flex flex-col items-center justify-center transition-all"
    >
      {/* Central Animated Legal-AI Indicator */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer Pulsing Golden Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#A66A22]/20 animate-ping opacity-40 motion-reduce:animate-none" />
        
        {/* Spinning Gradient Border Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#A66A22] border-r-[#C58A35] animate-spin motion-reduce:animate-none" />
        
        {/* Inner Solid Circle */}
        <div className="w-16 h-16 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/30 flex items-center justify-center text-[#A66A22] shadow-inner">
          <ActiveStepIcon className="w-7 h-7 animate-pulse motion-reduce:animate-none" />
        </div>
      </div>

      {/* Main Title & Subtitle Copy */}
      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/20 text-[#A66A22] text-[11px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LEXAI Engine Active</span>
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#21170F] tracking-tight">
          Analyzing Your Performance
        </h2>
        <p className="text-xs text-[#766B5F] leading-relaxed">
          LEXAI is reviewing your legal reasoning, evidence handling, argumentation, and courtroom strategy.
        </p>
      </div>

      {/* Rotating Evaluation Focus Stages Indicator */}
      <div className="w-full pt-2">
        <div className="p-4 bg-[#F8F4EC]/60 border border-[#E2D5C1]/70 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#21170F]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#A66A22] animate-ping shrink-0 motion-reduce:animate-none" />
            <span className="font-semibold truncate">
              {EVALUATION_STEPS[currentStepIndex].label}...
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#766B5F] uppercase tracking-wider shrink-0 bg-[#FFFDF8] px-2 py-0.5 rounded-md border border-[#E2D5C1]">
            Step {currentStepIndex + 1} of {EVALUATION_STEPS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
