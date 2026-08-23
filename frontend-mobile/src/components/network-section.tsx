"use client";

import { motion } from "framer-motion";
import { Network } from "lucide-react";

export default function NetworkSection() {
  return (
    <section id="about" className="py-24 bg-[#F1E9DA] border-y border-[#E2D5C1] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A66A22] mb-3 block">
            PROFESSIONAL COMMUNITY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] tracking-tight">
            The legal community, connected.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Network Map Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 bg-[#FFFDF8] rounded-3xl p-8 border border-[#E2D5C1] shadow-lg relative min-h-[320px] flex items-center justify-center overflow-hidden"
          >
            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
              <line x1="50%" y1="50%" x2="18%" y2="18%" stroke="#A66A22" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.35" />
              <line x1="50%" y1="50%" x2="82%" y2="18%" stroke="#A66A22" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.35" />
              <line x1="50%" y1="50%" x2="18%" y2="82%" stroke="#A66A22" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.35" />
              <line x1="50%" y1="50%" x2="82%" y2="82%" stroke="#A66A22" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.35" />
            </svg>

            {/* Center Node */}
            <div className="w-20 h-20 rounded-2xl bg-[#21170F] text-[#D9B16A] flex flex-col items-center justify-center z-10 shadow-lg border border-[#A66A22]/40 p-2 gap-1.5 shrink-0">
              <Network className="w-7 h-7 shrink-0 text-[#D9B16A]" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-center whitespace-nowrap text-[#D9B16A]">LEX-HUB</span>
            </div>

            {/* Satellite Nodes */}
            <div className="absolute top-6 left-6 p-3 bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-xs z-10 shadow-sm">
              <span className="font-bold text-[#21170F] block">Senior Lawyer</span>
              <span className="text-[10px] text-[#766B5F]">Criminal Law</span>
            </div>
            <div className="absolute top-8 right-6 p-3 bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-xs z-10 shadow-sm">
              <span className="font-bold text-[#21170F] block">Junior Advocate</span>
              <span className="text-[10px] text-[#766B5F]">Civil Matters</span>
            </div>
            <div className="absolute bottom-6 left-8 p-3 bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-xs z-10 shadow-sm">
              <span className="font-bold text-[#21170F] block">Legal Researcher</span>
              <span className="text-[10px] text-[#766B5F]">Precedent Bench</span>
            </div>
            <div className="absolute bottom-8 right-8 p-3 bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-xs z-10 shadow-sm">
              <span className="font-bold text-[#21170F] block">Corporate Counsel</span>
              <span className="text-[10px] text-[#766B5F]">M&amp;A Advisory</span>
            </div>
          </motion.div>

          {/* Discussion Simulation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="p-4 bg-[#FFFDF8] rounded-2xl border border-[#E2D5C1] shadow-sm">
              <span className="text-[10px] font-bold text-[#A66A22] uppercase tracking-wider block mb-2">
                CASE STRATEGY — CRIMINAL LAW
              </span>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8F4EC] rounded-xl border border-[#E2D5C1]/60">
                  <span className="font-bold text-[#21170F] block mb-1">Adv. Neha Verma</span>
                  <p className="text-[#766B5F]">
                    &quot;Has anyone handled a similar evidentiary issue regarding electronic records certification under Sec 65B?&quot;
                  </p>
                </div>
                <div className="p-3 bg-[#21170F] text-[#FFFDF8] rounded-xl ml-4 border border-[#332218]">
                  <span className="font-bold text-[#D9B16A] block mb-1">Adv. Arjun Mehta</span>
                  <p className="text-stone-300">
                    &quot;Yes. Refer to Anvar P.V. v. P.K. Basheer (2014). The certificate is mandatory at the time of producing secondary evidence.&quot;
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
