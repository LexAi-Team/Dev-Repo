"use client";

import { FileText, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface Claim {
  claim: string;
  source_ids: string[];
}

interface Source {
  id: string;
  title: string;
  category: string;
  snippet: string;
  score?: number;
}

interface CitationListProps {
  claims?: Claim[];
  sources?: Source[];
}

export default function CitationList({ claims, sources }: CitationListProps) {
  const [expanded, setExpanded] = useState(false);

  if ((!claims || claims.length === 0) && (!sources || sources.length === 0)) {
    return (
      <div className="mt-3 text-[11px] text-[#766B5F]/70 italic">
        No specific statutory sources were returned for this query.
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-[#E2D5C1]/50 space-y-3">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Retrieved Legal Sources & Verification ({sources?.length || 0})
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="space-y-3 text-xs">
          {/* Claims breakdown */}
          {claims && claims.length > 0 && (
            <div className="bg-[#F8F4EC]/60 border border-[#E2D5C1]/40 rounded-xl p-3 space-y-2">
              <p className="font-bold text-[#21170F] text-[11px] uppercase tracking-wider">
                Legal Propositions
              </p>
              <ul className="space-y-1.5">
                {claims.map((c, i) => (
                  <li key={i} className="text-[#4A3E31] leading-relaxed flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A66A22] mt-1.5 shrink-0" />
                    <span>
                      {c.claim}{" "}
                      {c.source_ids.length > 0 && (
                        <span className="text-[10px] text-[#A66A22] font-semibold">
                          [{c.source_ids.join(", ")}]
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources list */}
          {sources && sources.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sources.map((src, i) => (
                <div
                  key={i}
                  className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-md">
                        {src.category}
                      </span>
                      {src.score && (
                        <span className="text-[10px] font-semibold text-[#766B5F] flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-[#A66A22]" />
                          Score: {src.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-[#21170F] text-xs line-clamp-1">{src.title}</h4>
                    <p className="text-[11px] text-[#766B5F] line-clamp-3 leading-relaxed">
                      {src.snippet}
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-[#A66A22] font-semibold">
                    ID: {src.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
