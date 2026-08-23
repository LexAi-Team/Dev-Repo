"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PerformanceRadar from "@/components/simulator/performance-radar";
import SimulatedJudgment from "@/components/simulator/simulated-judgment";
import { api, SimulationSessionData, SimulationEvaluationData } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  PlusCircle,
  History,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import EvaluationLoading from "@/components/simulator/evaluation-loading";

export default function SimulatorResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const router = useRouter();

  const [session, setSession] = useState<SimulationSessionData | null>(null);
  const [evaluation, setEvaluation] = useState<SimulationEvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchResult() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.getSimulatorSession(sessionId);
        if (isMounted && res.status === "success" && res.data?.session) {
          const s = res.data.session;
          setSession(s);

          if (s.evaluation) {
            setEvaluation(s.evaluation);
          } else {
            // Generate evaluation if missing
            const evalRes = await api.evaluateSimulatorSession(sessionId);
            if (isMounted && evalRes.status === "success" && evalRes.data?.evaluation) {
              setEvaluation(evalRes.data.evaluation);
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorObj = err as { message?: string };
          setError(errorObj.message || "Evaluation service temporarily unavailable. Your simulation responses are safely stored.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsRetrying(false);
        }
      }
    }
    fetchResult();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleRetryEvaluation = async () => {
    try {
      setIsRetrying(true);
      setError(null);
      const evalRes = await api.evaluateSimulatorSession(sessionId);
      if (evalRes.status === "success" && evalRes.data?.evaluation) {
        setEvaluation(evalRes.data.evaluation);
        setError(null);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setError(errorObj.message || "LexAI evaluation service temporarily unavailable. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading || isRetrying) {
    return <EvaluationLoading />;
  }

  if (!session || !evaluation) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl text-center space-y-5 max-w-xl mx-auto my-12 shadow-sm">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-xl text-[#21170F]">Evaluation Temporarily Unavailable</h2>
          <p className="text-xs text-[#766B5F] max-w-md mx-auto">
            {error || "The LexAI evaluation engine could not complete evaluation. Your simulation responses are saved."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetryEvaluation}
            disabled={isRetrying}
            className="px-5 py-2.5 bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Retry Evaluation</span>
              </>
            )}
          </button>
          <button
            onClick={() => router.push("/student/simulator")}
            className="px-5 py-2.5 bg-[#FFFDF8] border border-[#E2D5C1] text-[#21170F] hover:bg-[#F8F4EC] rounded-xl text-xs font-semibold"
          >
            Back to Case Selection
          </button>
        </div>
      </div>
    );
  }

  const scenario = session.caseScenario;
  const strengthsList: string[] = JSON.parse(evaluation.strengths || "[]");
  const weaknessesList: string[] = JSON.parse(evaluation.weaknesses || "[]");
  const missedIssuesList: string[] = JSON.parse(evaluation.missedIssues || "[]");
  const recommendationsList: string[] = JSON.parse(evaluation.recommendations || "[]");

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Top Header Card */}
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#A66A22]/10 text-[#A66A22] text-[10px] font-bold uppercase tracking-wider">
                {scenario.practiceArea}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#21170F]/10 text-[#21170F] text-[10px] font-bold uppercase tracking-wider">
                {scenario.difficulty}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#21170F]">{scenario.title}</h1>
            <p className="text-xs text-[#766B5F]">
              Case Simulation Completed • Evaluation report generated by LEXAI Judicial Analysis Engine.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/student/simulator")}
              className="px-4 py-2.5 rounded-xl border border-[#E2D5C1] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-xs font-semibold text-[#21170F] flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#A66A22]" />
              <span>New Case</span>
            </button>
            <button
              onClick={() => router.push("/student/practice")}
              className="px-4 py-2.5 rounded-xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <History className="w-4 h-4" />
              <span>Practice History</span>
            </button>
          </div>
        </div>

        {/* 1. Performance Radar & Bar Score Breakdown */}
        <PerformanceRadar
          scores={{
            legalReasoningScore: evaluation.legalReasoningScore,
            issueIdentificationScore: evaluation.issueIdentificationScore,
            evidenceHandlingScore: evaluation.evidenceHandlingScore,
            argumentationScore: evaluation.argumentationScore,
            proceduralAwarenessScore: evaluation.proceduralAwarenessScore,
            counterargumentHandlingScore: evaluation.counterargumentHandlingScore,
            strategyScore: evaluation.strategyScore,
            overallScore: evaluation.overallScore,
          }}
        />

        {/* 2. Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2D5C1] pb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-serif font-bold text-sm text-[#21170F]">Demonstrated Strengths</h3>
            </div>
            <ul className="space-y-2">
              {strengthsList.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#21170F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-[#E2D5C1] pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-serif font-bold text-sm text-[#21170F]">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {weaknessesList.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-[#21170F]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Missed Issues & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Missed Issues */}
          {missedIssuesList.length > 0 && (
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#E2D5C1] pb-3">
                <BookOpen className="w-5 h-5 text-[#A66A22] shrink-0" />
                <h3 className="font-serif font-bold text-sm text-[#21170F]">Missed Legal Issues</h3>
              </div>
              <ul className="space-y-2">
                {missedIssuesList.map((miss, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#766B5F]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A66A22] mt-1.5 shrink-0" />
                    <span>{miss}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendationsList.length > 0 && (
            <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-2xl p-5 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-[#E2D5C1] pb-3">
                <Lightbulb className="w-5 h-5 text-[#A66A22] shrink-0" />
                <h3 className="font-serif font-bold text-sm text-[#21170F]">Key Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {recommendationsList.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#21170F]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A66A22] mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 4. Simulated Judicial Outcome */}
        <SimulatedJudgment judgmentText={evaluation.simulatedJudgment} />

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.push("/student/simulator")}
            className="px-6 py-3 rounded-2xl bg-[#FFFDF8] border border-[#E2D5C1] hover:bg-[#F8F4EC] font-semibold text-xs text-[#21170F] transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-[#A66A22]" />
            <span>Try Another Case</span>
          </button>
          <button
            onClick={() => router.push("/student/practice")}
            className="px-6 py-3 rounded-2xl bg-[#A66A22] text-[#FFFDF8] hover:bg-[#8C571B] font-semibold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            <span>Go to Practice History</span>
          </button>
        </div>
      </div>
  );
}
