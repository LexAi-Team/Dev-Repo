import Link from "next/link";
import { Scale } from "lucide-react";

export default function GenericPlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#21170F] flex flex-col justify-between p-8">
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 border-b border-[#E2D5C1]">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-[#21170F] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/30 shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <span className="font-serif text-xl tracking-tight font-bold text-[#21170F]">
            LEX<span className="text-[#A66A22]">CONNECT</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-[#766B5F] hover:text-[#21170F] transition-colors"
        >
          ← Back to Overview
        </Link>
      </header>

      <main className="max-w-3xl mx-auto w-full text-center py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1E9DA] border border-[#E2D5C1] text-xs font-semibold text-[#A66A22] uppercase tracking-wider mb-6">
          Module Preview
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#21170F] mb-4">
          {title}
        </h1>
        <p className="text-lg text-[#766B5F] mb-8 leading-relaxed">
          {subtitle}
        </p>
        <div className="p-8 bg-[#FFFDF8] rounded-2xl border border-[#E2D5C1] shadow-sm text-left mb-8">
          <div className="flex items-center gap-3 text-sm font-medium text-[#A66A22] mb-3">
            <div className="w-2 h-2 rounded-full bg-[#A66A22] animate-ping" />
            Full interactive module available in future phase release
          </div>
          <p className="text-sm text-[#766B5F]">
            You are viewing the landing experience. The underlying database models, live AI pipelines, courtroom engine, and real-time collaboration backend will connect here.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#21170F] text-[#FFFDF8] font-medium text-sm hover:bg-[#332218] transition-all shadow-md"
        >
          Return to Master Landing Page
        </Link>
      </main>

      <footer className="max-w-7xl mx-auto w-full text-center py-6 border-t border-[#E2D5C1] text-xs text-[#766B5F]">
        © 2026 LEXCONNECT. All rights reserved.
      </footer>
    </div>
  );
}
