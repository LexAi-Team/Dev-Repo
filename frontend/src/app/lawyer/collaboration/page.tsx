"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, CaseItem } from "@/lib/api";
import {
  Network,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function LawyerCollaborationPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCases();
        if (res && res.status === "success") {
          setCases(res.data.cases || []);
        }
      } catch (err: unknown) {
        console.error("[Collaboration Load Error]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <PageSkeleton />;

  const teamCases = cases.filter((c) => (c.collaborators?.length || 0) > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counsel Collaboration Hub"
        subtitle="Manage team permissions, co-counsel access, and collaborative case dossiers."
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
            Collaborative Matters
          </span>
          <p className="font-serif text-3xl font-bold text-[#21170F]">{teamCases.length}</p>
          <span className="text-[11px] text-[#766B5F]">Shared Case Files</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
            Team Access Security
          </span>
          <p className="font-serif text-3xl font-bold text-emerald-800">RBAC</p>
          <span className="text-[11px] text-[#766B5F]">Role-Based Access Enforced</span>
        </div>

        <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-5 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#766B5F]">
            Data Isolation
          </span>
          <p className="font-serif text-3xl font-bold text-blue-800">Verified</p>
          <span className="text-[11px] text-[#766B5F]">Strict Backend Tenant Integrity</span>
        </div>
      </div>

      {/* Collaborative Cases List */}
      <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#21170F]">Active Team Workspaces</h2>
            <p className="text-xs text-[#766B5F]">Cases with multiple counsel and associate collaborators.</p>
          </div>
          <Link
            href="/lawyer/cases"
            className="text-xs font-bold text-[#A66A22] hover:underline"
          >
            Manage Cases
          </Link>
        </div>

        {teamCases.length === 0 ? (
          <div className="p-8 text-center bg-[#F8F4EC]/40 border border-dashed border-[#E2D5C1] rounded-2xl space-y-2">
            <Network className="w-8 h-8 text-[#766B5F]/40 mx-auto" />
            <p className="text-xs font-bold text-[#21170F]">No team cases found</p>
            <p className="text-[11px] text-[#766B5F]">
              Open any case file in Case Workspace and click <span className="font-bold">&ldquo;Team &gt; Add Collaborator&rdquo;</span> to invite co-counsel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamCases.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-[#F8F4EC]/40 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-md">
                        {c.caseNumber}
                      </span>
                      <h3 className="text-sm font-bold text-[#21170F]">{c.title}</h3>
                    </div>
                    <p className="text-xs text-[#766B5F]">{c.court}</p>
                  </div>

                  <Link
                    href={`/lawyer/cases/${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#A66A22] hover:underline"
                  >
                    <span>Open Case Team</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-[#E2D5C1]/30 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-bold text-[#21170F] text-[11px]">Counsel Team:</span>
                  {c.collaborators?.map((collab) => (
                    <span
                      key={collab.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-lg text-[11px] font-semibold text-[#21170F]"
                    >
                      <UserCheck className="w-3 h-3 text-[#A66A22]" />
                      <span>{collab.user.name}</span>
                      <span className="text-[9px] font-bold text-[#766B5F] bg-[#E2D5C1]/30 px-1.5 py-0.2 rounded">
                        {collab.role}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
