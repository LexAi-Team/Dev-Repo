"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import AIChatShell from "@/components/ai/ai-chat-shell";

function AssistantContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId") || undefined;

  return <AIChatShell caseId={caseId} />;
}

export default function LawyerAssistantPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="LEXAI Counsel Research & Case Intelligence"
        subtitle="Perform quick statutory RAG research, draft legal arguments, and analyze precedent data."
      />
      <Suspense fallback={
        <div className="p-8 text-center text-xs font-semibold text-[#766B5F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl animate-pulse">
          Loading AI Assistant Workspace...
        </div>
      }>
        <AssistantContent />
      </Suspense>
    </div>
  );
}
