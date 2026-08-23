"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  api,
  CaseItem,
  CaseDocumentItem,
  CaseNoteItem,
  CaseFactItem,
  CasePartyItem,
  CaseResearchItem,
  CaseActivityItem,
  CaseIntelligenceItem,
  DocumentAnalysisItem,
} from "@/lib/api";
import {
  Briefcase,
  FileText,
  Users,
  Calendar,
  CheckSquare,
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  Globe,
  Upload,
  Clock,
  Loader2,
  XCircle,
  X,
  UserPlus,
  Edit,
  Eye,
  Activity,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";
import CaseTimeline from "./CaseTimeline";
import CaseBrief from "./CaseBrief";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;
  const router = useRouter();

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [documents, setDocuments] = useState<CaseDocumentItem[]>([]);
  const [notes, setNotes] = useState<CaseNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "intelligence" | "timeline" | "facts" | "parties" | "documents" | "research" | "notes" | "hearings" | "tasks" | "team"
  >("overview");

  // New Case-centric entity states
  const [facts, setFacts] = useState<CaseFactItem[]>([]);
  const [parties, setCaseParties] = useState<CasePartyItem[]>([]);
  const [researches, setResearches] = useState<CaseResearchItem[]>([]);
  const [activities, setActivities] = useState<CaseActivityItem[]>([]);
  const [caseIntelligence, setCaseIntelligence] = useState<CaseIntelligenceItem | null>(null);
  const [generatingIntelligence, setGeneratingIntelligence] = useState(false);

  // Document Analysis States
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysisItem | null>(null);

  // Fact Modals & Form
  const [showFactModal, setShowFactModal] = useState(false);
  const [editingFact, setEditingFact] = useState<CaseFactItem | null>(null);
  const [factTitle, setFactTitle] = useState("");
  const [factDescription, setFactDescription] = useState("");
  const [factIsImportant, setFactIsImportant] = useState(false);
  const [factOrderIndex, setFactOrderIndex] = useState(1);

  // Party Modals & Form
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [editingParty, setEditingParty] = useState<CasePartyItem | null>(null);
  const [partyName, setPartyName] = useState("");
  const [partyType, setPartyType] = useState("PETITIONER");
  const [partyRole, setPartyRole] = useState("");
  const [partyContactInfo, setPartyContactInfo] = useState("");
  const [partyNotes, setPartyNotes] = useState("");

  // Modals
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteIsPrivate, setNoteIsPrivate] = useState(true);

  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabEmail, setCollabEmail] = useState("");
  const [collabRole, setCollabRole] = useState("ASSOCIATE");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("HEARING");
  const [eventStart, setEventStart] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const loadCaseDetails = useCallback(async () => {
    try {
      const [cRes, dRes, nRes, fRes, pRes, rRes, aRes, iRes] = await Promise.all([
        api.getCase(caseId),
        api.getCaseDocuments(caseId),
        api.getCaseNotes(caseId),
        api.getCaseFacts(caseId).catch(() => ({ status: "error", data: { facts: [] } })),
        api.getCaseParties(caseId).catch(() => ({ status: "error", data: { parties: [] } })),
        api.getCaseResearches(caseId).catch(() => ({ status: "error", data: { researches: [] } })),
        api.getCaseActivity(caseId).catch(() => ({ status: "error", data: { activities: [] } })),
        api.getCaseIntelligence(caseId).catch(() => ({ status: "error", data: { intelligence: null } })),
      ]);

      if (cRes && cRes.status === "success") {
        setCaseData(cRes.data.case);
        setUserRole(cRes.data.role);
      } else {
        setError("Failed to load case file.");
      }

      if (dRes && dRes.status === "success") {
        setDocuments(dRes.data.documents || []);
      }
      if (nRes && nRes.status === "success") {
        setNotes(nRes.data.notes || []);
      }
      if (fRes && fRes.status === "success") {
        setFacts(fRes.data.facts || []);
      }
      if (pRes && pRes.status === "success") {
        setCaseParties(pRes.data.parties || []);
      }
      if (rRes && rRes.status === "success") {
        setResearches(rRes.data.researches || []);
      }
      if (aRes && aRes.status === "success") {
        setActivities(aRes.data.activities || []);
      }
      if (iRes && iRes.status === "success") {
        setCaseIntelligence(iRes.data.intelligence || null);
      }
    } catch (err: unknown) {
      console.error("[Case Detail Load Error]:", err);
      setError("Access Denied or case file not found.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.addCaseDocument(caseId, {
        name: docName,
        fileUrl: docUrl || `https://storage.lexconnect.app/docs/${Date.now()}_${docName}`,
        fileType: "PDF",
        fileSize: 2048,
      });
      if (res && res.status === "success") {
        setShowDocModal(false);
        setDocName("");
        setDocUrl("");
        loadCaseDetails();
      }
    } catch (err: unknown) {
      console.error("[Upload Doc Error]:", err);
      alert("Failed to attach document.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.deleteCaseDocument(caseId, docId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Delete Doc Error]:", err);
      alert("Failed to delete document.");
    }
  };

  const handleAnalyzeDocument = async (docId: string) => {
    setAnalyzingDocId(docId);
    try {
      const res = await api.analyzeCaseDocument(caseId, docId);
      if (res && res.status === "success") {
        setCurrentAnalysis(res.data.analysis);
        setShowAnalysisModal(true);
      }
    } catch (err: unknown) {
      console.error("[Analysis Error]:", err);
      alert("Document analysis failed or is unsupported for this file type.");
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const handleSaveAnalysisAsResearch = async () => {
    if (!currentAnalysis) return;
    setSubmitting(true);
    try {
      await api.saveCaseResearch(caseId, {
        query: `LexAI Document Analysis: Document ID ${currentAnalysis.documentId}`,
        aiAnalysis: currentAnalysis.rawAnalysis || currentAnalysis.summary || "Document Analysis saved.",
      });
      alert("Analysis saved to Legal Research.");
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Save Research Error]:", err);
      alert("Failed to save analysis as research.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAnalysisAsNote = async () => {
    if (!currentAnalysis) return;
    setSubmitting(true);
    try {
      await api.addCaseNote(caseId, {
        title: `Document Analysis Note`,
        content: currentAnalysis.summary || currentAnalysis.rawAnalysis || "See research tab for full analysis.",
        isPrivate: true,
      });
      alert("Analysis saved to Notes.");
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Save Note Error]:", err);
      alert("Failed to save analysis as note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.addCaseNote(caseId, {
        title: noteTitle,
        content: noteContent,
        isPrivate: noteIsPrivate,
      });
      if (res && res.status === "success") {
        setShowNoteModal(false);
        setNoteTitle("");
        setNoteContent("");
        loadCaseDetails();
      }
    } catch (err: unknown) {
      console.error("[Add Note Error]:", err);
      alert("Failed to save note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this case note?")) return;
    try {
      await api.deleteCaseNote(caseId, noteId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Delete Note Error]:", err);
      alert("Failed to delete note.");
    }
  };

  const handleSaveFact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingFact) {
        await api.updateCaseFact(caseId, editingFact.id, {
          title: factTitle,
          description: factDescription,
          isImportant: factIsImportant,
          orderIndex: Number(factOrderIndex),
        });
      } else {
        await api.addCaseFact(caseId, {
          title: factTitle,
          description: factDescription,
          isImportant: factIsImportant,
          orderIndex: Number(factOrderIndex),
        });
      }
      setShowFactModal(false);
      setEditingFact(null);
      setFactTitle("");
      setFactDescription("");
      setFactIsImportant(false);
      setFactOrderIndex(1);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Save Fact Error]:", err);
      alert("Failed to save case fact.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFact = async (factId: string) => {
    if (!confirm("Are you sure you want to delete this case fact?")) return;
    try {
      await api.deleteCaseFact(caseId, factId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Delete Fact Error]:", err);
      alert("Failed to delete fact.");
    }
  };

  const handleSaveParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingParty) {
        await api.updateCaseParty(caseId, editingParty.id, {
          name: partyName,
          partyType,
          role: partyRole || null,
          contactInfo: partyContactInfo || null,
          notes: partyNotes || null,
        });
      } else {
        await api.addCaseParty(caseId, {
          name: partyName,
          partyType,
          role: partyRole || null,
          contactInfo: partyContactInfo || null,
          notes: partyNotes || null,
        });
      }
      setShowPartyModal(false);
      setEditingParty(null);
      setPartyName("");
      setPartyType("PETITIONER");
      setPartyRole("");
      setPartyContactInfo("");
      setPartyNotes("");
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Save Party Error]:", err);
      alert("Failed to save party.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (!confirm("Are you sure you want to remove this party from the case?")) return;
    try {
      await api.deleteCaseParty(caseId, partyId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Delete Party Error]:", err);
      alert("Failed to remove party.");
    }
  };

  const handleDeleteResearch = async (researchId: string) => {
    if (!confirm("Delete this saved case research report?")) return;
    try {
      await api.deleteCaseResearch(caseId, researchId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Delete Research Error]:", err);
      alert("Failed to delete research.");
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.addCaseCollaborator(caseId, collabEmail, collabRole);
      if (res && res.status === "success") {
        setShowCollabModal(false);
        setCollabEmail("");
        loadCaseDetails();
      }
    } catch (err: unknown) {
      console.error("[Add Collab Error]:", err);
      alert("User not found or already a collaborator on this case.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm("Remove this team member from the case?")) return;
    try {
      await api.removeCaseCollaborator(caseId, userId);
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Remove Collab Error]:", err);
      alert("Failed to remove collaborator.");
    }
  };

  const [handoffOwnerId, setHandoffOwnerId] = useState("");
  const [isHandingOff, setIsHandingOff] = useState(false);

  const handleHandoffCase = async () => {
    if (!handoffOwnerId) return;
    const newOwnerName = caseData?.collaborators?.find(c => c.user.id === handoffOwnerId)?.user.name;
    if (!confirm(`Transfer primary responsibility for this case to ${newOwnerName}?\nThis cannot be undone.`)) return;
    
    setIsHandingOff(true);
    try {
      const res = await api.handoffCase(caseId, handoffOwnerId);
      if (res && res.status === "success") {
        alert("Case successfully handed off.");
        loadCaseDetails();
        setHandoffOwnerId("");
      } else {
        alert((res as any).message || "Failed to handoff case.");
      }
    } catch (err: unknown) {
      console.error("[Handoff Error]:", err);
      alert("An error occurred during handoff.");
    } finally {
      setIsHandingOff(false);
    }
  };

  const handleGenerateIntelligence = async () => {
    setGeneratingIntelligence(true);
    try {
      const res = await api.generateCaseIntelligence(caseId);
      if (res && res.status === "success") {
        setCaseIntelligence(res.data.intelligence);
        loadCaseDetails();
      }
    } catch (err: unknown) {
      console.error("[Intelligence Error]:", err);
      alert("Failed to generate intelligence. LexAI might be receiving many requests right now. Please try again shortly.");
    } finally {
      setGeneratingIntelligence(false);
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
        caseId: caseId,
        assignedToId: taskAssignee || undefined,
      });
      if (res && res.status === "success") {
        setShowTaskModal(false);
        setTaskTitle("");
        setTaskDueAt("");
        setTaskAssignee("");
        loadCaseDetails();
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
        caseId: caseId,
      });
      if (res && res.status === "success") {
        setShowEventModal(false);
        setEventTitle("");
        setEventStart("");
        setEventLocation("");
        loadCaseDetails();
      }
    } catch (err: unknown) {
      console.error("[Create Event Error]:", err);
      alert("Failed to schedule calendar event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResearchFromAI = async (authority: string) => {
    setSubmitting(true);
    try {
      await api.saveCaseResearch(caseId, {
        query: authority,
        aiAnalysis: "Retrieved via LexAI Case Intelligence",
        sources: JSON.stringify([{ title: authority, snippet: "Case Intelligence Citation" }]),
        citations: JSON.stringify([{ claim: authority }]),
      });
      alert("Authority saved to Legal Research.");
      loadCaseDetails();
    } catch (err: unknown) {
      console.error("[Save Research Error]:", err);
      alert("Failed to save research.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error || !caseData) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-rose-100 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider">Access Denied</h3>
        <p className="text-xs text-[#766B5F] leading-relaxed">
          {error || "You do not have authorization to access this case file."}
        </p>
        <Link
          href="/lawyer/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A66A22] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cases
        </Link>
      </div>
    );
  }

  const isEditor = userRole === "LEAD_LAWYER" || userRole === "ASSOCIATE";

  interface TabItem {
    id: typeof activeTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const tabs: TabItem[] = [
    { id: "overview", label: "Case Brief", icon: Briefcase },
    { id: "timeline", label: "Case Timeline", icon: Activity },
    { id: "intelligence", label: "Case Intelligence", icon: BrainCircuit, count: caseIntelligence ? 1 : 0 },
    { id: "facts", label: "Facts", icon: FileText, count: facts.length },
    { id: "parties", label: "Parties", icon: Users, count: parties.length },
    { id: "documents", label: "Documents", icon: Upload, count: documents.length },
    { id: "research", label: "Legal Research", icon: Sparkles, count: researches.length },
    { id: "notes", label: "Notes & Arguments", icon: Lock, count: notes.length },
    { id: "hearings", label: "Hearings", icon: Calendar, count: caseData.events?.length || 0 },
    { id: "tasks", label: "Tasks", icon: CheckSquare, count: caseData.tasks?.length || 0 },
    { id: "team", label: "Team", icon: Users, count: caseData.collaborators?.length || 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/lawyer/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#766B5F] hover:text-[#21170F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Files</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/lawyer/assistant?caseId=${caseData.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A66A22]/10 hover:bg-[#A66A22]/20 border border-[#A66A22]/30 text-xs font-bold text-[#A66A22] rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult LexAI</span>
          </Link>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 border border-[#A66A22]/20 px-3 py-1 rounded-full">
            My Role: {userRole}
          </span>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2.5 py-0.5 rounded-md">
                {caseData.caseNumber}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {caseData.status}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#21170F]">{caseData.title}</h1>
            <p className="text-xs text-[#766B5F] font-medium">{caseData.court}</p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs text-[#766B5F]">
            <p>
              <span className="font-bold text-[#21170F]">Client:</span> {caseData.clientName}
            </p>
            <p>
              <span className="font-bold text-[#21170F]">Opposing:</span> {caseData.opposingParty}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto pt-4 border-t border-[#E2D5C1]/40 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#A66A22] text-[#FFFDF8] shadow-xs"
                    : "text-[#766B5F] hover:text-[#21170F] hover:bg-[#F8F4EC]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-[#FFFDF8]/20 text-[#FFFDF8]" : "bg-[#E2D5C1]/40 text-[#766B5F]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB (CASE BRIEF) */}
      {activeTab === "overview" && (
        <CaseBrief
          caseData={caseData}
          facts={facts}
          parties={parties}
          documents={documents}
          intelligence={caseIntelligence}
          researches={researches}
          notes={notes}
          setActiveTab={(tab: string) => setActiveTab(tab as "overview" | "intelligence" | "timeline" | "facts" | "parties" | "documents" | "research" | "notes" | "hearings" | "tasks" | "team")}
          isEditor={isEditor}
        />
      )}

      {/* INTELLIGENCE TAB */}
      {activeTab === "intelligence" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D5C1]/40 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F] flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#A66A22]" />
                LexAI Case Intelligence
              </h2>
              <p className="text-xs text-[#766B5F]">
                Structured case insights synthesized from your facts, parties, notes, and analyzed documents.
              </p>
            </div>
            {isEditor && (
              <button
                onClick={handleGenerateIntelligence}
                disabled={generatingIntelligence}
                className="px-4 py-2 bg-[#A66A22] hover:bg-[#8F5B1D] disabled:bg-[#A66A22]/50 text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-xs"
              >
                {generatingIntelligence ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Case Materials...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{caseIntelligence ? "Refresh Analysis" : "Generate Case Intelligence"}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!caseIntelligence && !generatingIntelligence && (
            <div className="p-12 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-3">
              <BrainCircuit className="w-10 h-10 text-[#A66A22]/30 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#21170F]">No case intelligence available yet.</h3>
                <p className="text-xs text-[#766B5F] max-w-sm mx-auto leading-relaxed">
                  Generate intelligence after adding case facts, documents, or research to receive a comprehensive AI overview.
                </p>
              </div>
            </div>
          )}

          {caseIntelligence && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="text-[10px] text-[#766B5F] text-right font-medium italic border-b border-[#E2D5C1]/20 pb-2">
                Last generated: {new Date(caseIntelligence.generatedAt).toLocaleString()}
              </div>

              {/* Summary Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Case Summary
                </h3>
                <div className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl text-xs text-[#21170F] leading-relaxed space-y-3">
                  <p>{caseIntelligence.summary}</p>
                  {isEditor && (
                    <button
                      onClick={() => {
                        setNoteTitle("Case Intelligence Snapshot");
                        setNoteContent(caseIntelligence.summary);
                        setShowNoteModal(true);
                      }}
                      className="text-[10px] px-3 py-1.5 bg-[#FFFDF8] border border-[#E2D5C1] hover:bg-[#A66A22]/5 text-[#A66A22] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs w-fit"
                    >
                      <Plus className="w-3 h-3" />
                      Save as Note
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Legal Issues */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Key Legal Issues
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.legalIssues.map((issue: string, idx: number) => (
                        <li key={idx} className="flex flex-col gap-1.5">
                          <div className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                            <span className="text-[#A66A22] font-bold mt-0.5">{idx + 1}.</span>
                            <span>{issue}</span>
                          </div>
                          {isEditor && (
                            <button
                              onClick={() => router.push(`/lawyer/research?q=${encodeURIComponent(issue)}`)}
                              className="ml-5 w-fit text-[10px] px-2 py-1 bg-[#F8F4EC] hover:bg-[#A66A22]/10 text-[#A66A22] font-bold rounded transition-colors border border-[#E2D5C1]/50 shadow-xs"
                            >
                              Research this issue
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Facts */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5" /> Critical Facts
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.keyFacts.map((fact: string, idx: number) => (
                        <li key={idx} className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#A66A22]/50 mt-1.5 shrink-0" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Arguments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5" /> Supporting Arguments
                  </h3>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.supportingArguments.map((arg: string, idx: number) => (
                        <li key={idx} className="text-xs text-emerald-950 leading-relaxed flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{arg}</span>
                        </li>
                      ))}
                      {caseIntelligence.supportingArguments.length === 0 && (
                        <li className="text-xs text-emerald-700/60 italic">No supporting arguments identified.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Opposing Arguments & Risks
                  </h3>
                  <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.opposingArguments.map((arg: string, idx: number) => (
                        <li key={idx} className="text-xs text-rose-950 leading-relaxed flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{arg}</span>
                        </li>
                      ))}
                      {caseIntelligence.opposingArguments.length === 0 && (
                        <li className="text-xs text-rose-700/60 italic">No opposing arguments identified.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Authorities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Statutes
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.statutes.map((item: string, idx: number) => (
                        <li key={idx} className="flex flex-col gap-1.5">
                          <div className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#A66A22]/50 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                          {isEditor && (
                            <button
                              onClick={() => handleSaveResearchFromAI(item)}
                              disabled={submitting}
                              className="ml-3.5 w-fit text-[10px] px-2 py-1 bg-[#F8F4EC] hover:bg-[#A66A22]/10 text-[#A66A22] font-bold rounded transition-colors border border-[#E2D5C1]/50 shadow-xs"
                            >
                              Save Research
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" /> Precedents
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full">
                    <ul className="space-y-2">
                      {caseIntelligence.precedents.map((item: string, idx: number) => (
                        <li key={idx} className="flex flex-col gap-1.5">
                          <div className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#A66A22]/50 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </div>
                          {isEditor && (
                            <button
                              onClick={() => handleSaveResearchFromAI(item)}
                              disabled={submitting}
                              className="ml-3.5 w-fit text-[10px] px-2 py-1 bg-[#F8F4EC] hover:bg-[#A66A22]/10 text-[#A66A22] font-bold rounded transition-colors border border-[#E2D5C1]/50 shadow-xs"
                            >
                              Save Research
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gaps and Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Evidence Gaps & Contradictions
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full space-y-4">
                    {caseIntelligence.evidenceGaps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#766B5F] uppercase">Missing Evidence</span>
                        <ul className="space-y-1">
                          {caseIntelligence.evidenceGaps.map((item: string, idx: number) => (
                            <li key={idx} className="flex flex-col gap-1.5">
                              <div className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <span>{item}</span>
                              </div>
                              {isEditor && (
                                <button
                                  onClick={() => setShowDocModal(true)}
                                  className="ml-3 w-fit text-[10px] px-2 py-1 bg-[#F8F4EC] hover:bg-rose-50 text-rose-700 font-bold rounded transition-colors border border-rose-100 shadow-xs"
                                >
                                  Add Document
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {caseIntelligence.contradictions.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#766B5F] uppercase">Contradictions</span>
                        <ul className="space-y-1">
                          {caseIntelligence.contradictions.map((item: string, idx: number) => (
                            <li key={idx} className="text-xs text-[#21170F] leading-relaxed flex items-start gap-2">
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Recommended Action Items
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl h-full">
                    <ul className="space-y-3">
                      {caseIntelligence.actionItems.map((item: string, idx: number) => (
                        <li key={idx} className="flex flex-col gap-1.5">
                          <span className="text-xs text-[#21170F] leading-relaxed">{item}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveTab("tasks")}
                              className="text-[10px] px-2 py-1 bg-[#F8F4EC] hover:bg-[#A66A22]/10 text-[#A66A22] font-bold rounded transition-colors border border-[#E2D5C1]/50 shadow-xs"
                            >
                              Go to Tasks
                            </button>
                            {isEditor && (
                              <button
                                onClick={() => {
                                  setTaskTitle(item);
                                  setShowTaskModal(true);
                                }}
                                className="text-[10px] px-2 py-1 bg-[#A66A22]/10 hover:bg-[#A66A22]/20 text-[#A66A22] font-bold rounded transition-colors border border-[#A66A22]/30 shadow-xs"
                              >
                                Create Task
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              {caseIntelligence.importantDates && caseIntelligence.importantDates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Extracted Important Dates
                  </h3>
                  <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1]/40 rounded-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {caseIntelligence.importantDates.map((dateStr: string, idx: number) => (
                        <div key={idx} className="p-3 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-xl flex flex-col gap-2">
                          <span className="text-xs font-semibold text-[#21170F]">{dateStr}</span>
                          {isEditor && (
                            <button
                              onClick={() => {
                                setEventTitle(`Hearing/Deadline: ${dateStr.substring(0, 20)}...`);
                                setShowEventModal(true);
                              }}
                              className="w-fit text-[10px] px-2 py-1 bg-[#FFFDF8] hover:bg-[#A66A22]/10 text-[#A66A22] font-bold rounded transition-colors border border-[#E2D5C1] shadow-xs"
                            >
                              Add to Case Calendar
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Research Areas */}
              {caseIntelligence.researchAreas.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Suggested Research Areas
                  </h3>
                  <div className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl">
                    <div className="flex flex-wrap gap-2">
                      {caseIntelligence.researchAreas.map((area: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => router.push(`/lawyer/research?q=${encodeURIComponent(area)}`)}
                          className="text-[10px] px-3 py-1.5 bg-[#FFFDF8] border border-[#E2D5C1] hover:border-[#A66A22]/50 hover:bg-[#A66A22]/5 rounded-full text-[#766B5F] hover:text-[#A66A22] transition-colors flex items-center gap-1.5 shadow-xs font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-[#766B5F]/70 italic mt-6">
                LexAI case intelligence provides synthesized analysis and recommendations based on available facts. Always verify citations and legal conclusions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. FACTS TAB */}
      {activeTab === "facts" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Statement of Facts</h2>
              <p className="text-xs text-[#766B5F]">Chronology of key facts and evidentiary outlines.</p>
            </div>
            {isEditor && (
              <button
                onClick={() => {
                  setEditingFact(null);
                  setFactTitle("");
                  setFactDescription("");
                  setFactIsImportant(false);
                  setFactOrderIndex(facts.length + 1);
                  setShowFactModal(true);
                }}
                className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fact</span>
              </button>
            )}
          </div>

          {facts.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <FileText className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No facts compiled yet</p>
              <p className="text-[11px] text-[#766B5F]">Add timelines and core evidence facts to guide LexAI.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {facts
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((fact, index) => (
                  <div
                    key={fact.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      fact.isImportant
                        ? "bg-[#FFFDF8] border-amber-300 shadow-2xs"
                        : "bg-[#F8F4EC]/40 border-[#E2D5C1]/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {fact.orderIndex || index + 1}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#21170F]">{fact.title}</h4>
                            {fact.isImportant && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                                Important
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#766B5F] leading-relaxed font-medium">
                            {fact.description}
                          </p>
                        </div>
                      </div>

                      {isEditor && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingFact(fact);
                              setFactTitle(fact.title);
                              setFactDescription(fact.description);
                              setFactIsImportant(fact.isImportant);
                              setFactOrderIndex(fact.orderIndex);
                              setShowFactModal(true);
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFact(fact.id)}
                            className="p-1 text-rose-700 hover:bg-rose-100 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PARTIES TAB */}
      {activeTab === "parties" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Litigation Parties</h2>
              <p className="text-xs text-[#766B5F]">Core litigants, counsels, and key witnesses.</p>
            </div>
            {isEditor && (
              <button
                onClick={() => {
                  setEditingParty(null);
                  setPartyName("");
                  setPartyType("PETITIONER");
                  setPartyRole("");
                  setPartyContactInfo("");
                  setPartyNotes("");
                  setShowPartyModal(true);
                }}
                className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Party</span>
              </button>
            )}
          </div>

          {parties.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <Users className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No litigants listed yet</p>
              <p className="text-[11px] text-[#766B5F]">Add client and opposing details.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#21170F]">{party.name}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          party.partyType === "PETITIONER"
                            ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                            : party.partyType === "RESPONDENT"
                            ? "text-rose-800 bg-rose-50 border-rose-200"
                            : "text-slate-800 bg-slate-50 border-slate-200"
                        }`}>
                          {party.partyType}
                        </span>
                      </div>
                      {party.role && (
                        <p className="text-[10px] text-[#A66A22] font-semibold">
                          Role: {party.role}
                        </p>
                      )}
                    </div>

                    {isEditor && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingParty(party);
                            setPartyName(party.name);
                            setPartyType(party.partyType);
                            setPartyRole(party.role || "");
                            setPartyContactInfo(party.contactInfo || "");
                            setPartyNotes(party.notes || "");
                            setShowPartyModal(true);
                          }}
                          className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteParty(party.id)}
                          className="p-1 text-rose-700 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {(party.contactInfo || party.notes) && (
                    <div className="pt-2 border-t border-[#E2D5C1]/30 space-y-1 text-[11px] text-[#766B5F]">
                      {party.contactInfo && (
                        <p>
                          <span className="font-bold text-[#21170F]">Contact:</span> {party.contactInfo}
                        </p>
                      )}
                      {party.notes && (
                        <p className="italic font-medium text-[#766B5F]/95">
                          &ldquo;{party.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. DOCUMENTS TAB */}
      {activeTab === "documents" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Case Documents & Exhibits</h2>
              <p className="text-xs text-[#766B5F]">Organize pleadings, affidavits, and evidence.</p>
            </div>
            <button
              onClick={() => setShowDocModal(true)}
              className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Attach Document</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <Upload className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No documents uploaded</p>
              <p className="text-[11px] text-[#766B5F]">Click Attach Document to add files.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center font-bold text-xs">
                      {doc.fileType.substring(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#21170F]">{doc.name}</p>
                      <p className="text-[10px] text-[#766B5F]">
                        Uploaded by {doc.uploadedBy?.name || "Counsel"} &bull; {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAnalyzeDocument(doc.id)}
                      disabled={analyzingDocId === doc.id}
                      className="px-3 py-1 bg-[#A66A22]/10 border border-[#A66A22]/30 rounded-lg text-xs font-bold text-[#A66A22] flex items-center gap-1.5 transition-all hover:bg-[#A66A22]/20 disabled:opacity-50"
                    >
                      {analyzingDocId === doc.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-lg text-xs font-semibold text-[#21170F]"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 text-rose-700 hover:bg-rose-100/60 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. RESEARCH TAB */}
      {activeTab === "research" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Case AI Research</h2>
              <p className="text-xs text-[#766B5F]">Query statutory RAG for facts and precedents linked to this matter.</p>
            </div>
            <Link
              href="/lawyer/research"
              className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Research Workspace</span>
            </Link>
          </div>

          {researches.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <Sparkles className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No saved research reports</p>
              <p className="text-[11px] text-[#766B5F]">
                Run queries in the Research Workspace and save them directly to this case file.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {researches.map((res) => {
                let parsedSources: Array<{ title: string; snippet?: string }> = [];
                let parsedCitations: string[] = [];
                try {
                  if (res.sources) parsedSources = JSON.parse(res.sources);
                  if (res.citations) parsedCitations = JSON.parse(res.citations);
                } catch {
                  // Fallback
                }

                return (
                  <div
                    key={res.id}
                    className="p-5 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22]">
                          Query
                        </span>
                        <h4 className="text-xs font-bold text-[#21170F]">{res.query}</h4>
                      </div>
                      {isEditor && (
                        <button
                          onClick={() => handleDeleteResearch(res.id)}
                          className="p-1.5 text-rose-700 hover:bg-rose-100/60 rounded-lg shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="bg-[#FFFDF8] border border-[#E2D5C1]/30 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#766B5F]">
                        AI Statutory Analysis
                      </span>
                      <div className="text-xs text-[#21170F] whitespace-pre-wrap leading-relaxed font-medium">
                        {res.aiAnalysis}
                      </div>
                    </div>

                    {parsedSources.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#766B5F]">
                          Cited Sources & Precedents
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {parsedSources.map((src, idx) => (
                            <span
                              key={idx}
                              title={src.snippet}
                              className="text-[10px] font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-help"
                            >
                              <BookOpen className="w-3 h-3 text-[#A66A22]" />
                              <span>{src.title}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. NOTES & ARGUMENTS TAB */}
      {activeTab === "notes" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Case Notes & Legal Arguments</h2>
              <p className="text-xs text-[#766B5F]">Private counsel notes and argument outlines.</p>
            </div>
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
          </div>

          {notes.length === 0 ? (
            <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
              <Lock className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
              <p className="text-xs font-bold text-[#21170F]">No case notes added</p>
              <p className="text-[11px] text-[#766B5F]">Keep private argument notes for court preparation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#21170F]">{note.title}</h4>
                      {note.isPrivate ? (
                        <span className="text-[9px] font-bold text-[#766B5F] bg-[#E2D5C1]/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" /> Team
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-rose-700 hover:bg-rose-100/60 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#766B5F] leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <span className="text-[10px] text-[#766B5F]/70 block">
                    By {note.createdBy?.name || "Counsel"} &bull; {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. HEARINGS TAB */}
      {activeTab === "hearings" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
            Court Hearings & Events ({caseData.events?.length || 0})
          </h2>
          {caseData.events && caseData.events.length > 0 ? (
            <div className="space-y-3">
              {caseData.events.map((ev) => (
                <div key={ev.id} className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#21170F]">{ev.title}</p>
                    <p className="text-[11px] text-[#766B5F]">{ev.location || caseData.court}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                      {new Date(ev.startAt).toLocaleString()}
                    </span>
                    <Link
                      href={`/lawyer/cases/${caseData.id}/hearings/${ev.id}/prepare`}
                      className="text-[10px] uppercase tracking-wider font-bold text-[#A66A22] hover:underline flex items-center gap-1"
                    >
                      Prepare for Hearing <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#766B5F]">No hearings scheduled for this case.</p>
          )}
        </div>
      )}

      {/* 8. TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
            Case Tasks ({caseData.tasks?.length || 0})
          </h2>
          {caseData.tasks && caseData.tasks.length > 0 ? (
            <div className="space-y-3">
              {caseData.tasks.map((task) => (
                <div key={task.id} className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#21170F]">{task.title}</p>
                    <p className="text-[10px] text-[#766B5F]">Priority: {task.priority}</p>
                  </div>
                  <span className="font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#766B5F]">No tasks created for this case.</p>
          )}
        </div>
      )}

      {/* 9. TEAM TAB */}
      {activeTab === "team" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#21170F]">Case Team & Collaborators</h2>
              <p className="text-xs text-[#766B5F]">Authorized advocates working on this case file.</p>
            </div>
            {userRole === "LEAD_LAWYER" && (
              <button
                onClick={() => setShowCollabModal(true)}
                className="px-4 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Collaborator</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {caseData.collaborators?.map((collab) => (
              <div
                key={collab.id}
                className="p-4 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#21170F]">{collab.user.name}</p>
                  <p className="text-[11px] text-[#766B5F]">{collab.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#A66A22] bg-[#A66A22]/10 border border-[#A66A22]/20 px-3 py-1 rounded-full uppercase text-[10px]">
                    {collab.role}
                  </span>
                  {userRole === "LEAD_LAWYER" && collab.role !== "LEAD_LAWYER" && (
                    <button
                      onClick={() => handleRemoveCollaborator(collab.user.id)}
                      className="p-1.5 text-rose-700 hover:bg-rose-100/60 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {userRole === "LEAD_LAWYER" && (
            <div className="pt-6 border-t border-[#E2D5C1]/40 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-rose-800">Case Handoff</h3>
                <p className="text-[11px] text-rose-600/80">Transfer primary ownership to another collaborator.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={handoffOwnerId}
                  onChange={(e) => setHandoffOwnerId(e.target.value)}
                  className="flex-1 bg-[#FFFDF8] border border-rose-200 rounded-xl px-4 py-2 text-xs font-semibold text-[#21170F] outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="">-- Select New Owner --</option>
                  {caseData.collaborators?.filter(c => c.user.id !== caseData.createdById).map(c => (
                    <option key={c.user.id} value={c.user.id}>{c.user.name} ({c.role})</option>
                  ))}
                </select>
                <button
                  onClick={handleHandoffCase}
                  disabled={!handoffOwnerId || isHandingOff}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {isHandingOff ? "Transferring..." : "Handoff Case"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 10. CASE TIMELINE TAB */}
      {activeTab === "timeline" && (
        <CaseTimeline
          caseData={caseData}
          documents={documents}
          researches={researches}
          notes={notes}
          activities={activities}
          importantDates={caseIntelligence?.importantDates || []}
          setActiveTab={(tab: string) => setActiveTab(tab as "overview" | "intelligence" | "timeline" | "facts" | "parties" | "documents" | "research" | "notes" | "hearings" | "tasks" | "team")}
        />
      )}

      {/* DOCUMENT MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Attach Document</h3>
              <button onClick={() => setShowDocModal(false)} className="p-1 text-[#766B5F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Writ Petition Affidavit"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Document URL / Storage Link
                </label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Add Case Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="p-1 text-[#766B5F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note Title"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Note Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Outline key facts or arguments..."
                  className="w-full p-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="note-priv"
                  checked={noteIsPrivate}
                  onChange={(e) => setNoteIsPrivate(e.target.checked)}
                />
                <label htmlFor="note-priv" className="font-semibold text-[#21170F]">
                  Keep Note Private (Only visible to me)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLABORATOR MODAL */}
      {showCollabModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Add Collaborator</h3>
              <button onClick={() => setShowCollabModal(false)} className="p-1 text-[#766B5F]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCollaborator} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  placeholder="lawyer@example.com"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Team Role
                </label>
                <select
                  value={collabRole}
                  onChange={(e) => setCollabRole(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none"
                >
                  <option value="ASSOCIATE">Associate</option>
                  <option value="JUNIOR">Junior Counsel</option>
                  <option value="CONSULTANT">Consultant</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCollabModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FACT MODAL */}
      {showFactModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">
                {editingFact ? "Edit Case Fact" : "Add Case Fact"}
              </h3>
              <button
                onClick={() => {
                  setShowFactModal(false);
                  setEditingFact(null);
                }}
                className="p-1 text-[#766B5F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFact} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Fact Title
                </label>
                <input
                  type="text"
                  required
                  value={factTitle}
                  onChange={(e) => setFactTitle(e.target.value)}
                  placeholder="e.g. Agreement Execution Date"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                />
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Fact Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={factDescription}
                  onChange={(e) => setFactDescription(e.target.value)}
                  placeholder="Describe the fact in detail..."
                  className="w-full p-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={factOrderIndex}
                    onChange={(e) => setFactOrderIndex(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="fact-imp"
                    checked={factIsImportant}
                    onChange={(e) => setFactIsImportant(e.target.checked)}
                    className="w-4 h-4 accent-[#A66A22]"
                  />
                  <label htmlFor="fact-imp" className="font-bold text-[#21170F] select-none cursor-pointer">
                    Mark Important
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowFactModal(false);
                    setEditingFact(null);
                  }}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingFact ? "Update Fact" : "Save Fact"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARTY MODAL */}
      {showPartyModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">
                {editingParty ? "Edit Litigation Party" : "Add Litigation Party"}
              </h3>
              <button
                onClick={() => {
                  setShowPartyModal(false);
                  setEditingParty(null);
                }}
                className="p-1 text-[#766B5F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveParty} className="space-y-3 text-xs">
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Party Type
                  </label>
                  <select
                    value={partyType}
                    onChange={(e) => setPartyType(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                  >
                    <option value="PETITIONER">Petitioner / Plaintiff</option>
                    <option value="RESPONDENT">Respondent / Defendant</option>
                    <option value="OTHER">Other / Witness</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                    Specific Role
                  </label>
                  <input
                    type="text"
                    value={partyRole}
                    onChange={(e) => setPartyRole(e.target.value)}
                    placeholder="e.g. Co-defendant, Eye witness"
                    className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Contact Information
                </label>
                <input
                  type="text"
                  value={partyContactInfo}
                  onChange={(e) => setPartyContactInfo(e.target.value)}
                  placeholder="e.g. +91 98765 43210, email@example.com"
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                />
              </div>
              <div>
                <label className="font-bold uppercase tracking-wider text-[#21170F] block mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={partyNotes}
                  onChange={(e) => setPartyNotes(e.target.value)}
                  placeholder="Any extra observations or notes on this party..."
                  className="w-full p-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-[#21170F]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => {
                    setShowPartyModal(false);
                    setEditingParty(null);
                  }}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#A66A22] text-[#FFFDF8] font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingParty ? "Update Party" : "Save Party"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT ANALYSIS MODAL */}
      {showAnalysisModal && currentAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#21170F]/40 backdrop-blur-sm">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-[#E2D5C1]/40 bg-[#F8F4EC]/50 shrink-0">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#21170F] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A66A22]" />
                  LexAI Document Analysis
                </h3>
                <p className="text-xs text-[#766B5F] mt-1">
                  AI-generated legal analysis for research assistance.
                </p>
              </div>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="p-2 text-[#766B5F] hover:bg-[#E2D5C1]/40 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {currentAnalysis.summary && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Summary</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.summary}</p>
                </div>
              )}
              
              {currentAnalysis.keyFacts && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Key Facts</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.keyFacts}</p>
                </div>
              )}

              {currentAnalysis.legalIssues && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Legal Issues</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.legalIssues}</p>
                </div>
              )}
              
              {currentAnalysis.statutoryProvisions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Statutory Provisions</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.statutoryProvisions}</p>
                </div>
              )}

              {currentAnalysis.arguments && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Arguments</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.arguments}</p>
                </div>
              )}

              {currentAnalysis.precedents && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Precedents</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{currentAnalysis.precedents}</p>
                </div>
              )}
              
              {!currentAnalysis.summary && currentAnalysis.rawAnalysis && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#21170F] uppercase tracking-wider border-b border-[#E2D5C1]/40 pb-1">Raw Analysis</h4>
                  <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap font-mono text-[11px] bg-[#F8F4EC]/40 p-4 rounded-xl border border-[#E2D5C1]/40">{currentAnalysis.rawAnalysis}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-[#E2D5C1]/40 bg-[#F8F4EC]/50 shrink-0">
              <p className="text-[10px] text-[#A66A22] font-semibold flex items-center gap-1.5 bg-[#A66A22]/10 px-3 py-1.5 rounded-lg border border-[#A66A22]/20">
                <Sparkles className="w-3.5 h-3.5" />
                This analysis is generated by LexAI and should be independently verified.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAnalysisAsResearch}
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FFFDF8] border border-[#E2D5C1] text-xs font-bold text-[#21170F] rounded-xl hover:bg-[#F8F4EC] transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Save as Research
                </button>
                <button
                  onClick={handleSaveAnalysisAsNote}
                  disabled={submitting}
                  className="px-4 py-2 bg-[#FFFDF8] border border-[#E2D5C1] text-xs font-bold text-[#21170F] rounded-xl hover:bg-[#F8F4EC] transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Create Note
                </button>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#766B5F] hover:text-[#21170F] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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
                  Assign To
                </label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none text-xs"
                >
                  <option value="">Unassigned (Self)</option>
                  {caseData?.collaborators?.map(c => (
                    <option key={c.user.id} value={c.user.id}>{c.user.name} ({c.role})</option>
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
