"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import {
  api,
  CaseItem,
  CaseDocumentItem,
  CaseNoteItem,
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
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [documents, setDocuments] = useState<CaseDocumentItem[]>([]);
  const [notes, setNotes] = useState<CaseNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "facts" | "parties" | "documents" | "research" | "notes" | "hearings" | "tasks" | "team"
  >("overview");

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

  const [submitting, setSubmitting] = useState(false);

  const loadCaseDetails = useCallback(async () => {
    try {
      const [cRes, dRes, nRes] = await Promise.all([
        api.getCase(caseId),
        api.getCaseDocuments(caseId),
        api.getCaseNotes(caseId),
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

  interface TabItem {
    id: typeof activeTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const tabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: Briefcase },
    { id: "facts", label: "Facts", icon: FileText },
    { id: "parties", label: "Parties", icon: Users },
    { id: "documents", label: "Documents", icon: Upload, count: documents.length },
    { id: "research", label: "Legal Research", icon: Sparkles },
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

        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 border border-[#A66A22]/20 px-3 py-1 rounded-full">
          My Role: {userRole}
        </span>
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

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
              Case Brief & Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#F8F4EC]/50 p-4 rounded-2xl border border-[#E2D5C1]/30">
                <span className="text-[10px] font-bold text-[#766B5F] uppercase block mb-1">
                  Jurisdiction & Court
                </span>
                <span className="font-bold text-[#21170F]">{caseData.court}</span>
              </div>
              <div className="bg-[#F8F4EC]/50 p-4 rounded-2xl border border-[#E2D5C1]/30">
                <span className="text-[10px] font-bold text-[#766B5F] uppercase block mb-1">
                  Case Classification
                </span>
                <span className="font-bold text-[#21170F]">{caseData.caseType}</span>
              </div>
              <div className="bg-[#F8F4EC]/50 p-4 rounded-2xl border border-[#E2D5C1]/30">
                <span className="text-[10px] font-bold text-[#766B5F] uppercase block mb-1">
                  Priority Level
                </span>
                <span className="font-bold text-[#21170F]">{caseData.priority}</span>
              </div>
              <div className="bg-[#F8F4EC]/50 p-4 rounded-2xl border border-[#E2D5C1]/30">
                <span className="text-[10px] font-bold text-[#766B5F] uppercase block mb-1">
                  Filing Date
                </span>
                <span className="font-bold text-[#21170F]">
                  {new Date(caseData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {caseData.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#21170F] uppercase tracking-wider">
                  Description / Facts Summary
                </h3>
                <p className="text-xs text-[#766B5F] leading-relaxed bg-[#F8F4EC]/30 p-4 rounded-2xl border border-[#E2D5C1]/30 font-medium">
                  {caseData.description}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
              Next Court Hearing
            </h2>
            {caseData.nextHearingAt ? (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>Scheduled Hearing</span>
                </div>
                <p className="text-blue-950 font-semibold">
                  {new Date(caseData.nextHearingAt).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#766B5F]">No next hearing date listed.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. FACTS TAB */}
      {activeTab === "facts" && (
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
            Statement of Facts & Ground Notes
          </h2>
          <p className="text-xs text-[#766B5F] leading-relaxed bg-[#F8F4EC]/30 p-5 rounded-2xl border border-[#E2D5C1]/30 font-medium">
            {caseData.description || "No statement of facts compiled yet. Click Notes to add fact outlines."}
          </p>
        </div>
      )}

      {/* 3. PARTIES TAB */}
      {activeTab === "parties" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
              Petitioner / Plaintiff
            </h3>
            <div className="p-4 bg-[#F8F4EC]/50 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-[#21170F]">{caseData.clientName}</p>
              <p className="text-[11px] text-[#766B5F]">Primary Client Represented</p>
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-[#21170F] border-b border-[#E2D5C1]/40 pb-2">
              Respondent / Defendant
            </h3>
            <div className="p-4 bg-[#F8F4EC]/50 rounded-2xl text-xs space-y-1">
              <p className="font-bold text-[#21170F]">{caseData.opposingParty}</p>
              <p className="text-[11px] text-[#766B5F]">Opposing Litigant</p>
            </div>
          </div>
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
          <p className="text-xs text-[#766B5F] bg-[#F8F4EC]/30 p-4 rounded-2xl border border-[#E2D5C1]/30">
            Use the Statutory Research workspace to find judgments and citations for {caseData.title}.
          </p>
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
                  <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                    {new Date(ev.startAt).toLocaleString()}
                  </span>
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
        </div>
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
    </div>
  );
}
