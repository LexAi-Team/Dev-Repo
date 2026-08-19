import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

const FALLBACK_STEPS = [
  {
    title: "Send a Legal Notice",
    description: "Draft and send a formal legal notice to the opposing party through a registered advocate. This is a mandatory first step in most civil matters.",
    timeframe: "Week 1",
  },
  {
    title: "File the Complaint / Plaint",
    description: "Prepare and file the complaint or plaint in the appropriate court or forum, along with the court fee and supporting documents.",
    timeframe: "Week 2–3",
  },
  {
    title: "Service of Summons",
    description: "The court issues summons to the opposing party. Ensure proper service is completed and obtain acknowledgment.",
    timeframe: "Week 3–5",
  },
  {
    title: "Filing of Written Statement",
    description: "The opposing party files a written statement. You may be required to file a replication (reply to written statement).",
    timeframe: "Week 5–8",
  },
  {
    title: "Framing of Issues",
    description: "The court identifies and frames the issues in dispute based on pleadings. This sets the scope of the trial.",
    timeframe: "Month 2–3",
  },
  {
    title: "Evidence & Hearing",
    description: "Both parties present evidence, examine witnesses, and argue their cases. This may span multiple hearing dates.",
    timeframe: "Month 3–12",
  },
  {
    title: "Final Arguments",
    description: "Advocates present final arguments summarising the evidence and legal precedents in their favour.",
    timeframe: "Month 12–18",
  },
  {
    title: "Judgment & Decree",
    description: "The court delivers its judgment. If in your favour, a decree is passed. The opposing party has a right to appeal.",
    timeframe: "Month 18–24",
  },
];

export default function Procedure() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const caseId = params.get("caseId");
  const [steps, setSteps] = useState(FALLBACK_STEPS);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const endpoint = caseId ? `/citizen/cases/${caseId}/procedure` : "/citizen/cases/latest/procedure";
    api.get(endpoint)
      .then((r) => { if (r.data?.steps?.length) setSteps(r.data.steps); })
      .catch(() => {});
  }, [caseId]);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="label-caps mb-1">Step 4 of 4</p>
          <h1 className="page-title mb-2">Legal Procedure Roadmap</h1>
          <p className="text-text-secondary">
            A step-by-step guide to navigating the legal process for your case.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-6 bottom-6 w-0.5"
            style={{ background: "linear-gradient(180deg, #C5A059 0%, rgba(197,160,89,0.1) 100%)" }}
          />

          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative flex gap-5 cursor-pointer group"
                onClick={() => setActive(active === i ? null : i)}
              >
                {/* Step circle */}
                <div
                  className="relative z-10 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: active === i ? "#5C3A21" : "linear-gradient(135deg, #C5A059 0%, #B8860B 100%)",
                    color: active === i ? "#C5A059" : "#5C3A21",
                    boxShadow: active === i ? "0 0 0 3px rgba(197,160,89,0.3)" : "none",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {i + 1}
                </div>

                <div
                  className="flex-1 bg-ivory rounded-lg border border-accent border-opacity-20 px-5 py-4 transition-all duration-200 group-hover:border-secondary group-hover:border-opacity-50 group-hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-bold text-primary text-base"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {step.title}
                    </h3>
                    <span className="label-caps flex-shrink-0 text-secondary">{step.timeframe}</span>
                  </div>

                  {active === i && (
                    <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                      {step.description}
                    </p>
                  )}

                  {active !== i && (
                    <p className="text-xs text-text-secondary mt-1 opacity-60">
                      Click to expand
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Back
          </button>
          <button
            onClick={() => navigate(`/citizen/save-confirm${caseId ? `?caseId=${caseId}` : ""}`)}
            className="btn-primary flex-1"
          >
            Save & Connect with Advocate →
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
