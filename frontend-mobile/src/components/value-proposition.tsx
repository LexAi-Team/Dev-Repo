"use client";

import { motion } from "framer-motion";

export default function ValueProposition() {
  return (
    <section className="py-20 bg-[#F1E9DA] border-y border-[#E2D5C1] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest text-[#A66A22] mb-3 block"
        >
          THE ALL-IN-ONE SYSTEM
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] tracking-tight mb-6"
        >
          One platform. Every stage of legal practice.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-[#766B5F] leading-relaxed max-w-3xl mx-auto"
        >
          From learning the law to practicing courtroom strategy, managing cases, and collaborating with experienced lawyers — LEXCONNECT brings the legal workflow together.
        </motion.p>
      </div>
    </section>
  );
}
