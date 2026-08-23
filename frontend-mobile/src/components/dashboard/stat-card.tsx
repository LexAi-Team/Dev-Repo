"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    positive: boolean;
  };
}

export default function StatCard({ title, value, icon: Icon, change }: StatCardProps) {
  return (
    <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#766B5F]/80">
            {title}
          </p>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
            {value}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20">
          <Icon className="w-5 h-5 text-[#A66A22]" />
        </div>
      </div>

      {change && (
        <div className="mt-3.5 flex items-center gap-1.5 text-[10px] font-bold">
          <span
            className={
              change.positive
                ? "text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md"
                : "text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md"
            }
          >
            {change.value}
          </span>
          <span className="text-[#766B5F]/70 uppercase tracking-wider">vs last month</span>
        </div>
      )}
    </div>
  );
}
