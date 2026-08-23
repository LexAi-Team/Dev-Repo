"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden md:flex md:w-[45%] lg:w-[40%] bg-[#21170F] text-[#FFFDF8] flex-col justify-between p-12 overflow-hidden border-r border-[#332218] min-h-screen">
      {/* Decorative Network Graphic Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Node circles */}
          <circle cx="20%" cy="30%" r="4" fill="#D9B16A" />
          <circle cx="80%" cy="20%" r="6" fill="#D9B16A" />
          <circle cx="65%" cy="55%" r="5" fill="#D9B16A" />
          <circle cx="15%" cy="75%" r="6" fill="#D9B16A" />
          <circle cx="45%" cy="85%" r="3" fill="#D9B16A" />
          <circle cx="85%" cy="80%" r="4" fill="#D9B16A" />

          {/* Connection lines */}
          <line x1="20%" y1="30%" x2="80%" y2="20%" stroke="#D9B16A" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="20%" y1="30%" x2="65%" y2="55%" stroke="#D9B16A" strokeWidth="1" />
          <line x1="65%" y1="55%" x2="80%" y2="20%" stroke="#D9B16A" strokeWidth="1.2" />
          <line x1="65%" y1="55%" x2="85%" y2="80%" stroke="#D9B16A" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="15%" y1="75%" x2="65%" y2="55%" stroke="#D9B16A" strokeWidth="1" />
          <line x1="15%" y1="75%" x2="45%" y2="85%" stroke="#D9B16A" strokeWidth="1" />
          <line x1="45%" y1="85%" x2="85%" y2="80%" stroke="#D9B16A" strokeWidth="1" />
        </svg>
      </div>

      {/* Brand Header */}
      <div className="z-10 flex items-center space-x-2">
        <div className="w-9 h-9 bg-[#D9B16A]/10 rounded-lg flex items-center justify-center border border-[#D9B16A]/30">
          <Scale className="w-5 h-5 text-[#D9B16A]" />
        </div>
        <div>
          <span className="font-serif text-lg font-bold tracking-wider text-[#FFFDF8] block leading-none">
            LEXCONNECT
          </span>
          <span className="text-[9px] font-bold tracking-widest text-[#D9B16A] uppercase">
            AI Legal Ecosystem
          </span>
        </div>
      </div>

      {/* Main Statement */}
      <div className="z-10 my-auto py-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <span className="inline-block px-3 py-1 bg-[#D9B16A]/10 border border-[#D9B16A]/20 rounded-full text-[10px] font-bold tracking-wider uppercase text-[#D9B16A]">
            Ecosystem Access
          </span>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-[#FFFDF8]">
            The future of legal practice starts here.
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-stone-400 text-sm leading-relaxed max-w-[340px]"
        >
          Access AI-powered legal learning, case simulations, professional workflows, and lawyer collaboration from one intelligent ecosystem.
        </motion.p>
      </div>

      {/* Footer Info */}
      <div className="z-10 border-t border-[#332218] pt-6 flex justify-between text-[11px] text-stone-500">
        <span>© {new Date().getFullYear()} LEXCONNECT</span>
        <span>Secure Gateway</span>
      </div>
    </div>
  );
}
