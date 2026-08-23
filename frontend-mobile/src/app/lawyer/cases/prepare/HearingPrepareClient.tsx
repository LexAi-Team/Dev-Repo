"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Briefcase,
  AlertCircle,
  FileText,
  Search,
  Scale,
  BrainCircuit,
  CheckSquare,
  Sparkles,
  Lock,
  RefreshCw,
  Printer
} from "lucide-react";
import { api, CaseItem, HearingPreparationItem } from "@/lib/api";
import { useAuth } from "@/lib/firebase/provider";

export default function HearingPrepareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("id") || "";
  const eventId = searchParams.get("eventId") || "";
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [prep, setPrep] = useState<HearingPreparationItem | null>(null);
  const [eventData, setEventData] = useState<{ id: string; title: string; startAt: string; type: string; location?: string | null } | null>(null);
  
  // Checklist local state
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [caseRes, prepRes] = await Promise.all([
        api.getCase(caseId),
        api.getHearingPreparation(caseId, eventId)
      ]);

      if (caseRes.status === "success") {
        setCaseData(caseRes.data.case);
        const ev = caseRes.data.case.events?.find(e => e.id === eventId);
        if (ev) setEventData(ev);
        else setError("Hearing not found in this case.");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((caseRes as any).message || "Failed to load case data.");
      }

      if (prepRes.status === "success" && prepRes.data.hearingPrep) {
        setPrep(prepRes.data.hearingPrep);
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || "Failed to load hearing preparation workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "LAWYER") {
      router.push("/student/dashboard");
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");
      const res = await api.generateHearingPreparation(caseId, eventId);
      if (res.status === "success") {
        setPrep(res.data.hearingPrep);
        setCheckedItems({}); // reset checklist on new generation
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((res as any).message || "Failed to generate hearing brief.");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred while communicating with LexAI.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleChecklist = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSaveAsNote = async () => {
    if (!prep || !eventData) return;
    try {
      const content = `HEARING BRIEF: ${eventData.title}
Date: ${new Date(eventData.startAt).toLocaleString()}

SUMMARY:
${prep.summary}

DISPUTED ISSUES:
${prep.disputedIssues.map((i: string) => "- " + i).join("\n")}

KEY FACTS:
${prep.keyFacts.map((i: string) => "- " + i).join("\n")}

LEGAL AUTHORITIES:
${prep.legalAuthorities.map((i: string) => "- " + i).join("\n")}

QUESTIONS TO PREPARE:
${prep.questionsToPrepare.map((i: string) => "- " + i).join("\n")}
`;

      const res = await api.addCaseNote(caseId, {
        title: `Hearing Prep: ${eventData.title}`,
        content,
        isPrivate: false
      });
      if (res.status === "success") {
        alert("Brief saved as note successfully.");
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alert("Failed to save note: " + (res as any).message);
      }
    } catch {
      alert("Error saving note.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A66A22]"></div>
      </div>
    );
  }

  if (error || !caseData || !eventData) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] p-8 flex flex-col items-center justify-center space-y-4">
        <div className="bg-red-50 text-red-800 p-6 rounded-2xl max-w-md w-full text-center space-y-2 border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h2 className="font-bold text-lg">Error</h2>
          <p className="text-sm">{error}</p>
          <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(caseId)}`} className="mt-4 inline-block px-4 py-2 bg-red-100 font-semibold rounded-lg text-red-900 hover:bg-red-200">
            Return to Case
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#21170F] selection:bg-[#A66A22] selection:text-white pb-20">
      <header className="bg-[#FFFDF8] border-b border-[#E2D5C1] sticky top-0 z-30 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/lawyer/cases/detail?id=${encodeURIComponent(caseId)}`}
              className="p-2 hover:bg-[#F8F4EC] rounded-xl text-[#766B5F] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif font-bold text-lg text-[#21170F]">Hearing Preparation</h1>
              <p className="text-[11px] text-[#766B5F] font-semibold tracking-wider uppercase">
                {caseData.caseNumber} &bull; {caseData.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F4EC] border border-[#E2D5C1] hover:bg-[#E2D5C1]/40 rounded-lg text-xs font-bold text-[#4A3F35] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Brief</span>
            </button>
            {prep && (
              <button
                onClick={handleSaveAsNote}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F4EC] border border-[#E2D5C1] hover:bg-[#E2D5C1]/40 rounded-lg text-xs font-bold text-[#4A3F35] transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Save to Notes</span>
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#21170F] hover:bg-[#3A2E24] disabled:opacity-50 text-[#F8F4EC] rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5 text-[#A66A22]" />}
              <span>{prep ? "Refresh AI Brief" : "Generate AI Brief"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* TOP SNAPSHOT: CASE & HEARING */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HEARING DETAILS */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="font-serif text-lg font-bold">Hearing Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Title</p>
                  <p className="text-sm font-semibold">{eventData.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Date & Time</p>
                    <p className="text-sm font-semibold">{new Date(eventData.startAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Type</p>
                    <p className="text-sm font-semibold">{eventData.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Location / Court</p>
                  <p className="text-sm font-semibold">{eventData.location || caseData.court}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CASE SNAPSHOT */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-[#A66A22]" />
              <h2 className="font-serif text-lg font-bold">Case Snapshot</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Client</p>
                  <p className="text-sm font-semibold">{caseData.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Opposing Party</p>
                  <p className="text-sm font-semibold">{caseData.opposingParty}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 bg-[#F8F4EC] border border-[#E2D5C1] rounded-lg text-[10px] font-bold text-[#4A3F35]">
                  Status: {caseData.status}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-800">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(caseData as any).documents?.length || 0} Documents
                </span>
                <span className="px-2.5 py-1 bg-purple-50 border border-purple-100 rounded-lg text-[10px] font-bold text-purple-800">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(caseData as any).researches?.length || 0} Research Items
                </span>
                <span className="px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-lg text-[10px] font-bold text-orange-800">
                  {caseData.tasks?.filter((t: { status: string }) => t.status !== "COMPLETED").length || 0} Pending Tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {!prep ? (
          <div className="bg-[#FFFDF8] border border-dashed border-[#E2D5C1] rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F4EC] border border-[#E2D5C1] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#A66A22]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#21170F]">No Hearing Brief Generated</h3>
              <p className="text-sm text-[#766B5F] mt-1 max-w-md mx-auto">
                Generate an AI-powered brief using existing case documents, facts, research, and notes to prepare for this hearing.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 bg-[#A66A22] text-[#FFFDF8] font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-[#8A5619] transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 mt-2"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>{generating ? "Synthesizing Case Materials..." : "Generate Hearing Brief"}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: MAIN BRIEF */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* SUMMARY */}
              <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#A66A22]"></div>
                <h3 className="font-serif text-lg font-bold flex items-center gap-2 mb-3">
                  <BrainCircuit className="w-4 h-4 text-[#A66A22]" />
                  Hearing Objective & Summary
                </h3>
                <p className="text-sm text-[#4A3F35] leading-relaxed whitespace-pre-wrap">{prep.summary}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#A66A22]" />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#A66A22]">AI-Generated Synthesis</span>
                </div>
              </div>

              {/* ISSUES & FACTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* DISPUTED ISSUES */}
                <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                  <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Disputed Legal Issues
                  </h3>
                  {prep.disputedIssues.length > 0 ? (
                    <ul className="space-y-3">
                      {prep.disputedIssues.map((issue: string, idx: number) => (
                        <li key={idx} className="text-xs text-[#21170F] pl-4 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span className="leading-relaxed">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No specific disputed issues identified.</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#E2D5C1]/40 print:hidden">
                    <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(caseId)}&tab=research`} className="text-[10px] font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-1 hover:underline">
                      <Search className="w-3 h-3" /> Research these issues
                    </Link>
                  </div>
                </div>

                {/* KEY FACTS */}
                <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                  <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Critical Facts
                  </h3>
                  {prep.keyFacts.length > 0 ? (
                    <ul className="space-y-3">
                      {prep.keyFacts.map((fact: string, idx: number) => (
                        <li key={idx} className="text-xs text-[#21170F] pl-4 relative">
                          <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span className="leading-relaxed">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No critical facts identified.</p>
                  )}
                </div>
              </div>

              {/* LEGAL AUTHORITIES & EVIDENCE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                  <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#A66A22]" />
                    Relevant Authorities
                  </h3>
                  {prep.legalAuthorities.length > 0 ? (
                    <ul className="space-y-2">
                      {prep.legalAuthorities.map((auth: string, idx: number) => (
                        <li key={idx} className="text-xs p-3 bg-[#F8F4EC] border border-[#E2D5C1] rounded-xl text-[#21170F] leading-relaxed">
                          {auth}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No grounded legal authorities available.</p>
                  )}
                </div>

                <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                  <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Evidence to Prioritize
                  </h3>
                  {prep.evidenceToReview.length > 0 ? (
                    <ul className="space-y-2">
                      {prep.evidenceToReview.map((ev: string, idx: number) => (
                        <li key={idx} className="text-xs p-3 bg-blue-50 border border-blue-100 rounded-xl text-[#21170F] leading-relaxed">
                          {ev}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No evidence specified for review.</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-[#E2D5C1]/40 print:hidden">
                    <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(caseId)}&tab=documents`} className="text-[10px] font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-1 hover:underline">
                      <FileText className="w-3 h-3" /> View Documents
                    </Link>
                  </div>
                </div>
              </div>

              {/* ARGUMENTS */}
              <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                <h3 className="font-serif text-md font-bold mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#A66A22]" />
                  Argument Preparation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-[#21170F] uppercase tracking-wider mb-2 border-b border-[#E2D5C1]/40 pb-1">Supporting Arguments</h4>
                    {prep.supportingArguments.length > 0 ? (
                      <ul className="space-y-2">
                        {prep.supportingArguments.map((arg: string, idx: number) => (
                          <li key={idx} className="text-xs text-[#21170F] pl-3 border-l-2 border-[#A66A22] leading-relaxed">{arg}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#766B5F] italic">None identified.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 border-b border-rose-200 pb-1">Potential Opposing Arguments</h4>
                    {prep.opposingArguments.length > 0 ? (
                      <ul className="space-y-2">
                        {prep.opposingArguments.map((arg: string, idx: number) => (
                          <li key={idx} className="text-xs text-[#21170F] pl-3 border-l-2 border-rose-400 leading-relaxed">{arg}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#766B5F] italic">Insufficient material to identify opposing arguments.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTIONABLE PREP */}
            <div className="space-y-6">
              
              {/* CHECKLIST */}
              <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Preparation Checklist
                </h3>
                <div className="space-y-2">
                  {prep.checklist.length > 0 ? (
                    prep.checklist.map((item: string, idx: number) => (
                      <label key={idx} className="flex items-start gap-2 p-2 hover:bg-[#F8F4EC] rounded-xl cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={!!checkedItems[idx]}
                          onChange={() => toggleChecklist(idx)}
                          className="mt-0.5 rounded border-[#E2D5C1] text-[#A66A22] focus:ring-[#A66A22] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className={`text-xs transition-colors ${checkedItems[idx] ? 'text-[#766B5F] line-through' : 'text-[#21170F] group-hover:text-[#A66A22]'}`}>
                          {item}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No checklist items generated.</p>
                  )}
                </div>
              </div>

              {/* QUESTIONS TO PREPARE */}
              <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  Questions to Prepare
                </h3>
                <div className="space-y-3">
                  {prep.questionsToPrepare.length > 0 ? (
                    prep.questionsToPrepare.map((q: string, idx: number) => (
                      <div key={idx} className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                        <p className="text-xs font-medium text-purple-900 leading-relaxed">&quot;{q}&quot;</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#766B5F] italic">No questions suggested.</p>
                  )}
                </div>
                <p className="text-[9px] text-[#766B5F] mt-3 italic text-center">AI-generated preparation suggestions.</p>
              </div>

              {/* PENDING TASKS OVERVIEW */}
              <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
                <h3 className="font-serif text-md font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Relevant Pending Tasks
                </h3>
                {prep.pendingTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {prep.pendingTasks.map((task: string, idx: number) => (
                      <li key={idx} className="text-xs flex items-start gap-2 p-2 bg-orange-50 border border-orange-100 rounded-xl text-[#21170F]">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 shrink-0"></span>
                        <span className="leading-relaxed">{task}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#766B5F] italic">No relevant tasks identified.</p>
                )}
                <div className="mt-4 pt-4 border-t border-[#E2D5C1]/40 print:hidden">
                  <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(caseId)}&tab=tasks`} className="text-[10px] font-bold text-[#A66A22] uppercase tracking-wider flex items-center gap-1 hover:underline">
                    <CheckSquare className="w-3 h-3" /> View All Case Tasks
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
