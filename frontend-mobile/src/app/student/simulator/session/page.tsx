"use client";

import { Suspense } from "react";
import SessionClient from "./SessionClient";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function SimulatorSessionPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SessionClient />
    </Suspense>
  );
}
