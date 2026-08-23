"use client";

import { useState, useMemo } from "react";
import {
  Upload,
  Sparkles,
  Lock,
  Calendar,
  CheckSquare,
  Activity,
  ArrowRight,
  Briefcase
} from "lucide-react";
import { CaseItem, CaseDocumentItem, CaseResearchItem, CaseNoteItem, CaseActivityItem } from "@/lib/api";

type CaseTimelineEvent = {
  id: string;
  type: "CASE" | "DOCUMENT" | "RESEARCH" | "NOTE" | "HEARING" | "TASK" | "COLLABORATION" | "ACTIVITY" | "IMPORTANT_DATE";
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  tabTarget?: "documents" | "research" | "notes" | "hearings" | "tasks" | "team" | "activity" | "intelligence";
};

interface CaseTimelineProps {
  caseData: CaseItem;
  documents: CaseDocumentItem[];
  researches: CaseResearchItem[];
  notes: CaseNoteItem[];
  activities: CaseActivityItem[];
  importantDates?: string[];
  setActiveTab: (tab: string) => void;
}

export default function CaseTimeline({
  caseData,
  documents,
  researches,
  notes,
  activities,
  importantDates = [],
  setActiveTab
}: CaseTimelineProps) {
  const [filter, setFilter] = useState<"ALL" | "DOCUMENT" | "RESEARCH" | "NOTE" | "HEARING" | "TASK" | "COLLABORATION" | "ACTIVITY">("ALL");
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");

  const timelineEvents = useMemo(() => {
    const events: CaseTimelineEvent[] = [];

    // Case creation
    events.push({
      id: `case-${caseData.id}`,
      type: "CASE",
      title: "Case Created",
      description: `Case ${caseData.caseNumber} was opened in ${caseData.court}.`,
      timestamp: caseData.createdAt,
      actor: "System",
    });

    // Documents
    documents.forEach(doc => {
      events.push({
        id: `doc-${doc.id}`,
        type: "DOCUMENT",
        title: "Document Added",
        description: `"${doc.name}" was uploaded to the case.`,
        timestamp: doc.createdAt,
        actor: "Advocate",
        tabTarget: "documents"
      });
    });

    // Research
    researches.forEach(res => {
      events.push({
        id: `res-${res.id}`,
        type: "RESEARCH",
        title: "Legal Research Saved",
        description: `"${res.query}"`,
        timestamp: res.createdAt,
        actor: "Advocate",
        tabTarget: "research"
      });
    });

    // Notes
    notes.forEach(note => {
      events.push({
        id: `note-${note.id}`,
        type: "NOTE",
        title: "Case Note Created",
        description: `"${note.title}"`,
        timestamp: note.createdAt,
        actor: "Advocate",
        tabTarget: "notes"
      });
    });

    // Hearings
    if (caseData.events) {
      caseData.events.forEach(evt => {
        events.push({
          id: `evt-${evt.id}`,
          type: "HEARING",
          title: evt.type === "HEARING" ? "Court Hearing Scheduled" : "Event Scheduled",
          description: `"${evt.title}" at ${evt.location || "unspecified location"}`,
          timestamp: evt.startAt || caseData.createdAt,
          actor: "Advocate",
          tabTarget: "hearings"
        });
      });
    }

    // Tasks
    if (caseData.tasks) {
      caseData.tasks.forEach(task => {
        events.push({
          id: `task-${task.id}`,
          type: "TASK",
          title: "Task Created",
          description: `"${task.title}" (Priority: ${task.priority})`,
          timestamp: task.dueAt || caseData.createdAt,
          actor: "Advocate",
          tabTarget: "tasks"
        });
      });
    }

    // Activities
    activities.forEach(act => {
      const actStr = (act.action || act.title || "");
      if (
        !actStr.includes("CREATE_DOCUMENT") &&
        !actStr.includes("CREATE_RESEARCH") &&
        !actStr.includes("CREATE_NOTE") &&
        !actStr.includes("CREATE_TASK") &&
        !actStr.includes("CREATE_EVENT")
      ) {
        events.push({
          id: `act-${act.id}`,
          type: "ACTIVITY",
          title: (act.action || act.title || "ACTIVITY").replace(/_/g, " "),
          description: act.description || "General activity logged.",
          timestamp: act.createdAt,
          actor: act.user?.name || act.createdBy?.name || "Counsel",
          tabTarget: "activity"
        });
      }
    });

    // Important Dates (treated as if they are extracted from the case creation/current state)
    // We map them loosely using caseData.updatedAt to prevent weird timeline jumps.
    importantDates.forEach((dateStr, idx) => {
      events.push({
        id: `imp-date-${idx}`,
        type: "IMPORTANT_DATE",
        title: "Important Date Extracted",
        description: dateStr,
        timestamp: caseData.updatedAt,
        actor: "LexAI",
        tabTarget: "intelligence"
      });
    });

    events.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === "DESC" ? dateB - dateA : dateA - dateB;
    });

    return events;
  }, [caseData, documents, researches, notes, activities, importantDates, sortOrder]);

  const filteredEvents = timelineEvents.filter(e => filter === "ALL" || e.type === filter);

  const getIcon = (type: CaseTimelineEvent["type"]) => {
    switch (type) {
      case "CASE": return <Briefcase className="w-4 h-4 text-[#A66A22]" />;
      case "DOCUMENT": return <Upload className="w-4 h-4 text-emerald-600" />;
      case "RESEARCH": return <Sparkles className="w-4 h-4 text-purple-600" />;
      case "NOTE": return <Lock className="w-4 h-4 text-amber-600" />;
      case "HEARING": return <Calendar className="w-4 h-4 text-blue-600" />;
      case "TASK": return <CheckSquare className="w-4 h-4 text-orange-600" />;
      case "ACTIVITY": return <Activity className="w-4 h-4 text-gray-500" />;
      case "IMPORTANT_DATE": return <Calendar className="w-4 h-4 text-rose-600" />;
      default: return <Activity className="w-4 h-4 text-[#A66A22]" />;
    }
  };

  return (
    <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D5C1]/40 pb-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#21170F]">Case Timeline</h2>
          <p className="text-xs text-[#766B5F] mt-1">Chronological history of case actions and extracted intelligence.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "ALL" | "DOCUMENT" | "RESEARCH" | "NOTE" | "HEARING" | "TASK" | "COLLABORATION" | "ACTIVITY")}
            className="text-xs bg-[#F8F4EC] border border-[#E2D5C1] rounded-lg px-3 py-1.5 outline-none text-[#21170F] font-semibold"
          >
            <option value="ALL">All Events</option>
            <option value="DOCUMENT">Documents</option>
            <option value="RESEARCH">Research</option>
            <option value="NOTE">Notes</option>
            <option value="HEARING">Hearings</option>
            <option value="TASK">Tasks</option>
            <option value="ACTIVITY">Activity Logs</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === "DESC" ? "ASC" : "DESC")}
            className="text-xs px-3 py-1.5 bg-[#F8F4EC] border border-[#E2D5C1] hover:bg-[#E2D5C1]/40 rounded-lg text-[#21170F] font-semibold transition-colors"
          >
            Sort: {sortOrder === "DESC" ? "Newest First" : "Oldest First"}
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
          <Activity className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
          <p className="text-xs font-bold text-[#21170F]">No timeline events found</p>
          <p className="text-[11px] text-[#766B5F]">Events matching the filter will appear here.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#E2D5C1]/40 pl-6 ml-3 space-y-8 py-2">
          {filteredEvents.map(evt => (
            <div key={evt.id} className="relative space-y-1">
              <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full border border-[#E2D5C1] bg-[#FFFDF8] flex items-center justify-center z-10 shadow-sm">
                <span className="flex items-center justify-center p-0.5">{getIcon(evt.type)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#21170F]">{evt.title}</span>
                <span className="text-[10px] text-[#766B5F] font-semibold">
                  {new Date(evt.timestamp).toLocaleString(undefined, {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {evt.description && (
                <p className="text-xs text-[#4A3F35] leading-relaxed border-l-2 border-transparent pl-1">{evt.description}</p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#766B5F] italic">Actor: {evt.actor}</span>
                {evt.tabTarget && (
                  <button
                    onClick={() => setActiveTab(evt.tabTarget!)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#A66A22] hover:underline"
                  >
                    View details <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
