"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-[#F8F4EC] to-[#F1E9DA] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-[#21170F] via-[#332218] to-[#21170F] text-[#FFFDF8] rounded-3xl p-10 sm:p-16 border border-[#A66A22]/30 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Subtle Background Glow & Particle Highlights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C58A35]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A66A22]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl bg-[#332218] text-[#D9B16A] flex items-center justify-center mx-auto mb-6 border border-[#A66A22]/40 shadow-sm">
            <Scale className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight text-[#FFFDF8]">
            The next generation of legal practice starts here.
          </h2>

          <p className="text-base sm:text-xl text-[#D9B16A] font-serif max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Learn the law. Practice the argument. Manage the case. Build the connection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#A66A22] text-[#FFFDF8] font-medium text-base hover:bg-[#8F591A] transition-all shadow-lg hover:-translate-y-0.5 border border-[#C58A35]/40 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/platform"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#332218] text-[#FFFDF8] font-medium text-base border border-[#A66A22]/30 hover:bg-[#21170F] transition-all"
            >
              Explore the Platform
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
