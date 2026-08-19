import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import api from "../api/axios";

export default function AdvocateCaseDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("summary");

  useEffect(() => {
    api.get(`/advocate/cases/${caseId}`)
      .then((r) => setCaseData(r.data?.case || r.data))
      .catch(() => setCaseData(MOCK_CASE))
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-secondary opacity-50 text-sm">Loading case…</div>
      </div>
    );
  }

  const c = caseData;

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate("/advocate/dashboard")}
          className="text-text-secondary text-sm hover:text-primary mb-6 flex items-center gap-1 transition-colors"
        >
          ← Dashboard
        </button>

        <div
          className="rounded-xl overflow-hidden shadow-courtroom mb-6"
          style={{ border: "1px solid rgba(184,134,11,0.25)" }}
        >
          <div
            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: "linear-gradient(135deg, #5C3A21 0%, #7A4E2D 100%)" }}
          >
            <div>
              <p className="text-secondary text-opacity-70 text-xs tracking-widest uppercase mb-1">Case Brief</p>
              <h1
                className="text-2xl font-bold text-secondary"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {c?.citizenName || "Citizen"} — {c?.category || "Legal Matter"}
              </h1>
              <p className="text-secondary opacity-60 text-sm mt-0.5">
                Filed {c?.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Recently"}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={c?.status || "pending"} />
              <button
                onClick={() => navigate(`/advocate/assistant/${caseId}`)}
                className="bg-secondary text-primary text-xs font-bold px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                AI Assistant
              </button>
            </div>
          </div>

          <div className="flex border-b border-accent border-opacity-20 bg-ivory">
            {["summary", "answers", "checklists"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors duration-150 ${
                  tab === t ? "text-primary border-b-2 border-secondary" : "text-text-secondary hover:text-primary"
                }`}
              >
                {t === "checklists" ? "Documents" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6 bg-ivory">
            {tab === "summary" && (
              <div>
                <p className="label-caps mb-3">AI-Generated Summary</p>
                <div
                  className="text-sm text-text-primary leading-relaxed border-l-4 pl-5 py-1 whitespace-pre-wrap"
                  style={{ borderColor: "#C5A059", fontFamily: "'Source Serif 4', serif" }}
                >
                  {c?.aiSummary || "The AI summary will appear here once the case has been processed."}
                </div>
              </div>
            )}

            {tab === "answers" && (
              <div className="space-y-4">
                <p className="label-caps mb-3">Citizen Responses</p>
                {c?.answers && Object.keys(c.answers).length > 0 ? (
                  Object.entries(c.answers).map(([i, ans]) => (
                    <div key={i} className="bg-parchment rounded px-4 py-3 border border-accent border-opacity-15">
                      <p className="label-caps mb-1">Answer {Number(i) + 1}</p>
                      <p className="text-sm text-text-primary">{ans}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary">No responses recorded.</p>
                )}
              </div>
            )}

            {tab === "checklists" && (
              <div>
                <p className="label-caps mb-4">Required Documents</p>
                {c?.checklists?.documents?.length ? (
                  <div className="space-y-2">
                    {c.checklists.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <span className="w-5 h-5 rounded border border-accent border-opacity-40 flex items-center justify-center text-xs text-secondary">
                          {i + 1}
                        </span>
                        <span className="text-text-primary">{doc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No checklist generated yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/advocate/documents/${caseId}`)}
            className="btn-secondary text-sm"
          >
            View Documents
          </button>
          <button
            onClick={() => navigate(`/advocate/assistant/${caseId}`)}
            className="btn-primary text-sm"
          >
            Open AI Assistant →
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

const MOCK_CASE = {
  _id: "demo-1",
  citizenName: "Priya Sharma",
  category: "Property Dispute",
  status: "active",
  createdAt: "2024-11-10T09:00:00Z",
  aiSummary: "The citizen reports a property ownership dispute regarding a residential plot in Pune. The opposing party is allegedly occupying the property without valid title. The citizen possesses the original sale deed dated 2018 and property tax receipts up to 2024. A legal notice was sent in October 2024 with no response. The matter appears suitable for civil court proceedings under CPC Order VII.",
  answers: {
    0: "The dispute is regarding ownership and possession of a residential plot.",
    1: "The property is located in Baner, Pune, Maharashtra.",
    2: "I have the original sale deed, property tax receipts, and electricity bills.",
    3: "The dispute arose in August 2024 when the opposing party began construction.",
    4: "A legal notice was sent via registered post on 15 October 2024. No response received.",
  },
};
