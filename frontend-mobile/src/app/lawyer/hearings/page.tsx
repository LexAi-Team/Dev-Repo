"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Scale } from "lucide-react";

export default function LawyerHearingsPage() {
  return (
    <PolishedPlaceholderPage
      title="Hearings & Calendar"
      description="Track upcoming court hearing dates, client consultations, and filing deadlines."
      icon={Scale}
    />
  );
}
