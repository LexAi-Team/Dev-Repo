"use client";

import { Suspense } from "react";
import ResultClient from "./ResultClient";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function SimulatorResultPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ResultClient />
    </Suspense>
  );
}
