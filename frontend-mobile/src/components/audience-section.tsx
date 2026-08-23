"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Briefcase, CheckCircle2, ArrowRight } from "lucide-react";

export default function AudienceSection() {
  return (
    <section className="py-24 bg-[#F8F4EC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: For Law Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#FFFDF8] rounded-3xl p-8 border border-[#E2D5C1] shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#F1E9DA] text-[#A66A22] flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#21170F] mb-4">
                For Law Students
              </h3>
              <p className="text-sm text-[#766B5F] mb-6 leading-relaxed">
                Transform textbook theory into practical courtroom readiness with simulated trials, statutory guidance, and AI legal coaching.
              </p>

              <ul className="space-y-3 mb-8 text-sm text-[#332218]">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                  <span>Learn legal concepts with source grounding</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                  <span>Practice fictional courtroom scenarios</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                  <span>Simulate cross-examination proceedings</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                  <span>Improve legal reasoning and argumentation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#A66A22]" />
                  <span>Track trial performance analytics</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#A66A22] text-[#FFFDF8] font-medium text-sm hover:bg-[#8F591A] transition-all shadow-sm"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 text-[#D9B16A]" />
            </Link>
          </motion.div>

          {/* RIGHT: For Lawyers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#21170F] text-[#FFFDF8] rounded-3xl p-8 border border-[#332218] shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#332218] text-[#D9B16A] flex items-center justify-center mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#FFFDF8] mb-4">
                For Lawyers
              </h3>
              <p className="text-sm text-stone-300 mb-6 leading-relaxed">
                Streamline practice operations, organize case files, monitor hearing dockets, and collaborate with junior counsel in a unified environment.
              </p>

              <ul className="space-y-3 mb-8 text-sm text-stone-200">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#D9B16A]" />
                  <span>Manage active cases and hearing calendars</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#D9B16A]" />
                  <span>Track procedural court deadlines & tasks</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#D9B16A]" />
                  <span>Organize structured legal documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#D9B16A]" />
                  <span>Collaborate on strategy with advocates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#D9B16A]" />
                  <span>Mentor rising legal talent</span>
                </li>
              </ul>
            </div>

            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#FFFDF8] text-[#21170F] font-medium text-sm hover:bg-[#F1E9DA] transition-all"
            >
              <span>Manage Your Practice</span>
              <ArrowRight className="w-4 h-4 text-[#A66A22]" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
