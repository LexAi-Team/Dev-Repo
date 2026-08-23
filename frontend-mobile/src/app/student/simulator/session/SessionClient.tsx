"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StageProgress from "@/components/simulator/stage-progress";
import EvidenceBoard, { ExhibitItem } from "@/components/simulator/evidence-board";
import { api, SimulationSessionData } from "@/lib/api";
import {
  Loader2,
  ArrowRight,
  Shield,
  Users,
  FileText,
  Gavel,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export default function SessionClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const router = useRouter();

  const [session, setSession] = useState<SimulationSessionData | null>(null);
  const [currentStage, setCurrentStage] = useState("CASE_BRIEF");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Inputs per stage
  const [factInput, setFactInput] = useState("");
  const [evidenceInput, setEvidenceInput] = useState("");
  const [issueInput, setIssueInput] = useState("");
  const [strategyInput, setStrategyInput] = useState("");
  const [proceedingsInput, setProceedingsInput] = useState("");
  const [finalArgumentInput, setFinalArgumentInput] = useState("");

  // Simulated Proceedings Event
  const [proceedingsEvent, setProceedingsEvent] = useState<{
    speaker: string;
    speakerName: string;
    statement: string;
    suggestedFocus: string;
  } | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        setIsLoading(true);
        const res = await api.getSimulatorSession(sessionId);
        if (res.status === "success" && res.data?.session) {
          const s = res.data.session;
          if (s.status === "COMPLETED") {
            router.push(`/student/simulator/result?sessionId=${encodeURIComponent(sessionId)}`);
            return;
          }
          setSession(s);
          setCurrentStage(s.currentStage || "CASE_BRIEF");

          // Restore existing responses if session was reloaded
          if (s.responses) {
            for (const r of s.responses) {
              if (r.stage === "FACT_ANALYSIS") setFactInput(r.studentResponse);
              if (r.stage === "EVIDENCE_REVIEW") setEvidenceInput(r.studentResponse);
              if (r.stage === "ISSUE_IDENTIFICATION") setIssueInput(r.studentResponse);
              if (r.stage === "LEGAL_STRATEGY") setStrategyInput(r.studentResponse);
              if (r.stage === "PROCEEDINGS") setProceedingsInput(r.studentResponse);
              if (r.stage === "FINAL_ARGUMENT") setFinalArgumentInput(r.studentResponse);
            }
          }
        }
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        setError(errorObj.message || "Failed to load simulation session.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const handleAdvanceStage = async (nextStage: string, promptText: string, studentResponseText: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Save progress to PostgreSQL
      await api.saveSimulatorProgress(sessionId, nextStage, promptText, studentResponseText);
      setCurrentStage(nextStage);

      // Trigger Proceedings Event if moving into PROCEEDINGS
      if (nextStage === "PROCEEDINGS" && !proceedingsEvent) {
        const eventRes = await api.generateProceedingsEvent(sessionId, strategyInput || studentResponseText);
        if (eventRes.status === "success" && eventRes.data?.event) {
          setProceedingsEvent(eventRes.data.event);
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Failed to save progress.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalEvaluate = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Save final argument
      await api.saveSimulatorProgress(
        sessionId,
        "EVALUATION",
        "Final Oral Argument Submission",
        finalArgumentInput
      );

      // 2. Navigate to result page (EvaluationLoading will render & manage evaluation state)
      router.push(`/student/simulator/result?sessionId=${encodeURIComponent(sessionId)}`);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "Failed to evaluate case simulation.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-[#A66A22] animate-spin" />
        <p className="text-xs font-semibold text-[#766B5F]">Loading legal simulation session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl text-center space-y-4 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-[#21170F]">Session Not Found</h2>
        <p className="text-xs text-[#766B5F]">{error || "This simulation session does not exist or has expired."}</p>
        <button
          onClick={() => router.push("/student/simulator")}
          className="px-5 py-2.5 bg-[#A66A22] text-[#FFFDF8] rounded-xl text-xs font-semibold"
        >
          Back to Case Selection
        </button>
      </div>
    );
  }

  const scenario = session.caseScenario;
  const factsList: string[] = JSON.parse(scenario.facts || "[]");
  const partiesList: { name: string; role: string; description: string }[] = JSON.parse(
    scenario.parties || "[]"
  );
  const issuesList: string[] = JSON.parse(scenario.legalIssues || "[]");
  const evidenceList: ExhibitItem[] = JSON.parse(scenario.evidence || "[]");

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Header Card */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-[#A66A22]/10 text-[#A66A22] text-[10px] font-bold uppercase tracking-wider">
                {scenario.practiceArea}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#21170F]/10 text-[#21170F] text-[10px] font-bold uppercase tracking-wider">
                {scenario.difficulty}
              </span>
            </div>
            <h1 className="font-serif text-xl font-bold text-[#21170F]">{scenario.title}</h1>
          </div>

          <button
            onClick={() => router.push("/student/simulator")}
            className="text-xs font-semibold text-[#766B5F] hover:text-[#A66A22] transition-colors"
          >
            ← Leave Simulation
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <StageProgress currentStage={currentStage} onSelectStage={(st) => setCurrentStage(st)} />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        {/* STAGE 1: CASE BRIEF */}
        {currentStage === "CASE_BRIEF" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2D5C1] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#21170F]">Official Case Brief</h2>
                <p className="text-xs text-[#766B5F]">Review the scenario details before entering the simulation.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F] mb-1">
                  Background Summary
                </h3>
                <p className="text-xs text-[#21170F] leading-relaxed p-4 bg-[#F8F4EC]/60 border border-[#E2D5C1]/60 rounded-2xl">
                  {scenario.summary}
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F] mb-2">
                  Parties Involved
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partiesList.map((p, i) => (
                    <div key={i} className="p-3.5 bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#A66A22]">
                        <Users className="w-3.5 h-3.5" />
                        <span>{p.name}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-[#21170F]">{p.role}</p>
                      <p className="text-xs text-[#766B5F]">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("FACT_ANALYSIS", "Case Brief Reviewed", "Confirmed")}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Begin Fact Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: FACT ANALYSIS */}
        {currentStage === "FACT_ANALYSIS" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#E2D5C1] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#A66A22]/10 text-[#A66A22] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#21170F]">Chronological Case Facts</h2>
                <p className="text-xs text-[#766B5F]">Analyze disputed vs undisputed factual allegations.</p>
              </div>
            </div>

            <div className="space-y-3">
              {factsList.map((fact, idx) => (
                <div key={idx} className="p-3.5 bg-[#F8F4EC]/60 border border-[#E2D5C1]/60 rounded-2xl flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#A66A22] text-[#FFFDF8] text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#21170F] leading-relaxed pt-0.5">{fact}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                Your Fact Analysis & Notes
              </label>
              <textarea
                rows={4}
                value={factInput}
                onChange={(e) => setFactInput(e.target.value)}
                placeholder="Identify key disputed facts, timelines, or factual strengths for your client..."
                className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("EVIDENCE_REVIEW", "Fact Analysis Submitted", factInput || "Analyzed case timeline.")}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Proceed to Evidence Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: EVIDENCE REVIEW */}
        {currentStage === "EVIDENCE_REVIEW" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E2D5C1] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#21170F]">Evidence & Exhibit Board</h2>
              <p className="text-xs text-[#766B5F]">Inspect document exhibits and witness depositions.</p>
            </div>

            <EvidenceBoard evidenceList={evidenceList} />

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                Your Evidentiary Strategy & Notes
              </label>
              <textarea
                rows={3}
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Which exhibits support your claim? Are there admissibility challenges under Evidence law?"
                className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("ISSUE_IDENTIFICATION", "Evidence Reviewed", evidenceInput || "Reviewed exhibits.")}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Identify Legal Issues</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: ISSUE IDENTIFICATION */}
        {currentStage === "ISSUE_IDENTIFICATION" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E2D5C1] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#21170F]">Primary Legal Issues</h2>
              <p className="text-xs text-[#766B5F]">Formulate the essential statutory questions for the Court.</p>
            </div>

            <div className="space-y-2">
              {issuesList.map((issue, idx) => (
                <div key={idx} className="p-3.5 bg-[#A66A22]/5 border border-[#A66A22]/20 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22] shrink-0" />
                  <p className="text-xs font-semibold text-[#21170F]">{issue}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                Identify Applicable Acts & Statutory Provisions
              </label>
              <textarea
                rows={4}
                value={issueInput}
                onChange={(e) => setIssueInput(e.target.value)}
                placeholder="Specify statutory sections (e.g. Section 438 CrPC / IPC 420 / BSA 63) and legal principles..."
                className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("LEGAL_STRATEGY", "Legal Issues Formulated", issueInput || "Formulated legal issues.")}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2"
              >
                <span>Build Legal Strategy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: LEGAL STRATEGY */}
        {currentStage === "LEGAL_STRATEGY" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E2D5C1] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#21170F]">Build Your Legal Strategy</h2>
              <p className="text-xs text-[#766B5F]">Construct your primary submission, relief sought, and defenses.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                  Primary Legal Position & Main Arguments
                </label>
                <textarea
                  rows={5}
                  value={strategyInput}
                  onChange={(e) => setStrategyInput(e.target.value)}
                  placeholder="Outline your primary legal argument for the client. What evidence supports this position? What relief are you seeking?"
                  className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("PROCEEDINGS", "Legal Strategy Formulated", strategyInput)}
                disabled={isSubmitting || !strategyInput.trim()}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entering Courtroom...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Proceed to Courtroom Hearing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STAGE 6: COURTROOM PROCEEDINGS */}
        {currentStage === "PROCEEDINGS" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E2D5C1] pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#21170F]">Courtroom Proceedings</h2>
                <p className="text-xs text-[#766B5F]">Respond to judicial queries and opposing counsel objections.</p>
              </div>
              <span className="px-3 py-1 bg-[#21170F] text-[#D9B16A] text-xs font-bold rounded-lg border border-[#A66A22]/30">
                IN SESSION
              </span>
            </div>

            {/* Speaker Statement */}
            <div className="p-5 bg-[#21170F] text-[#FFFDF8] rounded-2xl border border-[#A66A22]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#D9B16A] text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>{proceedingsEvent?.speakerName || "Hon'ble Presiding Judge"}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#FFFDF8]/90 font-serif leading-relaxed italic">
                &quot;{proceedingsEvent?.statement || "Counsel, please state your statutory response to the opposition's challenge."}&quot;
              </p>
              {proceedingsEvent?.suggestedFocus && (
                <p className="text-[11px] text-[#D9B16A]/90 bg-[#A66A22]/20 p-2.5 rounded-xl border border-[#A66A22]/30">
                  Focus: {proceedingsEvent.suggestedFocus}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                Your Oral Submission to the Bench
              </label>
              <textarea
                rows={5}
                value={proceedingsInput}
                onChange={(e) => setProceedingsInput(e.target.value)}
                placeholder="My Lord, in response to the query regarding Section..."
                className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleAdvanceStage("FINAL_ARGUMENT", "Proceedings Oral Response", proceedingsInput)}
                disabled={isSubmitting || !proceedingsInput.trim()}
                className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span>Submit Oral Response</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 7: FINAL ARGUMENT */}
        {currentStage === "FINAL_ARGUMENT" && (
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-[#E2D5C1] pb-4">
              <h2 className="font-serif font-bold text-lg text-[#21170F]">Final Closing Submission</h2>
              <p className="text-xs text-[#766B5F]">Synthesize case facts, exhibits, statutory provisions, and relief.</p>
            </div>

            <div className="space-y-2">
              <label className="font-serif font-bold text-xs uppercase tracking-wider text-[#766B5F]">
                Final Submission Statement
              </label>
              <textarea
                rows={7}
                value={finalArgumentInput}
                onChange={(e) => setFinalArgumentInput(e.target.value)}
                placeholder="Summarize your complete case submission for final judgment evaluation..."
                className="w-full p-4 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl outline-none focus:ring-1 focus:ring-[#A66A22] text-[#21170F]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleFinalEvaluate}
                disabled={isSubmitting || !finalArgumentInput.trim()}
                className="px-8 py-3.5 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-sm transition-all shadow-lg flex items-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Evaluating Case & Generating Judgment...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-5 h-5" />
                    <span>Submit Case for Judicial Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
