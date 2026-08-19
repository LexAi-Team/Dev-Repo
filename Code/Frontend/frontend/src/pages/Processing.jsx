import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  "Reviewing your responses…",
  "Analysing applicable laws and precedents…",
  "Organising your case information…",
  "Generating AI summary…",
  "Preparing document checklists…",
  "Mapping the legal procedure…",
];

export default function Processing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= STEPS.length) {
          clearInterval(interval);
          setTimeout(() => navigate("/citizen/summary"), 800);
          return s + 1;
        }
        return s + 1;
      });
    }, 1100);
    return () => clearInterval(interval);
  }, [navigate]);

  const pct = Math.min(100, Math.round(((step) / STEPS.length) * 100));

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="relative flex items-center justify-center mb-10">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "rgba(197,160,89,0.12)" }}
          >
            <GavelAnimated />
          </div>
          <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#B8860B" strokeOpacity="0.15" strokeWidth="4" />
            <circle
              cx="48" cy="48" r="44"
              fill="none"
              stroke="#C5A059"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
          </svg>
        </div>

        <h2
          className="text-2xl font-bold text-primary mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Building Your Case
        </h2>

        <div className="h-6 mb-8">
          <p
            className="text-text-secondary text-sm transition-all duration-500"
            key={step}
            style={{ animation: "fadeInUp 0.4s ease-out" }}
          >
            {STEPS[Math.min(step, STEPS.length - 1)]}
          </p>
        </div>

        <div className="w-full bg-primary bg-opacity-10 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, #B8860B 0%, #C5A059 100%)",
            }}
          />
        </div>
        <p className="text-xs text-secondary mt-2 font-semibold">{pct}%</p>

        <div className="mt-10 space-y-2">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm"
              style={{ opacity: i <= step ? 1 : 0.25, transition: "opacity 0.4s" }}
            >
              <span
                className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: i < step ? "#2E7D32" : i === step ? "#C5A059" : "transparent",
                  border: `1px solid ${i < step ? "#2E7D32" : i === step ? "#C5A059" : "#B8860B"}`,
                  color: i <= step ? "white" : "#B8860B",
                }}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span className={i < step ? "text-success" : i === step ? "text-primary font-medium" : "text-text-secondary"}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function GavelAnimated() {
  return (
    <svg
      className="w-10 h-10 text-secondary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      style={{ animation: "gavelSwing 1.8s ease-in-out infinite" }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21l9-9m0 0l3-3m-3 3l-3-3m3 3l3 3M9 3l3 3-3 3-3-3 3-3zm6 6l3 3-3 3-3-3 3-3z" />
      <style>{`
        @keyframes gavelSwing {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
      `}</style>
    </svg>
  );
}
