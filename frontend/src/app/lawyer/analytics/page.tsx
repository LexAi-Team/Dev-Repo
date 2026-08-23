"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckSquare,
  Sparkles,
  PieChart,
  TrendingUp,
  Scale,
  FileText,
  AlertCircle,
  Clock,
  Activity
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";
import Link from "next/link";

export default function LawyerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");
    try {
      const res = await api.getLawyerAnalytics();
      if (res && res.status === "success") {
        setData(res.data);
      } else {
        setError((res as any).message || "Failed to load analytics.");
      }
    } catch (err: unknown) {
      console.error("[Analytics Load Error]:", err);
      setError("An error occurred while loading analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <PageSkeleton />;

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Practice Reports & Analytics" subtitle="View actionable insights on cases, tasks, hearings, and research." />
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-bold text-rose-800">Failed to load analytics</h3>
          <p className="text-xs text-rose-600">{error}</p>
          <button onClick={loadAnalytics} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { caseload, hearings, tasks, research, documents, workload, priorities } = data;

  const docCompletionRate = documents.total > 0 ? Math.round((documents.analyzed / documents.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Practice Reports & Analytics"
        subtitle="Insights into active litigation caseloads, court appearances, task completion rates, and practice trends."
      />

      {/* Caseload Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#766B5F]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#21170F]">{caseload.total}</p>
        </div>
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#21170F]">{caseload.active}</p>
        </div>
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#21170F]">{caseload.pending}</p>
        </div>
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Disposed</span>
            <Scale className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#21170F]">{caseload.disposed}</p>
        </div>
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">Archived</span>
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#21170F]">{caseload.archived}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Case Types Distribution */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#A66A22]" />
              <span>Caseload Distribution by Practice Area</span>
            </span>
          </div>
          {Object.keys(caseload.byType).length === 0 ? (
            <p className="text-xs text-[#766B5F] text-center p-4">No practice data available.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(caseload.byType).map(([type, count]) => {
                const percentage = Math.round(((count as number) / caseload.total) * 100);
                return (
                  <div key={type} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-[#21170F]">
                      <span>{type}</span>
                      <span>{count as number} cases ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F8F4EC] rounded-full overflow-hidden border border-[#E2D5C1]/40">
                      <div className="h-full bg-[#A66A22] rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Priorities & Hearing Overview */}
        <div className="space-y-6">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2 border-b border-[#E2D5C1]/40 pb-3">
              <Calendar className="w-4 h-4 text-[#A66A22]" />
              <span>Upcoming Priorities</span>
            </span>
            {priorities.length === 0 ? (
              <p className="text-xs text-[#766B5F]">No immediate priorities.</p>
            ) : (
              <div className="space-y-3">
                {priorities.map((p: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-xl">
                    {p.type === "OVERDUE_TASK" ? (
                      <CheckSquare className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
                    ) : (
                      <Calendar className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                        {p.type === "OVERDUE_TASK" ? "Overdue Task" : "Upcoming Hearing"}
                      </p>
                      <p className="text-xs font-bold text-[#21170F]">{p.title}</p>
                      <p className="text-[10px] text-[#766B5F]">Case: {p.case} • Date: {new Date(p.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Productivity */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2 border-b border-[#E2D5C1]/40 pb-3">
            <CheckSquare className="w-4 h-4 text-[#A66A22]" />
            <span>Task Productivity</span>
          </span>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40 text-center">
              <p className="text-[10px] font-bold uppercase text-[#766B5F]">Pending</p>
              <p className="text-2xl font-serif font-bold text-[#21170F]">{tasks.pending}</p>
            </div>
            <div className="p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40 text-center">
              <p className="text-[10px] font-bold uppercase text-[#766B5F]">In Progress</p>
              <p className="text-2xl font-serif font-bold text-blue-700">{tasks.inProgress}</p>
            </div>
            <div className="p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40 text-center">
              <p className="text-[10px] font-bold uppercase text-[#766B5F]">Completed</p>
              <p className="text-2xl font-serif font-bold text-emerald-700">{tasks.completed}</p>
            </div>
            <div className="p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40 text-center">
              <p className="text-[10px] font-bold uppercase text-[#766B5F]">Overdue</p>
              <p className="text-2xl font-serif font-bold text-rose-600">{tasks.overdue}</p>
            </div>
          </div>
          <p className="text-xs text-[#766B5F] mt-2 italic border-t border-[#E2D5C1]/40 pt-2">
            Insight: {tasks.overdue} tasks are currently overdue based on their deadlines.
          </p>
        </div>

        {/* Document Activity */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2 border-b border-[#E2D5C1]/40 pb-3">
            <FileText className="w-4 h-4 text-[#A66A22]" />
            <span>Document Intelligence</span>
          </span>
          <div className="flex items-center justify-between p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40">
            <div>
              <p className="text-xs font-bold text-[#21170F]">Total Documents</p>
              <p className="text-[10px] text-[#766B5F]">{documents.addedThisMonth} added this month</p>
            </div>
            <p className="text-xl font-serif font-bold text-[#A66A22]">{documents.total}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/40">
            <div>
              <p className="text-xs font-bold text-[#21170F]">Analyzed by AI</p>
              <p className="text-[10px] text-[#766B5F]">{docCompletionRate}% completion rate</p>
            </div>
            <p className="text-xl font-serif font-bold text-emerald-700">{documents.analyzed}</p>
          </div>
          <p className="text-[10px] text-amber-700 font-bold bg-amber-50 p-2 rounded-lg text-center border border-amber-100">
            {documents.pending} documents pending intelligence extraction.
          </p>
        </div>

        {/* Case Workload */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-2">
          <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2 border-b border-[#E2D5C1]/40 pb-3">
            <Activity className="w-4 h-4 text-[#A66A22]" />
            <span>Active Case Workload (Requires Attention)</span>
          </span>
          {workload.length === 0 ? (
            <p className="text-xs text-[#766B5F]">No active cases require immediate attention.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D5C1]/40">
                    <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Case Name</th>
                    <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Pending Tasks</th>
                    <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Upcoming Hearings</th>
                    <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-[#21170F]">
                  {workload.map((cw: any) => (
                    <tr key={cw.id} className="border-b border-[#E2D5C1]/20">
                      <td className="py-3 pr-4">
                        <span className="block">{cw.title}</span>
                        <span className="text-[10px] text-[#766B5F] font-normal">{cw.caseNumber}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-100">{cw.pendingTasks}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-800 rounded-md border border-blue-100">{cw.upcomingHearings}</span>
                      </td>
                      <td className="py-3">
                        <Link href={`/lawyer/cases/${cw.id}`} className="text-[#A66A22] hover:underline text-[10px] font-bold">
                          View Workspace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Research Activity */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A66A22]" />
              <span>LexAI Legal Research Volume</span>
            </span>
            <div className="flex gap-4 text-xs font-bold text-[#766B5F]">
              <span>Total: {research.total}</span>
              <span>This Month: {research.thisMonth}</span>
            </div>
          </div>
          {research.recent.length === 0 ? (
            <p className="text-xs text-[#766B5F] p-4 text-center">No saved research yet.</p>
          ) : (
            <div className="space-y-3">
              {research.recent.map((r: any) => (
                <div key={r.id} className="p-3 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-xl flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#21170F]">{r.query}</p>
                    <p className="text-[10px] text-[#766B5F]">Case: {r.case}</p>
                  </div>
                  <span className="text-[10px] font-medium text-[#766B5F] shrink-0">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[#766B5F] italic pt-2">
            Insight: {research.thisMonth} research items were saved this month, contributing to intelligent Case Briefs.
          </p>
        </div>

      </div>
    </div>
  );
}
