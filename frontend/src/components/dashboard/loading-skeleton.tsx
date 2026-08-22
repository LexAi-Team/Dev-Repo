"use client";

export function StatCardSkeleton() {
  return (
    <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 shadow-xs animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-[#E2D5C1]/40 rounded-sm w-2/5" />
          <div className="h-7 bg-[#E2D5C1]/50 rounded-sm w-3/5" />
        </div>
        <div className="w-9 h-9 rounded-xl bg-[#E2D5C1]/40 shrink-0" />
      </div>
      <div className="h-3.5 bg-[#E2D5C1]/30 rounded-sm w-1/2" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="p-4 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-[#E2D5C1]/50 rounded-sm w-2/6" />
        <div className="h-3 bg-[#E2D5C1]/30 rounded-sm w-4/6" />
      </div>
      <div className="w-16 h-6 bg-[#E2D5C1]/40 rounded-full" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E2D5C1]/40 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-[#E2D5C1]/50 rounded-sm w-60" />
          <div className="h-4 bg-[#E2D5C1]/30 rounded-sm w-96" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 h-80 animate-pulse space-y-4">
          <div className="h-6 bg-[#E2D5C1]/50 rounded-sm w-1/3 border-b border-transparent pb-4" />
          <div className="space-y-3 pt-4">
            <div className="h-10 bg-[#E2D5C1]/30 rounded-xl" />
            <div className="h-10 bg-[#E2D5C1]/30 rounded-xl" />
            <div className="h-10 bg-[#E2D5C1]/30 rounded-xl" />
          </div>
        </div>
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 h-80 animate-pulse space-y-4">
          <div className="h-6 bg-[#E2D5C1]/50 rounded-sm w-1/2 border-b border-transparent pb-4" />
          <div className="space-y-3 pt-4">
            <div className="h-14 bg-[#E2D5C1]/30 rounded-xl" />
            <div className="h-14 bg-[#E2D5C1]/30 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
