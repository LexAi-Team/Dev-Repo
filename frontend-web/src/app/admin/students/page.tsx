"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { GraduationCap } from "lucide-react";

export default function AdminStudentsPage() {
  return (
    <PolishedPlaceholderPage
      title="Law Students Auditing"
      description="Inspect law student profiles, academic records, and case practice statistics."
      icon={GraduationCap}
    />
  );
}
