"use client";

import {
  Briefcase,
  Users,
  FileText,
  Upload,
  BrainCircuit,
  Sparkles,
  Lock,
  Calendar,
  CheckSquare,
  AlertCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import {
  CaseItem,
  CaseFactItem,
  CasePartyItem,
  CaseDocumentItem,
  CaseIntelligenceItem,
  CaseResearchItem,
  CaseNoteItem
} from "@/lib/api";

interface CaseBriefProps {
  caseData: CaseItem;
  facts: CaseFactItem[];
  parties: CasePartyItem[];
  documents: CaseDocumentItem[];
  intelligence: CaseIntelligenceItem | null;
  researches: CaseResearchItem[];
  notes: CaseNoteItem[];
  setActiveTab: (tab: string) => void;
  isEditor: boolean;
}

export default function CaseBrief({
  caseData,
  facts,
  parties,
  documents,
  intelligence,
  researches,
  // using 'isEditor' and 'notes' as place holders if future extensions need them, suppressing lint for now.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  notes,
  setActiveTab,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isEditor
}: CaseBriefProps) {
  
  const pendingTasksCount = caseData.tasks?.filter(t => t.status === "PENDING" || t.status === "IN_PROGRESS").length || 0;
  const upcomingHearingsCount = caseData.events?.filter(e => e.type === "HEARING" && new Date(e.startAt) > new Date()).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. STATUS & HEALTH INDICATORS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl flex flex-col justify-center items-center gap-1 shadow-xs">
          <Briefcase className="w-5 h-5 text-[#A66A22] mb-1" />
          <span className="text-[10px] text-[#766B5F] uppercase font-bold tracking-wider">Status</span>
          <span className="text-xs font-bold text-[#21170F]">{caseData.status}</span>
        </div>
        <div className="p-4 bg-[#FFFDF8] border border-orange-200 rounded-2xl flex flex-col justify-center items-center gap-1 shadow-xs cursor-pointer hover:bg-orange-50 transition-colors" onClick={() => setActiveTab('tasks')}>
          <CheckSquare className="w-5 h-5 text-orange-600 mb-1" />
          <span className="text-[10px] text-orange-800 uppercase font-bold tracking-wider">Tasks</span>
          <span className="text-xs font-bold text-orange-900">{pendingTasksCount} Pending</span>
        </div>
        <div className="p-4 bg-[#FFFDF8] border border-blue-200 rounded-2xl flex flex-col justify-center items-center gap-1 shadow-xs cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => setActiveTab('hearings')}>
          <Calendar className="w-5 h-5 text-blue-600 mb-1" />
          <span className="text-[10px] text-blue-800 uppercase font-bold tracking-wider">Hearings</span>
          <span className="text-xs font-bold text-blue-900">{upcomingHearingsCount} Upcoming</span>
        </div>
        <div className="p-4 bg-[#FFFDF8] border border-emerald-200 rounded-2xl flex flex-col justify-center items-center gap-1 shadow-xs cursor-pointer hover:bg-emerald-50 transition-colors" onClick={() => setActiveTab('documents')}>
          <Upload className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Evidence</span>
          <span className="text-xs font-bold text-emerald-900">{documents.length} Available</span>
        </div>
        <div className="p-4 bg-[#FFFDF8] border border-purple-200 rounded-2xl flex flex-col justify-center items-center gap-1 shadow-xs cursor-pointer hover:bg-purple-50 transition-colors" onClick={() => setActiveTab('research')}>
          <Sparkles className="w-5 h-5 text-purple-600 mb-1" />
          <span className="text-[10px] text-purple-800 uppercase font-bold tracking-wider">Research</span>
          <span className="text-xs font-bold text-purple-900">{researches.length} Items</span>
        </div>
      </div>

      {/* 2. CASE BRIEF MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI SUMMARY */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-2">
              <h2 className="font-serif text-lg font-bold text-[#21170F] flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#A66A22]" />
                LexAI Case Synthesis
              </h2>
              <button onClick={() => setActiveTab("intelligence")} className="text-[10px] font-bold text-[#A66A22] hover:underline flex items-center gap-1">
                View Full Intelligence <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {intelligence ? (
              <p className="text-sm text-[#4A3F35] leading-relaxed bg-[#F8F4EC]/50 p-4 rounded-2xl border border-[#E2D5C1]/30">
                {intelligence.summary}
              </p>
            ) : (
              <p className="text-sm text-[#766B5F] italic">Insufficient case information for a reliable summary. Please generate Case Intelligence first.</p>
            )}
          </div>

          {/* FACTS & PARTIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Key Facts</div>
                <button onClick={() => setActiveTab('facts')} className="text-[#766B5F] hover:text-[#21170F]"><ArrowRight className="w-3 h-3" /></button>
              </h3>
              <ul className="space-y-2">
                {facts.filter(f => f.isImportant).slice(0, 3).map(f => (
                  <li key={f.id} className="text-xs text-[#21170F] leading-relaxed line-clamp-2">• {f.title}</li>
                ))}
                {facts.length === 0 && <li className="text-xs text-[#766B5F] italic">No facts documented.</li>}
              </ul>
            </div>

            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Parties</div>
                <button onClick={() => setActiveTab('parties')} className="text-[#766B5F] hover:text-[#21170F]"><ArrowRight className="w-3 h-3" /></button>
              </h3>
              <ul className="space-y-2">
                {parties.slice(0, 3).map(p => (
                  <li key={p.id} className="text-xs text-[#21170F] leading-relaxed line-clamp-1 flex items-center justify-between">
                    <span>{p.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#F8F4EC] rounded text-[#766B5F]">{p.partyType}</span>
                  </li>
                ))}
                {parties.length === 0 && <li className="text-xs text-[#766B5F] italic">No parties added.</li>}
              </ul>
            </div>
          </div>

          {/* ARGUMENTS & ISSUES */}
          {intelligence && (
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#A66A22]" /> Core Issues & Arguments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#766B5F] uppercase">Primary Legal Issues</h4>
                  <ul className="space-y-1.5">
                    {intelligence.legalIssues.slice(0, 3).map((iss: string, i: number) => (
                      <li key={i} className="text-xs text-[#21170F] leading-relaxed flex gap-1.5"><span className="text-[#A66A22]">▪</span> {iss}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#766B5F] uppercase">Supporting Arguments</h4>
                  <ul className="space-y-1.5">
                    {intelligence.supportingArguments.slice(0, 3).map((arg: string, i: number) => (
                      <li key={i} className="text-xs text-emerald-800 leading-relaxed flex gap-1.5"><span className="text-emerald-500">▪</span> {arg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* UPCOMING ACTIONS */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" /> Upcoming Actions
            </h3>
            
            <div className="space-y-4">
              {caseData.events?.filter(e => new Date(e.startAt) > new Date()).slice(0, 2).map(evt => (
                <div key={evt.id} className="text-xs border-l-2 border-blue-500 pl-3">
                  <p className="font-bold text-[#21170F]">{evt.title}</p>
                  <p className="text-[#766B5F]">{new Date(evt.startAt).toLocaleString()}</p>
                  <span className="text-[9px] uppercase font-bold text-blue-700 bg-blue-50 px-1 py-0.5 mt-1 inline-block">Hearing</span>
                </div>
              ))}
              
              {caseData.tasks?.filter(t => t.status === "PENDING").slice(0, 2).map(tsk => (
                <div key={tsk.id} className="text-xs border-l-2 border-orange-500 pl-3">
                  <p className="font-bold text-[#21170F]">{tsk.title}</p>
                  {tsk.dueAt && <p className="text-[#766B5F]">Due: {new Date(tsk.dueAt).toLocaleDateString()}</p>}
                  <span className="text-[9px] uppercase font-bold text-orange-700 bg-orange-50 px-1 py-0.5 mt-1 inline-block">Pending Task</span>
                </div>
              ))}

              {intelligence?.importantDates && intelligence.importantDates.length > 0 && (
                <div className="text-xs border-l-2 border-rose-500 pl-3">
                  <p className="font-bold text-[#21170F]">Extracted Deadline</p>
                  <p className="text-[#766B5F]">{intelligence.importantDates[0]}</p>
                  <span className="text-[9px] uppercase font-bold text-rose-700 bg-rose-50 px-1 py-0.5 mt-1 inline-block">Suggested</span>
                </div>
              )}
              
              {(!caseData.events || caseData.events.length === 0) && (!caseData.tasks || caseData.tasks.length === 0) && (
                <p className="text-xs text-[#766B5F] italic">No upcoming actions scheduled.</p>
              )}
            </div>
          </div>

          {/* EVIDENCE & GAPS */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" /> Evidence Gaps
            </h3>
            {intelligence?.evidenceGaps && intelligence.evidenceGaps.length > 0 ? (
              <ul className="space-y-2">
                {intelligence.evidenceGaps.slice(0, 3).map((gap: string, i: number) => (
                  <li key={i} className="text-xs text-[#21170F] leading-relaxed flex gap-1.5">
                    <span className="text-rose-500 font-bold">•</span> {gap}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#766B5F] italic">No evidence gaps identified or intelligence not generated.</p>
            )}
            <button onClick={() => setActiveTab('documents')} className="w-full mt-2 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
              Manage Evidence
            </button>
          </div>

          {/* RESEARCH OVERVIEW */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#21170F] border-b border-[#E2D5C1]/40 pb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Research Highlights
            </h3>
            <ul className="space-y-3">
              {researches.slice(0, 2).map((res) => (
                <li key={res.id} className="text-xs space-y-1">
                  <p className="font-bold text-[#21170F] line-clamp-1">{res.query}</p>
                  <p className="text-[10px] text-[#766B5F] line-clamp-2">{res.aiAnalysis}</p>
                </li>
              ))}
              {researches.length === 0 && (
                <p className="text-xs text-[#766B5F] italic">No research saved to this case.</p>
              )}
            </ul>
            <button onClick={() => setActiveTab('research')} className="w-full mt-2 py-1.5 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              Open Legal Research
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
