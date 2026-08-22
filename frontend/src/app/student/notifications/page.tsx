"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Bell } from "lucide-react";

export default function StudentNotificationsPage() {
  return (
    <PolishedPlaceholderPage
      title="Notifications Alert"
      description="Track platform alerts, case feedback notices, and system logs."
      icon={Bell}
    />
  );
}
