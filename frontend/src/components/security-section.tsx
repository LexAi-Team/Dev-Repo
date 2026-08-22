"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Key, FileCheck, Eye, Database } from "lucide-react";

export default function SecuritySection() {
  const securityFeatures = [
    { title: "Role-Based Access", desc: "Granular authorization levels for students, advocates, and senior partners.", icon: Key },
    { title: "Secure Authentication", desc: "Multi-factor authentication protocols protecting practice profiles.", icon: Lock },
    { title: "Case-Level Permissions", desc: "Strict compartmentalization of confidential litigation data.", icon: ShieldCheck },
    { title: "Controlled Document Access", desc: "Encrypted document repositories with view/edit policy controls.", icon: FileCheck },
    { title: "Audit Logs", desc: "Comprehensive audit trails tracking system interactions.", icon: Eye },
    { title: "Privacy-Aware Architecture", desc: "Zero-retention AI processing policies respecting client privilege.", icon: Database },
  ];

  return (
    <section className="py-24 bg-[#F1E9DA] border-y border-[#E2D5C1] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A66A22] mb-3 block">
            ENTERPRISE GOVERNANCE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#21170F] tracking-tight">
            Built for sensitive legal workflows.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E2D5C1] shadow-xs space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F8F4EC] border border-[#E2D5C1] flex items-center justify-center text-[#A66A22]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#21170F]">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#766B5F] leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
