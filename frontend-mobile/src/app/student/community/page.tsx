"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Users } from "lucide-react";

export default function StudentCommunityPage() {
  return (
    <PolishedPlaceholderPage
      title="Ecosystem Community"
      description="Connect with peer law students, discuss landmark judgments, and request mentorship."
      icon={Users}
    />
  );
}
