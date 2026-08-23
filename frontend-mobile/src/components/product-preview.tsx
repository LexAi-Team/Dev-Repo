"use client";

import { motion } from "framer-motion";
import {
  MessageSquareText,
  Gavel,
  Briefcase,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ProductPreview() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-12 lg:mt-16 p-3 sm:p-6 rounded-3xl bg-[#21170F]/5 border border-[#E2D5C1] shadow-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Background visual glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C58A35]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#A66A22]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Product Frame Bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#21170F] text-[#FFFDF8] mb-4 border border-[#332218] shadow-inner">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A66A22]/60" />
          <div className="w-3 h-3 rounded-full bg-[#C58A35]/60" />
          <div className="w-3 h-3 rounded-full bg-[#D9B16A]/60" />
          <span className="ml-3 text-xs text-[#D9B16A] font-mono tracking-wider hidden sm:inline-block">
            lexconnect.app / workspace-v1.4
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#766B5F]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#332218] text-[#D9B16A] text-[11px] font-medium border border-[#A66A22]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Pipeline Active
          </span>
        </div>
      </div>

      {/* Grid Layout of the Ecosystem Modules */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Module 1: AI Legal Assistant */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-6 bg-[#FFFDF8] rounded-2xl p-5 border border-[#E2D5C1] shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#F1E9DA] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#F1E9DA] text-[#A66A22]">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#21170F] tracking-wide uppercase">
                  AI Legal Assistant
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F1E9DA] text-[#766B5F] font-mono">
                Source Grounded
              </span>
            </div>

            {/* Simulated AI Chat */}
            <div className="space-y-3 text-xs">
              <div className="bg-[#F8F4EC] p-3 rounded-xl border border-[#E2D5C1]/60 text-[#332218] self-end ml-4">
                <p className="font-medium">
                  &quot;What are the essential elements of a valid contract under Section 10?&quot;
                </p>
              </div>

              <div className="bg-[#21170F] text-[#FFFDF8] p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-[#D9B16A] font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LEX-AI Assistant Response:</span>
                </div>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  Under Indian Contract Act, 1872, essential elements include:
                  1. Free consent 2. Competency of parties 3. Lawful consideration 4. Lawful object.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#332218] text-[#D9B16A] border border-[#A66A22]/40">
                    Ref: Sec 10, ICA 1872
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#332218] text-[#D9B16A] border border-[#A66A22]/40">
                    Precedent: Mohori Bibee v. Dharmodas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Module 2: Courtroom Simulator */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-6 bg-[#21170F] text-[#FFFDF8] rounded-2xl p-5 border border-[#332218] shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#332218] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#332218] text-[#D9B16A]">
                  <Gavel className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#FFFDF8] tracking-wide uppercase">
                  Case Simulator
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#332218] text-[#D9B16A] font-mono">
                Courtroom Engine
              </span>
            </div>

            {/* Courtroom Dialogue */}
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#332218]/90 border border-[#A66A22]/20 flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#A66A22] text-[#FFFDF8] text-[9px] font-bold">
                  JUDGE
                </span>
                <p className="text-stone-300 text-[11px]">
                  &quot;Advocate, establish the chain of custody for Evidence B.&quot;
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#A66A22]/20 border border-[#A66A22]/40 flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#D9B16A] text-[#21170F] text-[9px] font-bold">
                  LAWYER
                </span>
                <p className="text-amber-100 text-[11px]">
                  &quot;Your Honor, Exhibit 4 confirms seizure under Section 102.&quot;
                </p>
              </div>

              <div className="p-2 rounded-lg bg-[#332218]/50 flex items-center justify-between text-[11px] text-[#D9B16A]">
                <span>Arg score: 94%</span>
                <span>Objection Overruled</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Module 3: Lawyer Dashboard */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-7 bg-[#FFFDF8] rounded-2xl p-5 border border-[#E2D5C1] shadow-sm"
        >
          <div className="flex items-center justify-between mb-3 border-b border-[#F1E9DA] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F1E9DA] text-[#A66A22]">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#21170F] tracking-wide uppercase">
                Lawyer Dashboard
              </span>
            </div>
            <span className="text-[10px] text-[#766B5F]">Daily Overview</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-[#F8F4EC] p-2.5 rounded-xl border border-[#E2D5C1] text-center">
              <span className="text-[10px] text-[#766B5F] block">Active Cases</span>
              <span className="text-lg font-bold text-[#21170F]">12</span>
            </div>
            <div className="bg-[#F8F4EC] p-2.5 rounded-xl border border-[#E2D5C1] text-center">
              <span className="text-[10px] text-[#766B5F] block">Hearings</span>
              <span className="text-lg font-bold text-[#A66A22]">2</span>
            </div>
            <div className="bg-[#F8F4EC] p-2.5 rounded-xl border border-[#E2D5C1] text-center">
              <span className="text-[10px] text-[#766B5F] block">Tasks</span>
              <span className="text-lg font-bold text-[#21170F]">7</span>
            </div>
            <div className="bg-[#F8F4EC] p-2.5 rounded-xl border border-[#E2D5C1] text-center">
              <span className="text-[10px] text-[#766B5F] block">Deadlines</span>
              <span className="text-lg font-bold text-[#C58A35]">5</span>
            </div>
          </div>

          <div className="text-[11px] bg-[#F8F4EC] p-2.5 rounded-xl border border-[#E2D5C1]/70 flex items-center justify-between text-[#332218]">
            <span className="truncate font-medium">State of Maharashtra v. Rajesh Kumar</span>
            <span className="px-2 py-0.5 rounded bg-[#C58A35]/20 text-[#A66A22] font-semibold text-[10px]">
              Hearing Today @ 2:30 PM
            </span>
          </div>
        </motion.div>

        {/* Module 4: Collaboration Network */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="md:col-span-5 bg-[#F1E9DA] rounded-2xl p-5 border border-[#E2D5C1] shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#E2D5C1] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FFFDF8] text-[#A66A22]">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#21170F] tracking-wide uppercase">
                  Collaboration
                </span>
              </div>
              <span className="text-[10px] text-[#A66A22] font-semibold">Active Session</span>
            </div>

            <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#E2D5C1] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#21170F] text-[#D9B16A] flex items-center justify-center font-bold text-[10px]">
                    AM
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-[#21170F] leading-none">
                      Adv. Arjun Mehta
                    </h5>
                    <span className="text-[9px] text-[#766B5F]">Senior Counsel</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#332218] italic bg-[#F8F4EC] p-2 rounded-lg border border-[#E2D5C1]">
                &quot;Let&apos;s review the cross-examination strategy before tomorrow&apos;s hearing.&quot;
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#766B5F]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#A66A22]" /> 3 Lawyers connected
            </span>
            <span className="text-[#A66A22] font-medium">Shared Draft v2</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
