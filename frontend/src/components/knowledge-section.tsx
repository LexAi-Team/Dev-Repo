"use client";

import { motion } from "framer-motion";
import {
  FileCode,
  Cpu,
  Database,
  Brain,
  CheckCheck,
  AlertTriangle,
  ArrowDown,
} from "lucide-react";

export default function KnowledgeSection() {
  const pipelineSteps = [
    { title: "LEGAL SOURCES", desc: "Statutes, Code, Bare Acts, SC & HC Precedents", icon: Database },
    { title: "DOCUMENT PROCESSING", desc: "Chunking, Vector Embeddings, Legal Taxonomy Parsing", icon: FileCode },
    { title: "KNOWLEDGE RETRIEVAL", desc: "Dense & Sparse Hybrid Contextual Indexing", icon: Cpu },
    { title: "AI REASONING", desc: "Legal Domain Model & Procedural Synthesizer", icon: Brain },
    { title: "CITED RESPONSE", desc: "Grounding-verified response with direct legal source anchors", icon: CheckCheck },
  ];

  return (
    <section className="py-24 bg-[#21170F] text-[#FFFDF8] relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A66A22]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D9B16A] mb-3 block">
            VERIFIED GROUNDING ENGINE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FFFDF8] tracking-tight mb-4">
            Intelligence grounded in legal knowledge.
          </h2>
          <p className="text-stone-300 text-base sm:text-lg">
            LEXCONNECT is designed to connect AI assistance with authoritative legal knowledge and source-grounded retrieval.
          </p>
        </div>

        {/* Visual Pipeline */}
        <div className="max-w-4xl mx-auto space-y-3 mb-16">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#332218] border border-[#A66A22]/30 shadow-md gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#21170F] text-[#D9B16A] border border-[#A66A22]/40">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-[#D9B16A] tracking-wider">
                      {step.title}
                    </h3>
                    <p className="text-xs text-stone-300">{step.desc}</p>
                  </div>
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <ArrowDown className="w-4 h-4 text-[#A66A22] sm:hidden" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {["Source Grounded", "Context Aware", "Citation Ready", "Uncertainty Aware"].map((badge) => (
            <div
              key={badge}
              className="p-3 rounded-xl bg-[#332218] border border-[#A66A22]/30 text-center text-xs font-medium text-[#D9B16A]"
            >
              {badge}
            </div>
          ))}
        </div>

        {/* Disclaimers / Disclaimer Note */}
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[#332218]/40 border border-[#A66A22]/20 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#D9B16A] flex-shrink-0" />
          <span>
            AI-generated legal information should be independently verified against authoritative legal sources.
          </span>
        </div>
      </div>
    </section>
  );
}
