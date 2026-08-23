"use client";

import { useEffect, useState } from "react";
import { api, CaseItem } from "@/lib/api";
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  Sparkles,
  PieChart,
  TrendingUp,
  Scale,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function LawyerAnalyticsPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getCases();
        if (res && res.status === "success") {
          setCases(res.data.cases || []);
        }
      } catch (err: unknown) {
        console.error("[Analytics Load Error]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) return <PageSkeleton />;

  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === "ACTIVE").length;
  const disposedCases = cases.filter((c) => c.status === "DISPOSED").length;
  const pendingCases = cases.filter((c) => c.status === "PENDING").length;

  // Case Types Breakdown
  const typeCounts: Record<string, number> = {};
  cases.forEach((c) => {
    typeCounts[c.caseType] = (typeCounts[c.caseType] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Reports & Analytics"
        subtitle="Insights into active litigation caseloads, court appearances, task completion rates, and practice trends."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Total Case Files
            </span>
            <Briefcase className="w-5 h-5 text-[#A66A22]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{totalCases}</p>
          <span className="text-[11px] text-[#766B5F]">Registered Matters</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Active Matters
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{activeCases}</p>
          <span className="text-[11px] text-[#766B5F]">In Active Litigation</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Disposed Cases
            </span>
            <Scale className="w-5 h-5 text-blue-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{disposedCases}</p>
          <span className="text-[11px] text-[#766B5F]">Concluded Decrees</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Pending Review
            </span>
            <Calendar className="w-5 h-5 text-amber-700" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{pendingCases}</p>
          <span className="text-[11px] text-[#766B5F]">Awaiting First Hearing</span>
        </div>
      </div>

      {/* Case Types & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#A66A22]" />
              <span>Caseload Distribution by Practice Area</span>
            </span>
          </div>

          {Object.keys(typeCounts).length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <BarChart3 className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No practice data yet</p>
              <p className="text-[11px] text-[#766B5F]">Register case files to view caseload distribution graphics.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(typeCounts).map(([type, count]) => {
                const percentage = Math.round((count / totalCases) * 100);
                return (
                  <div key={type} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[#21170F]">
                      <span>{type}</span>
                      <span>{count} cases ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F8F4EC] rounded-full overflow-hidden border border-[#E2D5C1]/40">
                      <div
                        className="h-full bg-[#A66A22] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A66A22]" />
              <span>LexAI Legal Research Volume</span>
            </span>
          </div>

          <div className="p-6 bg-[#F8F4EC]/40 border border-[#E2D5C1]/30 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#21170F]">Statutory Queries Processed</span>
              <span className="font-serif font-bold text-lg text-[#A66A22]">Active</span>
            </div>
            <p className="text-[#766B5F] leading-relaxed">
              LexAI RAG statutory pipeline is integrated with your practice workspace for instant statutory analysis, act lookup, and judgment citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
