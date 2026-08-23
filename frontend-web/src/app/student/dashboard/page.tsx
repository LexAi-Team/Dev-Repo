"use client";

import { useAuth } from "@/lib/firebase/provider";
import {
  Sparkles,
  PlayCircle,
  Award,
  BookOpenCheck,
  Compass,
  ArrowRight,
  ChevronRight,
  History as HistoryIcon,
} from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import DashboardSection from "@/components/dashboard/dashboard-section";
import EmptyState from "@/components/dashboard/empty-state";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "Student";

  const [stats, setStats] = useState({
    casesPracticed: 0,
    averageScore: "—",
    practiceSessions: 0,
    topicsExplored: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getStudentDashboardStats();
        if (res && res.status === "success") {
          const s = res.data.stats;
          setStats({
            casesPracticed: s.casesPracticed,
            averageScore: s.averageScore > 0 ? `${s.averageScore}%` : "—",
            practiceSessions: s.practiceSessions,
            topicsExplored: s.topicsExplored,
          });
        }
      } catch (err) {
        console.debug("[StudentDashboard] Load stats failed:", err);
      }
    }
    loadStats();
  }, []);

  const learningStats = [
    { title: "Cases Practiced", value: stats.casesPracticed, icon: BookOpenCheck },
    { title: "Average Score", value: stats.averageScore, icon: Award },
    { title: "Practice Sessions", value: stats.practiceSessions, icon: PlayCircle },
    { title: "Topics Explored", value: stats.topicsExplored, icon: Compass },
  ];

  // Mock performance metrics
  const performanceMetrics = [
    { label: "Legal Reasoning", value: 88, color: "bg-[#A66A22]" },
    { label: "Evidence Handling", value: 74, color: "bg-[#C58A35]" },
    { label: "Argument Structure", value: 90, color: "bg-[#21170F]" },
    { label: "Cross Examination", value: 68, color: "bg-[#766B5F]" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          Good morning, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-[#766B5F] font-semibold leading-relaxed">
          Build your legal skills through practice, research, and collaboration.
        </p>
      </div>

      {/* SECTION A — QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {learningStats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: AI Legal Assistant, Case Simulator, Performance */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION B — AI LEGAL ASSISTANT */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
              <Sparkles className="w-32 h-32 text-[#A66A22]" />
            </div>

            <div className="max-w-xl space-y-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A66A22]/10 border border-[#A66A22]/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#A66A22]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Legal Companion</span>
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#21170F] tracking-tight">
                  Your legal research companion
                </h3>
                <p className="text-xs sm:text-sm text-[#766B5F] leading-relaxed font-medium">
                  Ask questions, explore statutory provisions, analyze landmark Supreme Court judgments, and verify target case summaries.
                </p>
              </div>

              {/* Sample question preview box */}
              <div className="bg-[#F8F4EC]/50 border border-[#E2D5C1] rounded-2xl p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#766B5F]/80">
                  Example research query
                </p>
                <p className="text-xs font-bold text-[#21170F] italic">
                  &ldquo;What is the distinction between Section 300 and Section 299 of the IPC regarding intention and knowledge?&rdquo;
                </p>
              </div>

              <Link
                href="/student/assistant"
                className="inline-flex items-center gap-2 h-11 px-5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.99]"
              >
                <span>Open AI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SECTION C — CASE SIMULATOR */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs transition-all hover:shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#766B5F]/80 block">
                  Courtroom Practice
                </span>
                <h3 className="font-serif text-lg font-bold text-[#21170F] tracking-tight">
                  Practice a case in the Moot Court simulator
                </h3>
                <p className="text-xs text-[#766B5F] leading-relaxed font-medium">
                  Test your evidentiary knowledge and cross-examination strategies in an interactive courtroom environment.
                </p>
              </div>

              {/* Mini simulation stats */}
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-wider text-[#766B5F]/80">
                <div>
                  <span className="text-xs font-bold text-[#21170F] block">92 / 100</span>
                  Best Performance
                </div>
                <div>
                  <span className="text-xs font-bold text-[#21170F] block">4 Cases</span>
                  Completed
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/student/simulator"
                className="flex items-center justify-center gap-2 w-full md:w-auto h-11 px-6 border border-[#E2D5C1] hover:bg-[#F8F4EC] text-[#21170F] rounded-xl text-xs font-bold transition-all"
              >
                <span>Start Practice</span>
                <ChevronRight className="w-4 h-4 text-[#766B5F]" />
              </Link>
            </div>
          </div>

          {/* SECTION D — PRACTICE PERFORMANCE */}
          <DashboardSection title="Practice Skill Metrics">
            <div className="space-y-4">
              {performanceMetrics.map((metric, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#21170F]">{metric.label}</span>
                    <span className="text-[#766B5F]">{metric.value}%</span>
                  </div>
                  <div className="h-2 bg-[#F8F4EC] rounded-full overflow-hidden border border-[#E2D5C1]/40">
                    <div
                      className={`h-full ${metric.color} rounded-full`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        {/* Right column: Recent Activity & Community */}
        <div className="space-y-6">
          {/* SECTION E — RECENT ACTIVITY */}
          <DashboardSection title="Recent Activity">
            <EmptyState
              icon={HistoryIcon}
              title="No practice history yet"
              explanation="Start a case simulation or ask a research question to build your log."
              actionLabel="Explore Case Files"
              onAction={() => {}}
            />
          </DashboardSection>

          {/* SECTION F — COMMUNITY */}
          <DashboardSection
            title="Ecosystem Community"
            action={
              <Link
                href="/student/community"
                className="text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-3.5">
              {/* Discuss item 1 */}
              <div className="p-3.5 bg-[#F8F4EC]/50 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all cursor-pointer space-y-1.5">
                <span className="text-[9px] font-bold text-[#A66A22] uppercase tracking-widest">
                  Constitutional Law
                </span>
                <h4 className="text-xs font-bold text-[#21170F] leading-snug">
                  Analyzing the evolution of basic structure doctrine in Kesavananda Bharati
                </h4>
                <div className="flex justify-between text-[10px] text-[#766B5F] font-semibold">
                  <span>14 Replies</span>
                  <span>Active 2h ago</span>
                </div>
              </div>

              {/* Discuss item 2 */}
              <div className="p-3.5 bg-[#F8F4EC]/50 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all cursor-pointer space-y-1.5">
                <span className="text-[9px] font-bold text-[#A66A22] uppercase tracking-widest">
                  Ecosystem Mentorship
                </span>
                <h4 className="text-xs font-bold text-[#21170F] leading-snug">
                  Bar exam prep advice from practicing advocates
                </h4>
                <div className="flex justify-between text-[10px] text-[#766B5F] font-semibold">
                  <span>8 Replies</span>
                  <span>Active 5h ago</span>
                </div>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
