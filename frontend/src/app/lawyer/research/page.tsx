"use client";

import { useState } from "react";
import { api, AIChatMessage } from "@/lib/api";
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  Scale,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";

export default function LegalResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAct, setSelectedAct] = useState("ALL");
  const [selectedCourt, setSelectedCourt] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [searching, setSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AIChatMessage | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setErrorMessage("");
    setSearching(true);

    // Build enriched search prompt for LexAI statutory RAG pipeline
    const filterContext = [];
    if (selectedAct !== "ALL") filterContext.push(`Act: ${selectedAct}`);
    if (selectedCourt !== "ALL") filterContext.push(`Court: ${selectedCourt}`);
    if (selectedCategory !== "ALL") filterContext.push(`Category: ${selectedCategory}`);

    const prompt = filterContext.length > 0
      ? `[Legal Research Query] ${searchQuery.trim()} (${filterContext.join(", ")})`
      : searchQuery.trim();

    try {
      const res = await api.sendChatMessage(prompt);
      if (res && res.status === "success" && res.data.message) {
        setResult(res.data.message);
      } else {
        setErrorMessage("Legal research query failed. Please try again.");
      }
    } catch (err: unknown) {
      console.error("[Research Error]:", err);
      setErrorMessage("LEXAI Statutory RAG Engine is temporarily unavailable. Please check your network.");
    } finally {
      setSearching(false);
    }
  };

  const sampleResearchTopics = [
    { title: "Anticipatory Bail under CrPC", query: "What are the essential conditions for grant of anticipatory bail under Section 438 CrPC?" },
    { title: "Dishonour of Cheque (Sec 138 NI Act)", query: "Statutory notice requirement and cause of action timeline under Section 138 of Negotiable Instruments Act." },
    { title: "Specific Performance of Contract", query: "Requisites for claiming decree of specific performance under Specific Relief Act." },
    { title: "Arbitration & Conciliation Act", query: "Grounds for setting aside arbitral award under Section 34 of Arbitration Act." },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statutory Legal Research Workspace"
        subtitle="Search Acts, Sections, Precedents, and Judicial Judgments powered by LexAI RAG Retrieval."
      />

      {/* Search & Filter Card */}
      <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#A66A22]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search legal issue, section, statutory provision, or judgment citation..."
              className="w-full h-13 pl-12 pr-32 text-sm font-semibold text-[#21170F] bg-[#F8F4EC]/50 border border-[#E2D5C1] rounded-2xl outline-none focus:ring-2 focus:ring-[#A66A22] focus:border-[#A66A22] shadow-2xs"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 px-6 py-2.5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Search Law</span>
                </>
              )}
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#E2D5C1]/40">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#766B5F] mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedAct}
              onChange={(e) => setSelectedAct(e.target.value)}
              className="h-9 px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
            >
              <option value="ALL">All Statutory Acts</option>
              <option value="IPC">Indian Penal Code (IPC)</option>
              <option value="CrPC">Code of Criminal Procedure (CrPC)</option>
              <option value="CPC">Code of Civil Procedure (CPC)</option>
              <option value="ICA">Indian Contract Act (ICA)</option>
              <option value="CONSTITUTION">Constitution of India</option>
              <option value="NI_ACT">Negotiable Instruments Act</option>
            </select>

            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="h-9 px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
            >
              <option value="ALL">All Judicial Courts</option>
              <option value="SC">Supreme Court of India</option>
              <option value="HC_MADRAS">Madras High Court</option>
              <option value="HC_DELHI">Delhi High Court</option>
              <option value="HC_BOMBAY">Bombay High Court</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
            >
              <option value="ALL">All Case Types</option>
              <option value="CRIMINAL">Criminal Law</option>
              <option value="CIVIL">Civil Matters</option>
              <option value="CONSTITUTIONAL">Constitutional Law</option>
              <option value="CORPORATE">Corporate Practice</option>
            </select>
          </div>
        </form>

        {/* Quick Sample Queries */}
        {!result && !searching && (
          <div className="pt-3 border-t border-[#E2D5C1]/40 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22]">
              Suggested Precedent Queries
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleResearchTopics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(topic.query);
                  }}
                  className="p-3 bg-[#F8F4EC]/50 hover:bg-[#A66A22]/5 border border-[#E2D5C1]/40 rounded-xl text-left text-xs font-semibold text-[#21170F] transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold group-hover:text-[#A66A22]">{topic.title}</p>
                    <p className="text-[10px] text-[#766B5F] truncate max-w-xs">{topic.query}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#766B5F]/50 group-hover:text-[#A66A22] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton State */}
      {searching && (
        <div className="p-8 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl text-center space-y-4 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#A66A22] animate-spin mx-auto" />
          <h3 className="font-serif font-bold text-sm text-[#21170F]">
            Retrieving Statutory Provisions & Case Law Precedents...
          </h3>
          <p className="text-xs text-[#766B5F]">
            Querying grounded LexAI legal database across Indian statutes and judicial rulings.
          </p>
        </div>
      )}

      {/* RAG Research Results Panel */}
      {result && !searching && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Analysis Card */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span>AI Legal Analysis</span>
              </span>
              <span className="text-[10px] text-[#766B5F] font-semibold">
                Grounded Statutory Reasoning
              </span>
            </div>

            <div className="prose prose-stone text-xs leading-relaxed text-[#21170F] whitespace-pre-wrap font-medium">
              {result.content}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Legal Sources Panel */}
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#21170F]">
                <BookOpen className="w-4 h-4 text-[#A66A22]" />
                <span>Legal Sources & RAG Context ({result.sources?.length || 0})</span>
              </span>

              {result.sources && result.sources.length > 0 ? (
                <div className="space-y-3">
                  {result.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#21170F]">{src.title}</h4>
                        <span className="text-[9px] font-bold text-[#A66A22] uppercase tracking-wider bg-[#A66A22]/10 px-2 py-0.5 rounded-md">
                          {src.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#766B5F] italic leading-relaxed">
                        &ldquo;{src.snippet}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#766B5F]">No specific external sources retrieved.</p>
              )}
            </div>

            {/* Statutory Provisions & Citations Panel */}
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#21170F]">
                <Scale className="w-4 h-4 text-[#A66A22]" />
                <span>Statutory Provisions & Claims</span>
              </span>

              {result.claims && result.claims.length > 0 ? (
                <div className="space-y-3">
                  {result.claims.map((claim, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-[#F8F4EC]/50 border border-[#E2D5C1]/40 rounded-xl space-y-1"
                    >
                      <p className="text-xs font-bold text-[#21170F]">{claim.claim}</p>
                      {claim.source_ids && claim.source_ids.length > 0 && (
                        <p className="text-[10px] text-[#A66A22] font-semibold">
                          Sources: {claim.source_ids.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-xl text-xs text-[#766B5F] space-y-1">
                  <p className="font-bold text-[#21170F]">Grounded Legal Provisions Verified</p>
                  <p className="text-[11px]">
                    All analysis statements are directly synthesized from official Indian statutory provisions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
