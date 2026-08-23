"use client";

import { useEffect, useState, useCallback } from "react";
import { api, CaseItem } from "@/lib/api";
import {
  CheckSquare,
  Calendar,
  Plus,
  Filter,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueAt?: string | null;
  case?: { id: string; title: string; caseNumber: string } | null;
}

interface EventItem {
  id: string;
  title: string;
  type: string;
  startAt: string;
  endAt: string;
  location?: string | null;
  case?: { id: string; title: string; caseNumber: string } | null;
}

export default function LawyerTasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"tasks" | "calendar">("tasks");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskCaseId, setTaskCaseId] = useState("");

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("HEARING");
  const [eventStart, setEventStart] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventCaseId, setEventCaseId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tRes, eRes, cRes] = await Promise.all([
        api.getTasks(),
        api.getCalendarEvents(),
        api.getCases(),
      ]);

      if (tRes && tRes.status === "success") {
        setTasks((tRes.data.tasks as TaskItem[]) || []);
      }
      if (eRes && eRes.status === "success") {
        setEvents((eRes.data.events as EventItem[]) || []);
      }
      if (cRes && cRes.status === "success") {
        setCases(cRes.data.cases || []);
      }
    } catch (err: unknown) {
      console.error("[Tasks & Calendar Error]:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await api.updateTask(taskId, { status: nextStatus });
      loadData();
    } catch (err: unknown) {
      console.error("[Toggle Task Error]:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createTask({
        title: taskTitle,
        priority: taskPriority,
        dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : undefined,
        caseId: taskCaseId || undefined,
      });
      if (res && res.status === "success") {
        setShowTaskModal(false);
        setTaskTitle("");
        setTaskDueAt("");
        setTaskCaseId("");
        loadData();
      }
    } catch (err: unknown) {
      console.error("[Create Task Error]:", err);
      alert("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const start = new Date(eventStart);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const res = await api.createCalendarEvent({
        title: eventTitle,
        type: eventType,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        location: eventLocation || undefined,
        caseId: eventCaseId || undefined,
      });
      if (res && res.status === "success") {
        setShowEventModal(false);
        setEventTitle("");
        setEventStart("");
        setEventLocation("");
        setEventCaseId("");
        loadData();
      }
    } catch (err: unknown) {
      console.error("[Create Event Error]:", err);
      alert("Failed to schedule calendar event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  const filteredTasks = tasks.filter(
    (t) => priorityFilter === "ALL" || t.priority === priorityFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Tasks & Calendar Workspace"
          subtitle="Track courtroom hearing schedules, client deadlines, and legal task assignments."
        />

        <div className="flex items-center gap-2">
          {activeTab === "tasks" ? (
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2.5 bg-[#A66A22] text-[#FFFDF8] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          ) : (
            <button
              onClick={() => setShowEventModal(true)}
              className="px-4 py-2.5 bg-[#A66A22] text-[#FFFDF8] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hearing / Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "tasks"
                ? "bg-[#A66A22] text-[#FFFDF8] shadow-xs"
                : "text-[#766B5F] hover:bg-[#F8F4EC]"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tasks Checklist ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "calendar"
                ? "bg-[#A66A22] text-[#FFFDF8] shadow-xs"
                : "text-[#766B5F] hover:bg-[#F8F4EC]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Court Calendar ({events.length})</span>
          </button>
        </div>

        {activeTab === "tasks" && (
          <div className="flex items-center gap-2 pr-2">
            <Filter className="w-3.5 h-3.5 text-[#766B5F]" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 px-2 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-lg outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        )}
      </div>

      {/* TASKS VIEW */}
      {activeTab === "tasks" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <CheckSquare className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No tasks found</p>
              <p className="text-[11px] text-[#766B5F]">Click Create Task to add legal objectives.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const isCompleted = t.status === "COMPLETED";
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isCompleted
                        ? "bg-[#F8F4EC]/30 border-[#E2D5C1]/30 opacity-70"
                        : "bg-[#F8F4EC]/60 border-[#E2D5C1]/50 hover:border-[#A66A22]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTaskStatus(t.id, t.status)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-[#E2D5C1] hover:border-[#A66A22] bg-[#FFFDF8]"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold text-[#21170F] ${
                            isCompleted ? "line-through text-[#766B5F]" : ""
                          }`}
                        >
                          {t.title}
                        </p>
                        {t.case && (
                          <p className="text-[10px] text-[#766B5F]">
                            Case: <span className="font-semibold text-[#21170F]">{t.case.title}</span> ({t.case.caseNumber})
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          t.priority === "HIGH" || t.priority === "URGENT"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {activeTab === "calendar" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          {events.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <Calendar className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No events scheduled</p>
              <p className="text-[11px] text-[#766B5F]">Schedule court hearings and client sessions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                        {ev.type}
                      </span>
                      <p className="font-bold text-[#21170F]">{ev.title}</p>
                    </div>
                    {ev.case && (
                      <p className="text-[10px] text-[#766B5F]">
                        Case: <span className="font-semibold">{ev.case.title}</span> ({ev.case.caseNumber})
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-[#21170F] block">
                      {new Date(ev.startAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-[#766B5F]">
                      {new Date(ev.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Create Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-[#766B5F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Draft Writ Petition Reply"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueAt}
                    onChange={(e) => setTaskDueAt(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Link Case (Optional)
                </label>
                <select
                  value={taskCaseId}
                  onChange={(e) => setTaskCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                >
                  <option value="">No case linked</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Schedule Hearing / Event</h3>
              <button onClick={() => setShowEventModal(false)} className="p-1 text-[#766B5F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Interim Stay Arguments"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                  >
                    <option value="HEARING">Court Hearing</option>
                    <option value="MEETING">Client Meeting</option>
                    <option value="DEADLINE">Filing Deadline</option>
                    <option value="REMINDER">Reminder</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Court Location / Room
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Court Hall No. 2, High Court"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Link Case (Optional)
                </label>
                <select
                  value={eventCaseId}
                  onChange={(e) => setEventCaseId(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                >
                  <option value="">No case linked</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
