"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { ShieldCheck } from "lucide-react";

export default function AdminLawyersPage() {
  return (
    <PolishedPlaceholderPage
      title="Advocates & Bar Registrations"
      description="Inspect legal practitioners, audit state bar enrollment details, and verify credentials."
      icon={ShieldCheck}
    />
  );
}
