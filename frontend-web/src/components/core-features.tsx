"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MessageSquareText,
  Gavel,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function CoreFeatures() {
  return (
    <section id="platform" className="py-24 sm:py-32 bg-[#F8F4EC] space-y-32">
      {/* FEATURE 01: AI LEGAL ASSISTANT */}
      <div id="ai-assistant" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-[#A66A22] px-3 py-1 bg-[#F1E9DA] rounded-full border border-[#E2D5C1]">
                01
              </span>
              <span className="text-xs font-semibold text-[#766B5F] uppercase tracking-wider">
                AI LEGAL ASSISTANT
              </span>
            </div>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] leading-tight">
              Ask the law. Understand the law.
            </h3>
            <p className="text-base sm:text-lg text-[#766B5F] leading-relaxed">
              An AI-powered legal assistant that helps students and lawyers understand legal concepts, procedures, provisions, and case-law concepts through contextual conversations and source-grounded responses.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#332218]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                <span>Statutory provision breakdown with simple commentary</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                <span>Citation-backed summaries of Supreme Court &amp; High Court rulings</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                <span>Procedural guides for civil and criminal litigation</span>
              </li>
            </ul>

            <div className="pt-4">
              <Link
                href="/ai-assistant"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#21170F] text-[#FFFDF8] text-sm font-medium hover:bg-[#332218] transition-all group"
              >
                <span>Explore AI Assistant</span>
                <ArrowRight className="w-4 h-4 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#E2D5C1] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#F1E9DA] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#21170F]">Legal Query Interface</h4>
                  <span className="text-xs text-[#766B5F]">Grounding Engine: Active</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F1E9DA] text-[#A66A22] font-medium border border-[#E2D5C1]">
                Indian Law Corpus
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8F4EC] p-4 rounded-2xl border border-[#E2D5C1] text-sm text-[#21170F]">
                <span className="text-xs text-[#766B5F] block font-semibold mb-1">USER QUERY</span>
                &quot;What are the essentials of a valid contract under Section 10 of ICA?&quot;
              </div>

              <div className="bg-[#21170F] text-[#FFFDF8] p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-[#D9B16A] text-xs font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>SHORT ANSWER &amp; PROVISIONS</span>
                </div>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Section 10 requires agreement made by free consent of parties competent to contract, for a lawful consideration and with a lawful object, and not hereby expressly declared to be void.
                </p>

                <div className="pt-2 border-t border-[#332218] space-y-2">
                  <span className="text-[11px] text-[#D9B16A] font-semibold uppercase tracking-wider block">
                    RELEVANT SOURCES &amp; CITATIONS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-[#332218] border border-[#A66A22]/30 flex items-center justify-between">
                      <span className="text-stone-300">Sec 10, Indian Contract Act</span>
                      <span className="text-[10px] text-[#D9B16A]">Statute</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#332218] border border-[#A66A22]/30 flex items-center justify-between">
                      <span className="text-stone-300">Balfour v. Balfour (1919)</span>
                      <span className="text-[10px] text-[#D9B16A]">Precedent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FEATURE 02: CASE SIMULATOR */}
      <div id="case-simulator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 lg:order-1 order-2 bg-[#21170F] text-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#332218] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#332218] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#332218] text-[#D9B16A] flex items-center justify-center">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#FFFDF8]">Courtroom Simulation Chamber</h4>
                  <span className="text-xs text-[#D9B16A]">Fictional Trial Scenario #804</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#A66A22] text-[#FFFDF8] font-semibold">
                Live Simulation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <div className="p-3 bg-[#332218] rounded-xl text-center border border-[#A66A22]/20">
                <span className="text-[10px] text-[#D9B16A] block">Judge</span>
                <span className="text-xs font-bold text-stone-200">Hon. R. Sharma</span>
              </div>
              <div className="p-3 bg-[#A66A22]/20 rounded-xl text-center border border-[#A66A22]/40">
                <span className="text-[10px] text-[#D9B16A] block">Your Role</span>
                <span className="text-xs font-bold text-[#FFFDF8]">Lead Counsel</span>
              </div>
              <div className="p-3 bg-[#332218] rounded-xl text-center border border-[#A66A22]/20">
                <span className="text-[10px] text-[#D9B16A] block">Opp. Counsel</span>
                <span className="text-xs font-bold text-stone-200">Adv. V. Menon</span>
              </div>
              <div className="p-3 bg-[#332218] rounded-xl text-center border border-[#A66A22]/20">
                <span className="text-[10px] text-[#D9B16A] block">Witness</span>
                <span className="text-xs font-bold text-stone-200">Dr. K. Rao</span>
              </div>
            </div>

            {/* Performance Evaluation Box */}
            <div className="p-5 bg-[#332218]/80 rounded-2xl border border-[#A66A22]/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#D9B16A]">
                <span>EVALUATION METRICS</span>
                <span>Overall: 90% (Grade A)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block">Legal Reasoning</span>
                  <span className="text-sm font-bold text-emerald-400">92%</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Evidence Handling</span>
                  <span className="text-sm font-bold text-emerald-400">86%</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Cross Examination</span>
                  <span className="text-sm font-bold text-emerald-400">89%</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Procedure</span>
                  <span className="text-sm font-bold text-emerald-400">93%</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 lg:order-2 order-1 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-[#A66A22] px-3 py-1 bg-[#F1E9DA] rounded-full border border-[#E2D5C1]">
                02
              </span>
              <span className="text-xs font-semibold text-[#766B5F] uppercase tracking-wider">
                CASE SIMULATOR
              </span>
            </div>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] leading-tight">
              Don&apos;t just study law. Practice it.
            </h3>
            <p className="text-base sm:text-lg text-[#766B5F] leading-relaxed">
              Law students can enter realistic fictional legal scenarios and take the role of the lawyer — presenting arguments, questioning witnesses, responding to objections, and testing courtroom strategies.
            </p>

            <div className="pt-4">
              <Link
                href="/case-simulator"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#A66A22] text-[#FFFDF8] text-sm font-medium hover:bg-[#8F591A] transition-all shadow-sm group"
              >
                <span>Explore Case Simulator</span>
                <ArrowRight className="w-4 h-4 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FEATURE 03: LAWYER WORKSPACE */}
      <div id="lawyers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-[#A66A22] px-3 py-1 bg-[#F1E9DA] rounded-full border border-[#E2D5C1]">
                03
              </span>
              <span className="text-xs font-semibold text-[#766B5F] uppercase tracking-wider">
                LAWYER WORKSPACE
              </span>
            </div>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] leading-tight">
              Your practice. One intelligent workspace.
            </h3>
            <p className="text-base sm:text-lg text-[#766B5F] leading-relaxed">
              Organize cases, track upcoming court hearings, manage tasks, store structured evidence documents, and maintain complete control over daily litigation operations.
            </p>

            <div className="pt-4">
              <Link
                href="/lawyers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#21170F] text-[#FFFDF8] text-sm font-medium hover:bg-[#332218] transition-all group"
              >
                <span>Explore Lawyer Workspace</span>
                <ArrowRight className="w-4 h-4 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 border border-[#E2D5C1] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#F1E9DA] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#21170F]">Chambers Dashboard</h4>
                  <span className="text-xs text-[#766B5F]">Advocate Practice Management</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F1E9DA] text-[#21170F] font-medium border border-[#E2D5C1]">
                High Court Bench
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#F8F4EC] rounded-2xl border border-[#E2D5C1] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#A66A22] font-bold block">CRIMINAL MATTERS</span>
                  <h5 className="text-sm font-bold text-[#21170F]">State of Maharashtra vs. Rajesh Kumar</h5>
                  <span className="text-xs text-[#766B5F]">Session Court No. 4 • Stage: Cross Examination</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#A66A22] text-[#FFFDF8]">
                  Hearing Today
                </span>
              </div>

              <div className="p-4 bg-[#F8F4EC] rounded-2xl border border-[#E2D5C1] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#766B5F] font-bold block">COMMERCIAL SUIT</span>
                  <h5 className="text-sm font-bold text-[#21170F]">ABC Corp Ltd. vs. XYZ Solutions Pvt. Ltd.</h5>
                  <span className="text-xs text-[#766B5F]">Commercial Division • Stage: Written Statement</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F1E9DA] text-[#766B5F] border border-[#E2D5C1]">
                  Due Aug 24
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FEATURE 04: LAWYER COLLABORATION */}
      <div id="collaboration" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 lg:order-1 order-2 bg-[#F1E9DA] rounded-3xl p-6 sm:p-8 border border-[#E2D5C1] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2D5C1] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#21170F]">Professional Collaboration Hub</h4>
                  <span className="text-xs text-[#766B5F]">Verified Advocates Only</span>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#FFFDF8] text-[#A66A22] font-semibold border border-[#E2D5C1]">
                Mentorship &amp; Strategy
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#FFFDF8] rounded-2xl border border-[#E2D5C1] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#21170F] text-[#D9B16A] font-bold flex items-center justify-center text-sm">
                      AM
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#21170F]">Adv. Arjun Mehta</h5>
                      <span className="text-xs text-[#766B5F]">Senior Counsel — Criminal Law (18+ Yrs Exp)</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#A66A22] font-medium">Senior Mentor</span>
                </div>
                <p className="text-xs sm:text-sm text-[#332218] italic bg-[#F8F4EC] p-3 rounded-xl border border-[#E2D5C1]">
                  &quot;Let&apos;s review the cross-examination strategy before tomorrow&apos;s hearing. Pay special attention to the timeline discrepancy in Exhibit 4.&quot;
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 lg:order-2 order-1 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-[#A66A22] px-3 py-1 bg-[#F1E9DA] rounded-full border border-[#E2D5C1]">
                04
              </span>
              <span className="text-xs font-semibold text-[#766B5F] uppercase tracking-wider">
                LAWYER COLLABORATION
              </span>
            </div>
            <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] leading-tight">
              Experience shouldn&apos;t stay isolated.
            </h3>
            <p className="text-base sm:text-lg text-[#766B5F] leading-relaxed">
              Connect junior lawyers with experienced professionals to discuss cases, exchange legal perspectives, collaborate on complex litigation matters, and learn from seasoned advocates.
            </p>

            <div className="pt-4">
              <Link
                href="/collaboration"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#21170F] text-[#FFFDF8] text-sm font-medium hover:bg-[#332218] transition-all group"
              >
                <span>Explore Collaboration</span>
                <ArrowRight className="w-4 h-4 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
