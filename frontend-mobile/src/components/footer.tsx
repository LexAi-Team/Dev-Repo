import Link from "next/link";
import { Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#21170F] text-[#FFFDF8] border-t border-[#332218] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#332218] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/40">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-tight font-bold text-[#FFFDF8] leading-none">
                  LEX<span className="text-[#D9B16A]">CONNECT</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mt-0.5">
                  AI-Powered Ecosystem
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              One intelligent legal ecosystem built for the next generation of lawyers — uniting statutory AI assistance, trial simulation, case management, and advocate networking.
            </p>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D9B16A] mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link href="/ai-assistant" className="hover:text-[#D9B16A] transition-colors">
                  AI Legal Assistant
                </Link>
              </li>
              <li>
                <Link href="/case-simulator" className="hover:text-[#D9B16A] transition-colors">
                  Case Simulator
                </Link>
              </li>
              <li>
                <Link href="/lawyers" className="hover:text-[#D9B16A] transition-colors">
                  Lawyer Workspace
                </Link>
              </li>
              <li>
                <Link href="/collaboration" className="hover:text-[#D9B16A] transition-colors">
                  Collaboration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D9B16A] mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link href="/platform" className="hover:text-[#D9B16A] transition-colors">
                  Legal Learning
                </Link>
              </li>
              <li>
                <Link href="/case-simulator" className="hover:text-[#D9B16A] transition-colors">
                  Case Simulations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#D9B16A] mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9B16A] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#332218] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© 2026 LEXCONNECT. All rights reserved.</p>
          <p className="text-[11px] text-center md:text-right max-w-md text-stone-500">
            Disclaimer: AI-generated legal information is intended for educational/general informational purposes and should be independently verified against official legal sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
