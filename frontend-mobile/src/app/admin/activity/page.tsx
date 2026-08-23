"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Activity } from "lucide-react";

export default function AdminActivityPage() {
  return (
    <PolishedPlaceholderPage
      title="System Activity Logs"
      description="Track platform API query logs, active connections, and database transaction histories."
      icon={Activity}
    />
  );
}
