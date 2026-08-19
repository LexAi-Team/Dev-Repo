import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import api from "../api/axios";

export default function AdvocateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/advocate/cases")
      .then((r) => setCases(r.data?.cases || []))
      .catch(() => setCases(MOCK_CASES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);
  const counts = { all: cases.length, active: cases.filter((c) => c.status === "active").length, pending: cases.filter((c) => c.status === "pending").length };

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="label-caps mb-1">Advocate Portal</p>
          <h1 className="page-title mb-1">
            {user?.name ? `Adv. ${user.name}` : "Case Dashboard"}
          </h1>
          <p className="text-text-secondary">Manage and review assigned citizen cases.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Cases", value: counts.all, color: "#5C3A21" },
            { label: "Active", value: counts.active, color: "#2E7D32" },
            { label: "Pending Review", value: counts.pending, color: "#ED6C02" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <p className="text-3xl font-bold mb-1" style={{ color: stat.color, fontFamily: "'Playfair Display', serif" }}>
                {stat.value}
              </p>
              <p className="label-caps">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold text-primary"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Assigned Cases
          </h2>
          <div className="flex gap-1 bg-ivory rounded-lg border border-accent border-opacity-20 p-1">
            {["all", "active", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors duration-150 ${
                  filter === f ? "bg-primary text-secondary" : "text-text-secondary hover:text-primary"
                }`}
              >
                {f} {f === "all" ? `(${counts.all})` : ""}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-secondary opacity-50 text-sm">Loading cases…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No cases in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => (
              <div
                key={c._id}
                className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-courtroom transition-all duration-150 hover:border-secondary hover:border-opacity-40"
                onClick={() => navigate(`/advocate/case/${c._id}`)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-secondary"
                    style={{ background: "#5C3A21" }}
                  >
                    {(c.citizenName || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {c.citizenName || "Citizen"}
                    </p>
                    <p className="text-sm text-text-secondary">{c.category || "Legal Matter"}</p>
                    <p className="text-xs text-text-secondary opacity-60 mt-0.5">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:flex-shrink-0">
                  <StatusBadge status={c.status || "pending"} />
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/advocate/documents/${c._id}`); }}
                      className="text-xs text-secondary border border-secondary border-opacity-40 rounded px-2 py-1 hover:bg-secondary hover:text-primary transition-colors duration-150"
                    >
                      Docs
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/advocate/assistant/${c._id}`); }}
                      className="text-xs bg-primary text-secondary rounded px-2 py-1 hover:bg-opacity-80 transition-colors duration-150"
                    >
                      AI
                    </button>
                  </div>
                  <span className="text-secondary hidden sm:block">›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

const MOCK_CASES = [
  { _id: "demo-1", citizenName: "Priya Sharma", category: "Property Dispute", status: "active", createdAt: "2024-11-10T09:00:00Z" },
  { _id: "demo-2", citizenName: "Rahul Mehta", category: "Consumer Rights", status: "pending", createdAt: "2024-11-14T11:30:00Z" },
  { _id: "demo-3", citizenName: "Anita Verma", category: "Family Law", status: "review", createdAt: "2024-11-18T14:00:00Z" },
];
