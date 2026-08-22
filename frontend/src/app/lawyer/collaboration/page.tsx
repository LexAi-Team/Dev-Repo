"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Network } from "lucide-react";

export default function LawyerCollaborationPage() {
  return (
    <PolishedPlaceholderPage
      title="Counsel Collaboration"
      description="Co-author briefs, share files with associate counsel, and coordinate courtroom strategy."
      icon={Network}
    />
  );
}
