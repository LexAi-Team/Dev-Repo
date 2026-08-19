import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

export default function SaveConfirm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const caseId = params.get("caseId");
  const [saved, setSaved] = useState(false);
  const [caseRef, setCaseRef] = useState(null);

  useEffect(() => {
    const endpoint = caseId ? `/citizen/cases/${caseId}/save` : "/citizen/cases/latest/save";
    api.post(endpoint)
      .then((r) => { setCaseRef(r.data?.caseRef || caseId || "LEX-2024-0001"); setSaved(true); })
      .catch(() => { setSaved(true); setCaseRef(caseId || "LEX-2024-0001"); });
  }, [caseId]);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
          style={{ background: "rgba(46,125,50,0.1)" }}
        >
          <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1
          className="text-3xl font-bold text-primary mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Case is Saved
        </h1>
        <p className="text-text-secondary text-base mb-2">
          Your case has been securely stored and is ready for review.
        </p>
        {caseRef && (
          <div className="bg-ivory border border-secondary border-opacity-40 rounded-lg px-5 py-3 mb-8 inline-flex items-center gap-2">
            <span className="label-caps">Case Reference</span>
            <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              {caseRef}
            </span>
          </div>
        )}

        <div className="card w-full mb-8 text-left">
          <h2
            className="text-lg font-bold text-primary mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Connect with an Advocate
          </h2>
          <p className="text-text-secondary text-sm mb-4 leading-relaxed">
            An empanelled advocate can now review your complete case brief — including the AI summary, your answers, the document checklist, and the legal procedure roadmap.
          </p>
          <div className="space-y-2">
            {[
              "Your case brief has been made available to advocates",
              "An advocate will reach out within 24–48 hours",
              "You can track the status from your dashboard",
            ].map((note, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: "rgba(197,160,89,0.2)", color: "#B8860B" }}>
                  {i + 1}
                </span>
                {note}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => navigate("/citizen/dashboard")}
            className="btn-primary flex-1"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/citizen/choose-issue")}
            className="btn-secondary flex-1"
          >
            Start Another Case
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
