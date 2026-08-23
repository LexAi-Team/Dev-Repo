"use client";

import PageHeader from "@/components/app/page-header";
import AIChatShell from "@/components/ai/ai-chat-shell";

export default function StudentAssistantPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="LEXAI Legal Research Assistant"
        subtitle="Explore statutory provisions, judicial precedents, and legal reasoning in real-time."
      />
      <AIChatShell />
    </div>
  );
}
