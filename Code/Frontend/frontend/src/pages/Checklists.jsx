import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

const FALLBACK = {
  documents: [
    "Government-issued photo ID (Aadhaar / Passport / Voter ID)",
    "Address proof (utility bill or bank statement not older than 3 months)",
    "Relevant agreement or contract (if applicable)",
    "Property documents or title deed (if applicable)",
    "Previous correspondence or legal notices",
  ],
  evidence: [
    "Photographs or video recordings of the incident",
    "Witness names and contact information",
    "Bank statements or financial records",
    "Screenshots of digital communications (WhatsApp, email)",
    "Medical reports (if injury is involved)",
  ],
};

export default function Checklists() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const caseId = params.get("caseId");
  const [data, setData] = useState(FALLBACK);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const endpoint = caseId ? `/citizen/cases/${caseId}/checklists` : "/citizen/cases/latest/checklists";
    api.get(endpoint)
      .then((r) => {
        if (r.data?.documents || r.data?.evidence) setData(r.data);
      })
      .catch(() => {});
  }, [caseId]);

  function toggle(section, idx) {
    const key = `${section}-${idx}`;
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }

  const allCount = (data.documents?.length || 0) + (data.evidence?.length || 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="label-caps mb-1">Step 3 of 4</p>
          <h1 className="page-title mb-2">Documents & Evidence</h1>
          <p className="text-text-secondary">
            Gather these items before meeting your advocate. Check off what you already have.
          </p>
        </div>

        <div className="bg-ivory rounded-lg border border-secondary border-opacity-30 px-5 py-3 mb-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary"
            style={{ background: "rgba(197,160,89,0.2)" }}
          >
            {checkedCount}/{allCount}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              {checkedCount === allCount && allCount > 0 ? "All items collected!" : `${allCount - checkedCount} items remaining`}
            </p>
            <p className="text-xs text-text-secondary">Tick each item as you collect it</p>
          </div>
        </div>

        <ChecklistSection
          title="Required Documents"
          icon="📄"
          items={data.documents || []}
          section="documents"
          checked={checked}
          onToggle={toggle}
        />

        <ChecklistSection
          title="Evidence to Gather"
          icon="🔍"
          items={data.evidence || []}
          section="evidence"
          checked={checked}
          onToggle={toggle}
        />

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button onClick={() => navigate(-1)} className="btn-secondary">
            ← Back
          </button>
          <button
            onClick={() => navigate(`/citizen/procedure${caseId ? `?caseId=${caseId}` : ""}`)}
            className="btn-primary flex-1"
          >
            View Legal Procedure →
          </button>
          <button
            onClick={() => navigate(`/citizen/save-confirm${caseId ? `?caseId=${caseId}` : ""}`)}
            className="btn-primary"
          >
            Save & Connect →
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ChecklistSection({ title, icon, items, section, checked, onToggle }) {
  return (
    <div className="card mb-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">{icon}</span>
        <h2
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h2>
        <span className="ml-auto label-caps">
          {items.filter((_, i) => checked[`${section}-${i}`]).length}/{items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const key = `${section}-${idx}`;
          const done = !!checked[key];
          return (
            <label
              key={idx}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => onToggle(section, idx)}
            >
              <div
                className="w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all duration-150"
                style={{
                  borderColor: done ? "#C5A059" : "#B8860B",
                  background: done ? "#C5A059" : "transparent",
                }}
              >
                {done && (
                  <svg className="w-3 h-3 text-primary" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm leading-relaxed transition-colors duration-150 ${
                  done ? "line-through text-text-secondary opacity-60" : "text-text-primary group-hover:text-primary"
                }`}
              >
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
