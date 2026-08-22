"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { CheckSquare } from "lucide-react";

export default function LawyerTasksPage() {
  return (
    <PolishedPlaceholderPage
      title="Tasks Checklist"
      description="Track assigned case objectives, evidentiary filings, and client meeting tasks."
      icon={CheckSquare}
    />
  );
}
