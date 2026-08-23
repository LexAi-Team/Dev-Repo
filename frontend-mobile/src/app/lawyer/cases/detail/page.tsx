"use client";

import { Suspense } from "react";
import CaseDetailClient from "./CaseDetailClient";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CaseDetailClient />
    </Suspense>
  );
}
