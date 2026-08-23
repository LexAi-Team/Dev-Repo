/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, CaseItem } from "@/lib/api";
import {
  Network,
  ChevronRight,
  UserCheck,
  CheckSquare,
  Clock,
  FileText,
  Sparkles,
  Activity
} from "lucide-react";
import PageHeader from "@/components/app/page-header";
import { PageSkeleton } from "@/components/dashboard/loading-skeleton";

export default function LawyerCollaborationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getLawyerCollaboration();
        if (res && res.status === "success") {
          setData(res.data);
        }
      } catch (err: unknown) {
        console.error("[Collaboration Dashboard Error]:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <PageSkeleton />;

  const cases = data?.cases || [];
  const teamCases = cases.filter((c: CaseItem) => (c.collaborators?.length || 0) > 0);
  const myTasks = data?.myTasks || [];
  const teamTasks = data?.teamTasks || [];
  const recentDocuments = data?.recentDocuments || [];
  const recentResearch = data?.recentResearch || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Counsel Collaboration Hub"
        subtitle="Manage team permissions, view assigned tasks, and monitor recent shared activity."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Cases & My Work */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* My Work */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <span>My Pending Tasks</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                {myTasks.length} Assigned
              </span>
            </div>
            {myTasks.length === 0 ? (
              <p className="text-xs text-[#766B5F] p-4 text-center bg-[#F8F4EC]/40 rounded-xl">
                You have no assigned tasks pending.
              </p>
            ) : (
              <div className="space-y-3">
                {myTasks.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="p-3 bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-xl flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-[#21170F]">{t.title}</p>
                      <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(t.caseId)}`} className="text-[10px] text-[#A66A22] hover:underline">
                        {t.case?.title} ({t.case?.caseNumber})
                      </Link>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                        {t.priority}
                      </span>
                      {t.dueAt && <p className="text-[10px] text-[#766B5F] mt-1">Due: {new Date(t.dueAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collaborative Cases List */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <Network className="w-4 h-4 text-[#A66A22]" />
                <span>Active Team Workspaces</span>
              </span>
              <span className="text-xs font-bold text-[#766B5F]">{teamCases.length} Cases</span>
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
                {teamCases.map((c: any) => (
                  <div key={c.id} className="p-4 bg-[#F8F4EC]/40 hover:bg-[#F8F4EC] border border-[#E2D5C1]/40 rounded-2xl transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-md">
                            {c.caseNumber}
                          </span>
                          <h3 className="text-sm font-bold text-[#21170F]">{c.title}</h3>
                        </div>
                      </div>
                      <Link href={`/lawyer/cases/detail?id=${encodeURIComponent(c.id)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#A66A22] hover:underline">
                        <span>Case Workspace</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-[#E2D5C1]/30 flex flex-wrap items-center gap-2 text-xs">
                      {c.collaborators?.map((collab: any) => (
                        <span key={collab.id} className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFFDF8] border border-[#E2D5C1] rounded-lg text-[10px] font-semibold text-[#21170F]">
                          <UserCheck className="w-3 h-3 text-[#A66A22]" />
                          <span>{collab.user.name}</span>
                          <span className="text-[9px] font-bold text-[#766B5F] bg-[#E2D5C1]/30 px-1.5 py-0.5 rounded">
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
          
          {/* Team Tasks */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
             <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>All Team Tasks</span>
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                {teamTasks.length} Pending
              </span>
            </div>
            {teamTasks.length === 0 ? (
              <p className="text-xs text-[#766B5F] p-4 text-center bg-[#F8F4EC]/40 rounded-xl">No active tasks across teams.</p>
            ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-[#E2D5C1]/40">
                       <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Task</th>
                       <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Assigned To</th>
                       <th className="py-2 text-[10px] font-bold uppercase text-[#766B5F]">Due Date</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs font-semibold text-[#21170F]">
                     {teamTasks.slice(0, 8).map((t: any) => (
                       <tr key={t.id} className="border-b border-[#E2D5C1]/20">
                         <td className="py-2 pr-4 text-[11px]">
                           {t.title}
                           <span className="block text-[9px] text-[#A66A22]">{t.case?.title}</span>
                         </td>
                         <td className="py-2 text-[11px] text-[#766B5F]">
                           {t.assignedTo ? t.assignedTo.name : "Unassigned"}
                         </td>
                         <td className="py-2 text-[10px]">
                           {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "-"}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            )}
          </div>
        </div>
        
        {/* RIGHT COLUMN: Recent Activity, Documents, Research */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
             <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-700" />
                <span>Recent Team Activity</span>
              </span>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-[10px] text-[#766B5F]">No recent activity found.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act: any) => (
                  <div key={act.id} className="text-xs space-y-0.5 border-l-2 border-amber-200 pl-3">
                    <p className="font-bold text-[#21170F]">{act.title}</p>
                    <p className="text-[10px] text-[#766B5F]">{act.createdBy?.name || "System"} • {new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#766B5F]" />
                <span>Recent Documents</span>
              </span>
            </div>
            {recentDocuments.length === 0 ? (
               <p className="text-[10px] text-[#766B5F]">No shared documents.</p>
            ) : (
               <div className="space-y-2">
                 {recentDocuments.map((doc: any) => (
                   <div key={doc.id} className="p-2 bg-[#F8F4EC] rounded-lg text-xs flex justify-between items-center">
                     <div>
                       <p className="font-semibold text-[#21170F] truncate max-w-[150px]">{doc.name}</p>
                       <p className="text-[9px] text-[#A66A22]">{doc.case?.caseNumber}</p>
                     </div>
                     <span className="text-[9px] text-[#766B5F]">{new Date(doc.createdAt).toLocaleDateString()}</span>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Recent Research */}
          <div className="bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2D5C1]/40 pb-3">
              <span className="font-serif font-bold text-base text-[#21170F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A66A22]" />
                <span>Shared Case Research</span>
              </span>
            </div>
            {recentResearch.length === 0 ? (
               <p className="text-[10px] text-[#766B5F]">No shared research.</p>
            ) : (
               <div className="space-y-2">
                 {recentResearch.map((res: any) => (
                   <div key={res.id} className="p-2 bg-[#F8F4EC] rounded-lg text-xs flex justify-between items-center">
                     <div>
                       <p className="font-semibold text-[#21170F] truncate max-w-[150px]">{res.query}</p>
                       <p className="text-[9px] text-[#A66A22]">{res.case?.caseNumber}</p>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
