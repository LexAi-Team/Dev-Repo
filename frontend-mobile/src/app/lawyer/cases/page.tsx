"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api, CaseItem } from "@/lib/api";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  ChevronRight,
  XCircle,
  X,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function LawyerCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newType, setNewType] = useState("CIVIL");
  const [newCourt, setNewCourt] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newOpposing, setNewOpposing] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      const res = await api.getCases();
      if (res && res.status === "success") {
        setCases(res.data.cases || []);
      } else {
        setError("Failed to load case files.");
      }
    } catch (err: unknown) {
      console.error("[Load Cases Error]:", err);
      setError("Unable to connect to the backend server. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.createCase({
        title: newTitle,
        caseNumber: newNumber,
        caseType: newType,
        court: newCourt,
        clientName: newClient,
        opposingParty: newOpposing,
      });
      if (res && res.status === "success") {
        setShowModal(false);
        setNewTitle("");
        setNewNumber("");
        setNewCourt("");
        setNewClient("");
        setNewOpposing("");
        fetchCases();
      }
    } catch (err: unknown) {
      console.error("[Create Case Error]:", err);
      alert("Failed to create case file. Make sure the case number is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="p-8 bg-[#FFFDF8] border border-rose-100 rounded-3xl text-center space-y-4 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider">
          Case Workspace Load Failed
        </h3>
        <p className="text-xs text-[#766B5F] leading-relaxed">{error}</p>
      </div>
    );
  }

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header with Create Case Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Case Workspace"
          subtitle="Manage active dossiers, court filings, client representation, and team collaborators."
        />

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-bold text-xs shadow-xs transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Case</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80 flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#766B5F]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, case number, or client..."
            className="w-full h-10 pl-10 pr-4 text-xs font-semibold text-[#21170F] bg-[#F8F4EC]/50 border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#766B5F]">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
          >
            <option value="ALL">All Statuses ({cases.length})</option>
            <option value="ACTIVE">Active Matters</option>
            <option value="PENDING">Pending Review</option>
            <option value="DISPOSED">Disposed Cases</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Case List Grid */}
      {filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF8] border border-dashed border-[#E2D5C1] rounded-3xl space-y-4 shadow-xs">
          <Briefcase className="w-12 h-12 text-[#A66A22]/40 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#21170F]">No case files found</h3>
            <p className="text-xs text-[#766B5F]">
              {searchQuery || statusFilter !== "ALL"
                ? "No case files match your search criteria. Try resetting your search filters."
                : "Start organizing your advocate practice by creating your first client case file."}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-[#A66A22] text-[#FFFDF8] rounded-xl text-xs font-bold shadow-xs"
          >
            + Create New Case
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c) => (
            <Link
              key={c.id}
              href={`/lawyer/cases/detail?id=${encodeURIComponent(c.id)}`}
              className="bg-[#FFFDF8] border border-[#E2D5C1] hover:border-[#A66A22] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2.5 py-1 rounded-md border border-[#A66A22]/20">
                    {c.caseNumber}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-[#F8F4EC] text-[#766B5F] border-[#E2D5C1]"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-[#21170F] group-hover:text-[#A66A22] transition-colors leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#766B5F] mt-1 font-medium">{c.court}</p>
                </div>

                <div className="bg-[#F8F4EC]/60 p-3 rounded-2xl border border-[#E2D5C1]/30 space-y-1 text-xs text-[#766B5F]">
                  <p>
                    <span className="font-bold text-[#21170F]">Client:</span> {c.clientName}
                  </p>
                  <p>
                    <span className="font-bold text-[#21170F]">Opposing:</span> {c.opposingParty}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2D5C1]/40 flex items-center justify-between text-xs text-[#766B5F]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-[#A66A22]" />
                    {c.collaborators?.length || 1} team
                  </span>
                  {c.nextHearingAt && (
                    <span className="flex items-center gap-1 font-semibold text-blue-700">
                      <Calendar className="w-3.5 h-3.5" />
                      Hearing
                    </span>
                  )}
                </div>

                <span className="font-bold text-[#A66A22] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Dossier
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CREATE CASE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#21170F]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#21170F]">Create Case File</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#766B5F] hover:text-[#21170F] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Case Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g. WP/2026/804"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Case Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  >
                    <option value="CRIMINAL">Criminal</option>
                    <option value="CIVIL">Civil</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="CONSTITUTIONAL">Constitutional</option>
                    <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
                    <option value="FAMILY">Family</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Case Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Anand v. Union of India"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                  Court / Jurisdiction
                </label>
                <input
                  type="text"
                  required
                  value={newCourt}
                  onChange={(e) => setNewCourt(e.target.value)}
                  placeholder="e.g. High Court of Judicature at Madras"
                  className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Petitioner / Client
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="Client Name"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#21170F]">
                    Respondent / Opposing Party
                  </label>
                  <input
                    type="text"
                    required
                    value={newOpposing}
                    onChange={(e) => setNewOpposing(e.target.value)}
                    placeholder="Opposing Party Name"
                    className="w-full h-10 px-3 text-xs bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:border-[#A66A22]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2D5C1]/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E2D5C1] text-xs font-bold text-[#766B5F] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#A66A22] text-[#FFFDF8] text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
