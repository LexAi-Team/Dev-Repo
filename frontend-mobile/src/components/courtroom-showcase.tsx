"use client";

import { motion } from "framer-motion";
import { Gavel } from "lucide-react";

export default function CourtroomShowcase() {
  return (
    <section className="py-24 bg-[#F8F4EC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A66A22] mb-3 block">
            SIMULATED LITIGATION ENGINE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] tracking-tight">
            Step into the courtroom.
          </h2>
        </div>

        {/* Large Immersive Showcase Board */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#21170F] text-[#FFFDF8] rounded-3xl p-6 sm:p-10 border border-[#332218] shadow-2xl overflow-hidden relative"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Panel: Case Brief */}
            <div className="lg:col-span-3 bg-[#332218] p-5 rounded-2xl border border-[#A66A22]/30 space-y-4">
              <span className="text-[10px] font-bold text-[#D9B16A] uppercase tracking-wider block">
                CASE BRIEF
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#FFFDF8] mb-1">
                  State of Maharashtra vs. Rajesh Kumar
                </h4>
                <span className="text-[11px] text-stone-400">Section 302 IPC Trial</span>
              </div>
              <div className="pt-3 border-t border-[#A66A22]/20 space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Bench:</span>
                  <span className="font-semibold text-stone-200">Sessions</span>
                </div>
                <div className="flex justify-between">
                  <span>Evidentiary Stage:</span>
                  <span className="font-semibold text-stone-200">Exhibit 4 Examination</span>
                </div>
              </div>
            </div>

            {/* Middle Panel: Courtroom Stage */}
            <div className="lg:col-span-6 bg-[#332218]/60 p-6 rounded-2xl border border-[#A66A22]/20 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-[#A66A22]/20 pb-3">
                <div className="flex items-center gap-2 text-xs text-[#D9B16A]">
                  <Gavel className="w-4 h-4" />
                  <span className="font-semibold">ACTIVE COURTROOM PROCEEDINGS</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Record Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#21170F] border border-[#A66A22]/30 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#D9B16A]">
                    <span>JUDGE</span>
                    <span>10:42 AM</span>
                  </div>
                  <p className="text-stone-300">
                    &quot;Advocate, address the defense objection regarding Section 27 statement admissibility.&quot;
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#A66A22]/20 border border-[#A66A22]/40 space-y-1 ml-4">
                  <div className="flex justify-between text-[10px] font-bold text-[#FFFDF8]">
                    <span>YOU (DEFENSE COUNSEL)</span>
                    <span>10:43 AM</span>
                  </div>
                  <p className="text-amber-100">
                    &quot;Your Honor, information leading to discovery under Sec 27 is strictly confined to the distinct fact discovered. Recovery witness testimony fails this threshold.&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-[#D9B16A]">
                <span>Objection Status: Overruled</span>
                <span className="font-semibold text-emerald-400">+12 Strategic Reasoning Points</span>
              </div>
            </div>

            {/* Right Panel: Performance Breakdown */}
            <div className="lg:col-span-3 bg-[#332218] p-5 rounded-2xl border border-[#A66A22]/30 space-y-5">
              <span className="text-[10px] font-bold text-[#D9B16A] uppercase tracking-wider block">
                PERFORMANCE SCORECARD
              </span>

              <div className="text-center py-2 border-b border-[#A66A22]/20">
                <span className="text-3xl font-bold text-[#FFFDF8]">90%</span>
                <span className="text-xs text-[#D9B16A] block mt-1">Overall Assessment</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>Legal Reasoning</span>
                    <span className="font-bold text-emerald-400">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#21170F] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[92%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>Questioning</span>
                    <span className="font-bold text-emerald-400">89%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#21170F] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[89%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>Evidence Handling</span>
                    <span className="font-bold text-emerald-400">86%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#21170F] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[86%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-stone-300">
                    <span>Argumentation</span>
                    <span className="font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#21170F] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[94%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
