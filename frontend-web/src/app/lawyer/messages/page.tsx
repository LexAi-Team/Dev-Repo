"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { MessageSquare } from "lucide-react";

export default function LawyerMessagesPage() {
  return (
    <PolishedPlaceholderPage
      title="Secure Messaging"
      description="Direct messaging with clients, co-counsel, and system administrators."
      icon={MessageSquare}
    />
  );
}
