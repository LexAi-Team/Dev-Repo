"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Bell } from "lucide-react";

export default function LawyerNotificationsPage() {
  return (
    <PolishedPlaceholderPage
      title="Practice Alerts"
      description="View notification logs, hearing adjustments, and client messages."
      icon={Bell}
    />
  );
}
