"use client";

import { useAuth } from "@/lib/firebase/provider";
import {
  Users,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Activity,
  CheckCircle,
} from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import DashboardSection from "@/components/dashboard/dashboard-section";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] || "Admin";

  // Mock Platform Metrics (separated on UI layer)
  const systemStats = [
    { title: "Total Users", value: 1420, icon: Users, change: { value: "+42 this week", positive: true } },
    { title: "Law Students", value: 980, icon: GraduationCap, change: { value: "+28 this week", positive: true } },
    { title: "Advocates", value: 440, icon: ShieldCheck, change: { value: "+14 this week", positive: true } },
    { title: "Active Cases", value: 125, icon: Briefcase, change: { value: "+8 this week", positive: true } },
  ];

  // Mock recent registrations
  const recentRegistrations = [
    { name: "Adv. Raghav Sharma", email: "raghav.sharma@delhibar.org", role: "LAWYER", status: "Verified" },
    { name: "Kunal Sen", email: "kunal.sen@nls.ac.in", role: "STUDENT", status: "Active" },
    { name: "Adv. Priya Patel", email: "priya.patel@mhbar.gov", role: "LAWYER", status: "Pending Audit" },
    { name: "Sneha Nair", email: "sneha.nair@ils.edu", role: "STUDENT", status: "Active" },
  ];

  // Mock platform log entries
  const platformActivityLogs = [
    { desc: "Prisma client successfully resolved Neon Postgres schema", time: "5m ago", type: "DB_SYNC" },
    { desc: "Firebase token verification middleware sync completed", time: "12m ago", type: "AUTH" },
    { desc: "Advocate license validation API successfully queried Bar Council", time: "30m ago", type: "API" },
    { desc: "Platform database query pool optimization applied", time: "1h ago", type: "SYSTEM" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          System Administration, {firstName}
        </h1>
        <p className="text-xs sm:text-sm text-[#766B5F] font-semibold leading-relaxed">
          Manage system parameters, verify lawyer bar registrations, and view ecosystem audit logs.
        </p>
      </div>

      {/* SECTION A — platform statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Recent registrations & activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Registrations Panel */}
          <DashboardSection title="Ecosystem Registrations">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-[#766B5F] tracking-wider uppercase border-collapse">
                <thead>
                  <tr className="border-b border-[#E2D5C1]/40 text-[#21170F]">
                    <th className="py-3 px-2">Name</th>
                    <th className="py-3 px-2">Role</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D5C1]/20">
                  {recentRegistrations.map((reg, i) => (
                    <tr key={i} className="hover:bg-[#F8F4EC]/35 transition-colors">
                      <td className="py-3 px-2 font-bold text-[#21170F]">{reg.name}</td>
                      <td className="py-3 px-2 font-bold text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            reg.role === "LAWYER"
                              ? "bg-[#A66A22]/10 text-[#A66A22]"
                              : "bg-[#21170F]/5 text-[#21170F]"
                          }`}
                        >
                          {reg.role}
                        </span>
                      </td>
                      <td className="py-3 px-2 lowercase font-medium">{reg.email}</td>
                      <td className="py-3 px-2 text-right font-bold text-[#21170F]">{reg.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardSection>

          {/* Audit Logs */}
          <DashboardSection title="System Activity Log">
            <div className="space-y-3">
              {platformActivityLogs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 border border-[#E2D5C1]/40 bg-[#FFFDF8] rounded-xl text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#21170F]/5 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-[#766B5F]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#21170F] leading-tight">{log.desc}</p>
                      <p className="text-[10px] text-[#766B5F]/75 font-semibold mt-0.5">
                        Category: {log.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#766B5F]/70 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </DashboardSection>
        </div>

        {/* Right column: System status */}
        <div className="space-y-6">
          <DashboardSection title="Platform Health Status">
            <div className="space-y-4">
              {/* Database health row */}
              <div className="flex items-center justify-between p-3 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/30">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-700" />
                  <span className="text-xs font-bold text-[#21170F]">Neon Postgres Pool</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Healthy
                </span>
              </div>

              {/* Firebase admin health row */}
              <div className="flex items-center justify-between p-3 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/30">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-700" />
                  <span className="text-xs font-bold text-[#21170F]">Firebase Auth SDK</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Healthy
                </span>
              </div>

              {/* WebServer health row */}
              <div className="flex items-center justify-between p-3 bg-[#F8F4EC]/50 rounded-xl border border-[#E2D5C1]/30">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-700" />
                  <span className="text-xs font-bold text-[#21170F]">Express WebServer</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                  Online
                </span>
              </div>
            </div>
          </DashboardSection>

          {/* Quick stats checklist */}
          <div className="p-5 border border-[#E2D5C1] bg-[#FFFDF8] rounded-3xl space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-[#21170F] uppercase tracking-widest block">
              Ecosystem Overview
            </h3>
            <p className="text-xs text-[#766B5F] leading-relaxed font-semibold">
              The LEXCONNECT system dashboard aggregates metrics from Firebase Authentication identity pools and PostgreSQL relation models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
