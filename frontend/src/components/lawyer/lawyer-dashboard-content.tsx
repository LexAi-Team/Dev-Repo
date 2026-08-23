"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, LawyerDashboardResponse, CaseItem } from "@/lib/api";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Plus,
  Search,
  Sparkles,
  Scale,
  Clock,
  ChevronRight,
  XCircle,
  X,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function LawyerDashboardContent() {
  const [data, setData] = useState<LawyerDashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal States
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showNewHearingModal, setShowNewHearingModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form Input States
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCaseNumber, setNewCaseNumber] = useState("");
  const [newCaseType, setNewCaseType] = useState("CIVIL");
  const [newCaseCourt, setNewCaseCourt] = useState("");
  const [newCaseClient, setNewCaseClient] = useState("");
  const [newCaseOpposing, setNewCaseOpposing] = useState("");

  const [newHearingTitle, setNewHearingTitle] = useState("");
  const [newHearingStart, setNewHearingStart] = useState("");
  const [newHearingLocation, setNewHearingLocation] = useState("");
  const [newHearingCaseId, setNewHearingCaseId] = useState("");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskDueAt, setNewTaskDueAt] = useState("");
  const [newTaskCaseId, setNewTaskCaseId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.getLawyerDashboardStats();
      if (response && response.status === "success") {
        setData(response.data);
      } else {
        setError("Failed to load advocate dashboard statistics.");
      }
    } catch (err: unknown) {
      console.error("[Advocate Dashboard Error]:", err);
      setError("Unable to connect to the backend server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createCase({
        title: newCaseTitle,
        caseNumber: newCaseNumber,
        caseType: newCaseType,
        court: newCaseCourt,
        clientName: newCaseClient,
        opposingParty: newCaseOpposing,
      });
      if (res && res.status === "success") {
        setShowNewCaseModal(false);
        setNewCaseTitle("");
        setNewCaseNumber("");
        setNewCaseCourt("");
        setNewCaseClient("");
        setNewCaseOpposing("");
        fetchDashboardData();
      }
    } catch (err: unknown) {
      console.error("[Create Case Error]:", err);
      alert("Failed to create case file. Please verify case number is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDate = new Date(newHearingStart);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const res = await api.createCalendarEvent({
        title: newHearingTitle,
        type: "HEARING",
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        location: newHearingLocation || undefined,
        caseId: newHearingCaseId || undefined,
      });
      if (res && res.status === "success") {
        setShowNewHearingModal(false);
        setNewHearingTitle("");
        setNewHearingStart("");
        setNewHearingLocation("");
        setNewHearingCaseId("");
        fetchDashboardData();
      }
    } catch (err: unknown) {
      console.error("[Create Hearing Error]:", err);
      alert("Failed to schedule hearing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        dueAt: newTaskDueAt ? new Date(newTaskDueAt).toISOString() : undefined,
        caseId: newTaskCaseId || undefined,
      });
      if (res && res.status === "success") {
        setShowNewTaskModal(false);
        setNewTaskTitle("");
        setNewTaskDueAt("");
        setNewTaskCaseId("");
        fetchDashboardData();
      }
    } catch (err: unknown) {
      console.error("[Create Task Error]:", err);
      alert("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-rose-100 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider">
          Dashboard Load Failed
        </h3>
        <p className="text-xs text-[#766B5F] leading-relaxed">
          {error || "An unexpected error occurred while fetching advocate metrics."}
        </p>
      </div>
    );
  }

  const { stats, upcomingHearingsList = [], activeCasesList = [], recentTasks = [] } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Advocate Practice Workspace"
        subtitle="Manage active cases, statutory research, court hearings, and team collaboration."
      />

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowNewCaseModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Case</span>
        </button>

        <Link
          href="/lawyer/research"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-[#E2D5C1] text-[#21170F] rounded-xl font-bold text-xs shadow-2xs transition-all"
        >
          <Search className="w-4 h-4 text-[#A66A22]" />
          <span>Legal Research</span>
        </Link>

        <button
          onClick={() => setShowNewHearingModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-[#E2D5C1] text-[#21170F] rounded-xl font-bold text-xs shadow-2xs transition-all"
        >
          <Scale className="w-4 h-4 text-[#A66A22]" />
          <span>+ Add Hearing</span>
        </button>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFDF8] hover:bg-[#F8F4EC] border border-[#E2D5C1] text-[#21170F] rounded-xl font-bold text-xs shadow-2xs transition-all"
        >
          <CheckSquare className="w-4 h-4 text-[#A66A22]" />
          <span>+ Create Task</span>
        </button>

        <Link
          href="/lawyer/assistant"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#A66A22]/10 hover:bg-[#A66A22]/20 border border-[#A66A22]/30 text-[#A66A22] rounded-xl font-bold text-xs shadow-2xs transition-all ml-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask LexAI</span>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Active Cases
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{stats.activeCases}</p>
          <span className="text-[11px] text-[#766B5F] block">Persisted Case Files</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Upcoming Hearings
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{stats.upcomingHearings}</p>
          <span className="text-[11px] text-[#766B5F] block">Scheduled Court Dates</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              Pending Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{stats.pendingTasks}</p>
          <span className="text-[11px] text-[#766B5F] block">Action Items</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
              High Priority
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{stats.highPriorityTasks}</p>
          <span className="text-[11px] text-[#766B5F] block">Urgent Matters</span>
        </div>
      </div>

      {/* Main Grid: Active Cases & Upcoming Hearings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases Column */}
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Active Case Files</h2>
              <p className="text-xs text-[#766B5F]">Recent active legal matters under your representation.</p>
            </div>
            <Link
              href="/lawyer/cases"
              className="text-xs font-bold text-[#A66A22] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {activeCasesList.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-3">
              <Briefcase className="w-8 h-8 text-[#766B5F]/50 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No active cases yet</p>
              <p className="text-[11px] text-[#766B5F]">
                Click <span className="font-bold">&ldquo;+ New Case&rdquo;</span> to start managing your legal matters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCasesList.map((c: CaseItem) => (
                <Link
                  key={c.id}
                  href={`/lawyer/cases/${c.id}`}
                  className="block p-4 bg-[#F8F4EC]/50 hover:bg-[#A66A22]/5 border border-[#E2D5C1]/40 hover:border-[#A66A22]/40 rounded-2xl transition-all shadow-2xs group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-md">
                          {c.caseNumber}
                        </span>
                        <span className="text-xs font-bold text-[#21170F] group-hover:text-[#A66A22] transition-colors">
                          {c.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#766B5F]">
                        {c.court} &bull; <span className="font-semibold text-[#21170F]">{c.clientName}</span> vs <span className="font-semibold text-[#21170F]">{c.opposingParty}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {c.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#766B5F]/50 group-hover:text-[#A66A22]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Hearings Column */}
        <div className="lg:col-span-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Court Hearings</h2>
              <p className="text-xs text-[#766B5F]">Next scheduled court dates.</p>
            </div>
            <Link
              href="/lawyer/tasks"
              className="text-xs font-bold text-[#A66A22] hover:underline flex items-center gap-1"
            >
              <span>Calendar</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingHearingsList.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-3">
              <Calendar className="w-8 h-8 text-[#766B5F]/50 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No upcoming hearings</p>
              <p className="text-[11px] text-[#766B5F]">All court schedules are up to date.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingHearingsList.map((h) => {
                const hearingDate = new Date(h.startAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={h.id}
                    className="p-3.5 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#21170F] truncate">{h.title}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {hearingDate}
                      </span>
                    </div>
                    {h.case && (
                      <p className="text-[11px] text-[#766B5F]">
                        {h.case.court} &bull; <span className="font-semibold">{h.case.title}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Tasks Subsection */}
          <div className="pt-4 border-t border-[#E2D5C1]/40 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#766B5F]">
              Priority Tasks ({recentTasks.length})
            </h3>
            {recentTasks.length === 0 ? (
              <p className="text-[11px] text-[#766B5F]">No pending tasks.</p>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 bg-[#F8F4EC]/30 rounded-xl border border-[#E2D5C1]/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#21170F] truncate">{t.title}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        t.priority === "HIGH" || t.priority === "URGENT"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW CASE MODAL */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Create New Case File</h3>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="p-1 text-[#766B5F] hover:text-[#21170F] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Case Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseNumber}
                    onChange={(e) => setNewCaseNumber(e.target.value)}
                    placeholder="e.g. WP/2026/1042"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Case Type
                  </label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  >
                    <option value="CRIMINAL">Criminal</option>
                    <option value="CIVIL">Civil</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="CONSTITUTIONAL">Constitutional</option>
                    <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                    <option value="FAMILY">Family</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Case Title
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. State of Tamil Nadu v. K. Rajan"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Court / Jurisdiction
                </label>
                <input
                  type="text"
                  required
                  value={newCaseCourt}
                  onChange={(e) => setNewCaseCourt(e.target.value)}
                  placeholder="e.g. High Court of Judicature at Madras"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Petitioner / Client
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseClient}
                    onChange={(e) => setNewCaseClient(e.target.value)}
                    placeholder="Client Name"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Respondent / Opposing Party
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseOpposing}
                    onChange={(e) => setNewCaseOpposing(e.target.value)}
                    placeholder="Opposing Party Name"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E2D5C1] text-xs font-bold text-[#766B5F] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW HEARING MODAL */}
      {showNewHearingModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Schedule Court Hearing</h3>
              <button
                onClick={() => setShowNewHearingModal(false)}
                className="p-1 text-[#766B5F] hover:text-[#21170F] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHearing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Hearing Title
                </label>
                <input
                  type="text"
                  required
                  value={newHearingTitle}
                  onChange={(e) => setNewHearingTitle(e.target.value)}
                  placeholder="e.g. Arguments on Interim Stay"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newHearingStart}
                  onChange={(e) => setNewHearingStart(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Court Room / Location
                </label>
                <input
                  type="text"
                  value={newHearingLocation}
                  onChange={(e) => setNewHearingLocation(e.target.value)}
                  placeholder="e.g. Court Hall No. 4, Madras High Court"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Link Case File (Optional)
                </label>
                <select
                  value={newHearingCaseId}
                  onChange={(e) => setNewHearingCaseId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                >
                  <option value="">No case linked</option>
                  {activeCasesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => setShowNewHearingModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E2D5C1] text-xs font-bold text-[#766B5F] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Hearing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Create Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 text-[#766B5F] hover:text-[#21170F] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Draft Written Statement for Case #1042"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueAt}
                    onChange={(e) => setNewTaskDueAt(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Link Case File (Optional)
                </label>
                <select
                  value={newTaskCaseId}
                  onChange={(e) => setNewTaskCaseId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                >
                  <option value="">No case linked</option>
                  {activeCasesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E2D5C1] text-xs font-bold text-[#766B5F] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
