"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Briefcase } from "lucide-react";

export default function LawyerCasesPage() {
  return (
    <PolishedPlaceholderPage
      title="My Cases"
      description="Access client dossiers, evidence lists, witness statements, and legal argument outlines."
      icon={Briefcase}
    />
  );
}
