"use client";

import { Shield, BookOpen, Scale, FileText, Building2, Gavel, Cpu, ShoppingBag, HeartHandshake } from "lucide-react";

export const PRACTICE_AREAS = [
  { id: "Criminal Law", label: "Criminal Law", icon: Shield, desc: "IPC/BNS offences, bail applications, police investigation procedure." },
  { id: "Civil Law", label: "Civil Law", icon: Scale, desc: "CPC suits, injunctions, property disputes, execution decrees." },
  { id: "Contract Law", label: "Contract Law", icon: FileText, desc: "Breach of contract, damages, specific performance, indemnity." },
  { id: "Constitutional Law", label: "Constitutional Law", icon: Gavel, desc: "Fundamental rights, writ petitions, judicial review, Article 32/226." },
  { id: "Corporate Law", label: "Corporate Law", icon: Building2, desc: "Companies Act disputes, NCLT insolvency, shareholder rights." },
  { id: "Intellectual Property", label: "Intellectual Property", icon: BookOpen, desc: "Trademarks, patents infringement, copyright disputes." },
  { id: "Cyber Law", label: "Cyber Law", icon: Cpu, desc: "IT Act 2000, digital fraud, data privacy, cyber crime." },
  { id: "Consumer Law", label: "Consumer Law", icon: ShoppingBag, desc: "Consumer protection complaints, product liability, deficiency of service." },
  { id: "Family Law", label: "Family Law", icon: HeartHandshake, desc: "Matrimonial disputes, custody, maintenance under Hindu/Muslim personal law." },
];

interface PracticeAreaSelectorProps {
  selectedArea: string;
  onSelect: (areaId: string) => void;
}

export default function PracticeAreaSelector({ selectedArea, onSelect }: PracticeAreaSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {PRACTICE_AREAS.map((area) => {
        const Icon = area.icon;
        const isSelected = selectedArea === area.id;

        return (
          <button
            key={area.id}
            onClick={() => onSelect(area.id)}
            className={`p-4 rounded-2xl border text-left transition-all space-y-2 outline-none flex flex-col justify-between ${
              isSelected
                ? "bg-[#A66A22]/10 border-[#A66A22] shadow-xs"
                : "bg-[#FFFDF8] border-[#E2D5C1] hover:border-[#A66A22]/40 hover:bg-[#F8F4EC]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? "bg-[#A66A22] text-[#FFFDF8] border-[#A66A22]"
                    : "bg-[#A66A22]/10 text-[#A66A22] border-[#A66A22]/20"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-[#21170F]">{area.label}</h3>
            </div>
            <p className="text-xs text-[#766B5F] leading-relaxed">{area.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
