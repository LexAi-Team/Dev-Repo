"use client";

import { motion } from "framer-motion";
import { BookOpen, Gavel, Briefcase, Users } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "LEARN",
      subtitle: "Understand laws, concepts, procedures and legal reasoning.",
      icon: BookOpen,
    },
    {
      num: "02",
      title: "PRACTICE",
      subtitle: "Experience realistic legal scenarios and courtroom simulations.",
      icon: Gavel,
    },
    {
      num: "03",
      title: "MANAGE",
      subtitle: "Organize cases, hearings, tasks, deadlines and documents.",
      icon: Briefcase,
    },
    {
      num: "04",
      title: "COLLABORATE",
      subtitle: "Connect with lawyers, exchange perspectives and grow professionally.",
      icon: Users,
    },
  ];

  return (
    <section className="py-24 bg-[#F1E9DA] border-y border-[#E2D5C1] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A66A22] mb-3 block">
            THE EVOLUTIONARY JOURNEY
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] tracking-tight">
            From learning to real-world readiness.
          </h2>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Subtle Connecting Golden Line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#A66A22]/20 via-[#A66A22] to-[#A66A22]/20 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative z-10 bg-[#FFFDF8] rounded-2xl p-6 border border-[#E2D5C1] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-bold text-[#A66A22]">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#F8F4EC] border border-[#E2D5C1] flex items-center justify-center text-[#21170F]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#21170F] mb-2 tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#766B5F] leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
