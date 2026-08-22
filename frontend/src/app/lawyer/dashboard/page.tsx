"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/firebase/provider";
import { api } from "@/lib/api";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Clock,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/dashboard/stat-card";
import DashboardSection from "@/components/dashboard/dashboard-section";
import EmptyState from "@/components/dashboard/empty-state";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

interface DashboardCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  court: string;
  clientName: string;
  opposingParty: string;
  nextHearingAt?: string | null;
}

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
  case?: {
    title: string;
    caseNumber: string;
  } | null;
}

export default function LawyerDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "Counsel";

  const [cases, setCases] = useState<DashboardCase[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [serverStats, setServerStats] = useState<{
    activeCases: number;
    upcomingHearings: number;
    pendingTasks: number;
    highPriorityTasks: number;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [casesRes, tasksRes, statsRes] = await Promise.all([
          api.getCases(),
          api.getTasks(),
          api.getLawyerDashboardStats(),
        ]);

        if (casesRes && casesRes.status === "success") {
          setCases((casesRes.data.cases as DashboardCase[]) || []);
        }
        if (tasksRes && tasksRes.status === "success") {
          setTasks((tasksRes.data.tasks as DashboardTask[]) || []);
        }
        if (statsRes && statsRes.status === "success") {
          setServerStats(statsRes.data.stats);
        }
      } catch (err) {
        console.debug("[LawyerDashboard] Load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <PageSkeleton />;
  }

  // Use server database counts if available, otherwise derive from loaded lists
  const activeCasesCount = serverStats ? serverStats.activeCases : (cases.filter((c) => c.status === "ACTIVE" || c.status === "OPEN").length || cases.length);
  const upcomingHearingsCount = serverStats ? serverStats.upcomingHearings : cases.filter((c) => c.nextHearingAt).length;
  const pendingTasksCount = serverStats ? serverStats.pendingTasks : tasks.filter((t) => t.status !== "COMPLETED").length;
  const highPriorityTasksCount = serverStats ? serverStats.highPriorityTasks : tasks.filter(
    (t) => (t.priority === "HIGH" || t.priority === "URGENT") && t.status !== "COMPLETED"
  ).length;

  const stats = [
    { title: "Active Cases", value: activeCasesCount, icon: Briefcase },
    { title: "Upcoming Hearings", value: upcomingHearingsCount, icon: Calendar },
    { title: "Pending Tasks", value: pendingTasksCount, icon: CheckSquare },
    { title: "High Priority Tasks", value: highPriorityTasksCount, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          Good morning, Adv. {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-[#766B5F] font-semibold leading-relaxed">
          Here&apos;s your practice overview.
        </p>
      </div>

      {/* SECTION A — CASE STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Cases, Tasks, Schedules */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION B — TODAY'S SCHEDULE */}
          <DashboardSection title="Today's Schedule">
            {upcomingHearingsCount === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No hearings or meetings today"
                explanation="Your calendar is clear. Check the hearings tab for long-range planning."
                actionLabel="View Calendar"
                onAction={() => {}}
              />
            ) : (
              <div className="space-y-3">
                {cases
                  .filter((c) => c.nextHearingAt)
                  .map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-[#E2D5C1]/40 bg-[#FFFDF8] rounded-xl hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20">
                          <Clock className="w-4 h-4 text-[#A66A22]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#21170F]">{c.title}</p>
                          <p className="text-[10px] text-[#766B5F] font-semibold">
                            Hearing &bull; {c.court} &bull; Case No: {c.caseNumber}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {new Date(c.nextHearingAt!).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </DashboardSection>

          {/* SECTION C — TASKS */}
          <DashboardSection
            title="Pending Work Items"
            action={
              <Link
                href="/lawyer/tasks"
                className="text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors flex items-center gap-0.5"
              >
                <span>View All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {tasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks found"
                explanation="All assignments are completed. Allocate files or outline arguments."
                actionLabel="Create Task"
                onAction={() => {}}
              />
            ) : (
              <div className="space-y-3.5">
                {tasks.slice(0, 3).map((task, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-[#F8F4EC]/40 hover:bg-[#F8F4EC]/70 border border-[#E2D5C1]/40 rounded-2xl transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#21170F]">{task.title}</h4>
                      <p className="text-[10px] text-[#766B5F] font-semibold">
                        Case: {task.case?.title || "General"} &bull; Priority: {task.priority}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#766B5F] border border-[#E2D5C1] px-2 py-0.5 rounded-full uppercase">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>

          {/* SECTION D — ACTIVE CASES */}
          <DashboardSection
            title="Active Case Files"
            action={
              <Link
                href="/lawyer/cases"
                className="text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors flex items-center gap-0.5"
              >
                <span>View Cases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {cases.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No cases registered"
                explanation="Register dynamic client records to trace filings, precedents and next hearings."
                actionLabel="Add Client Case"
                onAction={() => {}}
              />
            ) : (
              <div className="space-y-3">
                {cases.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    className="p-4 border border-[#E2D5C1]/40 bg-[#FFFDF8] rounded-xl hover:shadow-xs transition-all flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#21170F]">{c.title}</p>
                      <p className="text-[10px] text-[#766B5F] font-semibold">
                        No: {c.caseNumber} &bull; Client: {c.clientName} &bull; Opp: {c.opposingParty}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Right Column: AI Assistant, Collaboration */}
        <div className="space-y-6">
          {/* SECTION F — AI ASSISTANT */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#A66A22]/10 border border-[#A66A22]/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#A66A22]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Legal Assistant</span>
              </span>
              <h3 className="font-serif text-lg font-bold text-[#21170F] tracking-tight">
                Need legal research?
              </h3>
              <p className="text-xs text-[#766B5F] leading-relaxed font-semibold">
                Draft briefs, look up sections, and cross-reference active precedents instantly.
              </p>
              <Link
                href="/lawyer/assistant"
                className="inline-flex items-center gap-2 h-10 px-4 bg-[#21170F] hover:bg-[#332218] text-[#FFFDF8] rounded-xl text-xs font-bold transition-all"
              >
                <span>Ask the AI Assistant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SECTION E — COLLABORATION */}
          <DashboardSection
            title="Counsel Collaboration"
            action={
              <Link
                href="/lawyer/collaboration"
                className="text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors flex items-center gap-0.5"
              >
                <span>Open Collaboration</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="space-y-3">
              <div className="p-3.5 bg-[#F8F4EC]/50 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20">
                  <Users className="w-4 h-4 text-[#A66A22]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#21170F] truncate">Moot briefing sync</h4>
                  <p className="text-[10px] text-[#766B5F] truncate">Junior Counsel: Brief draft compiled...</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#F8F4EC]/50 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all cursor-pointer flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20">
                  <User className="w-4 h-4 text-[#A66A22]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#21170F] truncate">Evidence log shared</h4>
                  <p className="text-[10px] text-[#766B5F] truncate">Lead Counsel: Please inspect exhibit C...</p>
                </div>
              </div>
            </div>
          </DashboardSection>
        </div>
      </div>
    </div>
  );
}
