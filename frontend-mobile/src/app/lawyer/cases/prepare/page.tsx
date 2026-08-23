"use client";

import { Suspense } from "react";
import HearingPrepareClient from "./HearingPrepareClient";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function HearingPreparePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HearingPrepareClient />
    </Suspense>
  );
}
