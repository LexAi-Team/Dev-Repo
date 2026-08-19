import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar";
import api from "../api/axios";

const FALLBACK_QUESTIONS = {
  property: [
    "What is the nature of the property dispute? (Ownership / Possession / Tenancy)",
    "Where is the property located? (City, State)",
    "Do you have any documents proving your claim? (Title deed, agreement, receipts)",
    "When did the dispute first arise?",
    "Have you filed any police complaint or sent a legal notice?",
  ],
  family: [
    "What is the specific family matter? (Divorce / Custody / Maintenance / Succession)",
    "How long have you been married?",
    "Are there children involved? If yes, what are their ages?",
    "Have you attempted mediation or counselling?",
    "Do you have a registered marriage certificate?",
  ],
  default: [
    "Please describe the main issue in your own words.",
    "When did this problem first occur?",
    "Have you tried to resolve it through any formal or informal means?",
    "Do you have any supporting documents or evidence?",
    "What outcome are you seeking?",
  ],
};

export default function Questions() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/citizen/questions/${category}`)
      .then((r) => setQuestions(r.data?.questions || []))
      .catch(() => setQuestions(FALLBACK_QUESTIONS[category] || FALLBACK_QUESTIONS.default))
      .finally(() => setLoading(false));
  }, [category]);

  function handleNext() {
    if (!draft.trim()) return;
    const updated = { ...answers, [current]: draft.trim() };
    setAnswers(updated);
    setDraft("");

    if (current + 1 >= questions.length) {
      submitAnswers(updated);
    } else {
      setCurrent(current + 1);
    }
  }

  async function submitAnswers(finalAnswers) {
    setSaving(true);
    try {
      await api.post("/citizen/cases", { category, answers: finalAnswers });
      navigate("/citizen/processing");
    } catch {
      navigate("/citizen/processing");
    }
  }

  function handleBack() {
    if (current === 0) navigate("/citizen/choose-issue");
    else {
      setDraft(answers[current - 1] || "");
      setCurrent(current - 1);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && e.ctrlKey) handleNext();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingDots />
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <ProgressBar current={current + 1} total={questions.length} label={`${category} questionnaire`} />
        </div>

        <div className="card">
          <p className="label-caps mb-3">Question {current + 1} of {questions.length}</p>
          <h2
            className="text-2xl font-semibold text-primary mb-6 leading-snug"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {q}
          </h2>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here…"
            rows={5}
            className="w-full px-4 py-3 rounded border border-accent border-opacity-30 bg-parchment text-text-primary text-sm resize-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors placeholder-gray-400"
            autoFocus
          />
          <p className="text-xs text-text-secondary mt-1.5 opacity-60">Ctrl+Enter to continue</p>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              className="btn-secondary text-sm px-4 py-2.5"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!draft.trim() || saving}
              className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : null}
              {current + 1 >= questions.length ? "Submit" : "Next →"}
            </button>
          </div>
        </div>

        {current > 0 && (
          <div className="mt-6 space-y-2">
            <p className="label-caps">Previous answers</p>
            {Object.entries(answers).map(([idx, ans]) => (
              <div key={idx} className="text-xs text-text-secondary bg-ivory rounded px-3 py-2 border border-accent border-opacity-10">
                <span className="font-semibold text-primary mr-2">Q{Number(idx) + 1}.</span>
                {ans}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-secondary"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
