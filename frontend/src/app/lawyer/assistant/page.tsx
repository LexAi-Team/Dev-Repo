"use client";

import PageHeader from "@/components/app/page-header";
import AIChatShell from "@/components/ai/ai-chat-shell";

export default function LawyerAssistantPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="LEXAI Counsel Research & Case Intelligence"
        subtitle="Perform quick statutory RAG research, draft legal arguments, and analyze precedent data."
      />
      <AIChatShell />
    </div>
  );
}
