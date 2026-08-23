"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import ProductPreview from "./product-preview";

export default function Hero() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-28 overflow-hidden bg-[#F8F4EC]">
      {/* Decorative Particles & Subtle Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#C58A35]/10 via-[#D9B16A]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Floating particle elements */}
      <div className="absolute top-28 left-[12%] w-2 h-2 rounded-full bg-[#A66A22] animate-particle-1" />
      <div className="absolute top-44 right-[15%] w-2.5 h-2.5 rounded-full bg-[#C58A35] animate-particle-2" />
      <div className="absolute bottom-32 left-[18%] w-1.5 h-1.5 rounded-full bg-[#D9B16A] animate-particle-3" />
      <div className="absolute bottom-48 right-[10%] w-2 h-2 rounded-full bg-[#332218]/40 animate-particle-1" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F1E9DA] border border-[#E2D5C1] text-xs font-semibold text-[#A66A22] uppercase tracking-widest mb-8 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C58A35]" />
          <span>THE FUTURE OF LEGAL PRACTICE</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#21170F] tracking-tight leading-[1.08] mb-6 max-w-5xl mx-auto"
        >
          Learn. Practice. Work. Collaborate.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#A66A22] max-w-3xl mx-auto mb-4 font-normal"
        >
          One intelligent legal ecosystem built for the next generation of lawyers.
        </motion.p>

        {/* Detailed description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base sm:text-lg text-[#766B5F] max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
        >
          AI-powered legal learning, courtroom simulations, case management, and professional collaboration — all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#A66A22] text-[#FFFDF8] font-medium text-base hover:bg-[#8F591A] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-[#C58A35]/30 group"
          >
            <span>Explore LEXCONNECT</span>
            <ArrowRight className="w-5 h-5 text-[#D9B16A] group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#platform"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FFFDF8] text-[#21170F] font-medium text-base border border-[#E2D5C1] hover:bg-[#F1E9DA] hover:border-[#A66A22]/40 transition-all shadow-xs"
          >
            <span>See How It Works</span>
            <ChevronRight className="w-4 h-4 text-[#766B5F]" />
          </a>
        </motion.div>

        {/* Audience note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs sm:text-sm text-[#766B5F] font-medium tracking-wide uppercase"
        >
          Built for law students, lawyers, and the future of legal practice.
        </motion.p>

        {/* Interactive Product Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
}
