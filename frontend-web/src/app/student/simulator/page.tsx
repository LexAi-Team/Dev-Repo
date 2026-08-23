"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PracticeAreaSelector from "@/components/simulator/practice-area-selector";
import DifficultySelector from "@/components/simulator/difficulty-selector";
import { api } from "@/lib/api";
import { Play, Loader2, Sparkles } from "lucide-react";

export default function CaseSimulatorPage() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState("Criminal Law");
  const [selectedDifficulty, setSelectedDifficulty] = useState("INTERMEDIATE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.createSimulatorSession(selectedArea, selectedDifficulty);
      if (res.status === "success" && res.data?.session?.id) {
        router.push(`/student/simulator/${res.data.session.id}`);
      } else {
        throw new Error("Failed to initialize session.");
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Could not start case simulation. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Title */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A66A22]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/20 text-[#A66A22] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Legal Courtroom Training</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#21170F]">
              Choose Your Case
            </h1>
            <p className="text-xs sm:text-sm text-[#766B5F] leading-relaxed">
              Step into a realistic courtroom legal scenario. Practice analyzing case facts, inspecting exhibits, identifying statutory provisions, and responding to judge queries.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* Practice Area Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[#21170F]">1. Practice Area</h2>
            <span className="text-xs text-[#766B5F]">Selected: <strong className="text-[#A66A22]">{selectedArea}</strong></span>
          </div>
          <PracticeAreaSelector selectedArea={selectedArea} onSelect={setSelectedArea} />
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-[#21170F]">2. Complexity Level</h2>
            <span className="text-xs text-[#766B5F]">Selected: <strong className="text-[#A66A22]">{selectedDifficulty}</strong></span>
          </div>
          <DifficultySelector selectedDifficulty={selectedDifficulty} onSelect={setSelectedDifficulty} />
        </div>

        {/* Start Button CTA */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleStartCase}
            disabled={isLoading}
            className="px-8 py-3.5 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing Your Legal Case Brief...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Case Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
  );
}
