"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, SimulationSessionData } from "@/lib/api";
import { History, Award, Calendar, ArrowRight, PlusCircle, Loader2 } from "lucide-react";

export default function StudentPracticePage() {
  const [history, setHistory] = useState<SimulationSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const res = await api.getPracticeHistory();
        if (res.status === "success" && Array.isArray(res.data?.history)) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error("Failed to load practice history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Header Title */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#A66A22] text-xs font-semibold uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Courtroom Case Log</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#21170F]">Practice History</h1>
            <p className="text-xs text-[#766B5F]">
              Review score breakdowns, legal reasoning feedback, and simulated judicial outcomes.
            </p>
          </div>

          <Link
            href="/student/simulator"
            className="px-5 py-2.5 rounded-xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Case</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
            <Loader2 className="w-7 h-7 text-[#A66A22] animate-spin" />
            <p className="text-xs text-[#766B5F]">Loading practice history...</p>
          </div>
        ) : history.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-[#21170F]">No Practice Sessions Yet</h3>
              <p className="text-xs text-[#766B5F]">
                Complete your first courtroom case simulation to view performance feedback and judicial outcomes.
              </p>
            </div>
            <Link
              href="/student/simulator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] text-xs font-semibold hover:bg-[#8C571B] transition-all shadow-md"
            >
              <span>Start Your First Case</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* History Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item) => {
              const scenario = item.caseScenario;
              const dateStr = item.completedAt
                ? new Date(item.completedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Completed";

              return (
                <div
                  key={item.id}
                  className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-4 shadow-2xs hover:border-[#A66A22]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#A66A22]/10 text-[#A66A22] text-[10px] font-bold uppercase tracking-wider">
                          {scenario.practiceArea}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#21170F]/5 text-[#766B5F] text-[10px] font-bold uppercase tracking-wider">
                          {scenario.difficulty}
                        </span>
                      </div>

                      {item.overallScore !== null && item.overallScore !== undefined && (
                        <div className="flex items-center gap-1 text-xs font-bold text-[#A66A22] bg-[#A66A22]/10 px-2.5 py-1 rounded-lg border border-[#A66A22]/20">
                          <Award className="w-3.5 h-3.5" />
                          <span>{item.overallScore}%</span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#21170F] line-clamp-1">
                      {scenario.title}
                    </h3>
                    <p className="text-xs text-[#766B5F] line-clamp-2">{scenario.summary}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E2D5C1]/60">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#766B5F]">
                      <Calendar className="w-3.5 h-3.5 text-[#A66A22]" />
                      <span>{dateStr}</span>
                    </div>

                    <Link
                      href={`/student/simulator/result?sessionId=${encodeURIComponent(item.id)}`}
                      className="text-xs font-semibold text-[#A66A22] hover:text-[#8C571B] flex items-center gap-1"
                    >
                      <span>View Result</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
