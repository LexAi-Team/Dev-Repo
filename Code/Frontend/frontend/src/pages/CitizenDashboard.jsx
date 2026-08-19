import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import api from "../api/axios";

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/citizen/cases")
      .then((r) => setCases(r.data?.cases || []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="label-caps mb-1">Welcome back</p>
          <h1 className="page-title mb-3">
            {user?.name ? `Good day, ${user.name.split(" ")[0]}` : "Your Legal Dashboard"}
          </h1>
          <p className="text-text-secondary text-base">
            Track your cases, review documents, and get guided legal assistance.
          </p>
        </div>

        <div
          className="rounded-xl p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #5C3A21 0%, #7A4E2D 100%)" }}
        >
          <div>
            <h2
              className="text-2xl font-bold text-secondary mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Start Your Legal Journey
            </h2>
            <p className="text-secondary opacity-75 text-sm max-w-sm">
              Answer a few guided questions and LEX AI will organise your case, identify required documents, and map the legal procedure.
            </p>
          </div>
          <button
            onClick={() => navigate("/citizen/choose-issue")}
            className="flex-shrink-0 bg-secondary text-primary font-bold px-8 py-3.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.03em" }}
          >
            New Case →
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-xl font-bold text-primary"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Cases
            </h2>
            <span className="label-caps">{cases.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <SpinningGavel />
            </div>
          ) : cases.length === 0 ? (
            <div className="card text-center py-14">
              <ScalesIcon className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary">No cases yet. Start your first one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/citizen/summary?caseId=${c._id}`)}
                  className="card flex items-center justify-between cursor-pointer hover:shadow-courtroom transition-all duration-150 hover:border-secondary hover:border-opacity-40"
                >
                  <div>
                    <p className="font-semibold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {c.category || "Legal Matter"}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={c.status || "draft"} />
                    <span className="text-secondary">›</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SpinningGavel() {
  return (
    <div className="flex flex-col items-center gap-3 text-secondary opacity-60">
      <svg className="w-10 h-10 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
      </svg>
      <span className="text-sm">Loading…</span>
    </div>
  );
}

function ScalesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}
