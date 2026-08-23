"use client";

interface DashboardSectionProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardSection({ title, action, children }: DashboardSectionProps) {
  return (
    <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs relative">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2D5C1]/40 mb-5">
        <h2 className="font-serif text-lg font-bold text-[#21170F] tracking-tight">
          {title}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
