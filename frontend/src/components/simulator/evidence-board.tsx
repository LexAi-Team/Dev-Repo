"use client";

import { useState } from "react";
import { FileText, Eye, ShieldAlert, Award } from "lucide-react";

export interface ExhibitItem {
  id: string;
  type: string;
  title: string;
  description: string;
  relevance?: string;
}

interface EvidenceBoardProps {
  evidenceList: ExhibitItem[];
}

export default function EvidenceBoard({ evidenceList }: EvidenceBoardProps) {
  const [activeExhibit, setActiveExhibit] = useState<ExhibitItem | null>(
    evidenceList[0] || null
  );

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="p-6 bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl text-center text-xs text-[#766B5F]">
        No evidence exhibits recorded for this case.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Exhibit List Sidebar */}
      <div className="space-y-2">
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F] px-1">
          Court Exhibits ({evidenceList.length})
        </h4>
        <div className="space-y-2">
          {evidenceList.map((item) => {
            const isSelected = activeExhibit?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveExhibit(item)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between outline-none ${
                  isSelected
                    ? "bg-[#A66A22] text-[#FFFDF8] border-[#A66A22] shadow-xs"
                    : "bg-[#FFFDF8] text-[#21170F] border-[#E2D5C1] hover:bg-[#F8F4EC]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#FFFDF8]" : "text-[#A66A22]"}`} />
                  <div className="truncate">
                    <p className="font-serif font-bold text-xs truncate">{item.id}</p>
                    <p className={`text-[10px] truncate ${isSelected ? "text-[#FFFDF8]/80" : "text-[#766B5F]"}`}>
                      {item.title}
                    </p>
                  </div>
                </div>
                <Eye className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#FFFDF8]" : "text-[#766B5F]/60"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Exhibit Inspector View */}
      {activeExhibit && (
        <div className="md:col-span-2 bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-start justify-between border-b border-[#E2D5C1] pb-3">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#A66A22]/10 text-[#A66A22] text-[10px] font-bold uppercase tracking-wider mb-1">
                {activeExhibit.id} — {activeExhibit.type}
              </span>
              <h3 className="font-serif font-bold text-base text-[#21170F]">{activeExhibit.title}</h3>
            </div>
            {activeExhibit.relevance && (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#A66A22] bg-[#A66A22]/10 px-2.5 py-1 rounded-lg border border-[#A66A22]/20">
                <Award className="w-3.5 h-3.5" />
                <span>Relevance: {activeExhibit.relevance}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#766B5F]">
              Exhibit Content & Deposition Detail
            </h5>
            <div className="p-4 bg-[#F8F4EC]/60 border border-[#E2D5C1]/60 rounded-xl text-xs text-[#21170F] leading-relaxed font-sans">
              {activeExhibit.description}
            </div>
          </div>

          <div className="p-3 bg-[#21170F]/5 border border-[#21170F]/10 rounded-xl flex items-center gap-2.5 text-xs text-[#766B5F]">
            <ShieldAlert className="w-4 h-4 text-[#A66A22] shrink-0" />
            <span>Exhibits must be cited in your strategy and final argument to earn Evidence Handling points.</span>
          </div>
        </div>
      )}
    </div>
  );
}
