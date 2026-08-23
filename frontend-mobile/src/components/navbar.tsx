"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Platform", href: "#platform" },
    { name: "AI Assistant", href: "#ai-assistant" },
    { name: "Case Simulator", href: "#case-simulator" },
    { name: "For Lawyers", href: "#lawyers" },
    { name: "Collaboration", href: "#collaboration" },
    { name: "About", href: "#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F8F4EC]/90 backdrop-blur-md border-b border-[#E2D5C1] shadow-xs py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/40 shadow-sm transition-transform group-hover:scale-105">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-tight font-bold text-[#21170F] leading-none">
                LEX<span className="text-[#A66A22]">CONNECT</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#766B5F] font-semibold mt-0.5">
                AI-Powered Ecosystem
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#766B5F] hover:text-[#21170F] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#A66A22] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#21170F] hover:text-[#A66A22] px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#21170F] text-[#FFFDF8] text-sm font-medium hover:bg-[#332218] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-[#332218]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-[#D9B16A]" />
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#21170F] hover:bg-[#F1E9DA] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F8F4EC] border-b border-[#E2D5C1] px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#21170F] hover:text-[#A66A22] py-2 border-b border-[#E2D5C1]/50"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full border border-[#E2D5C1] text-[#21170F] font-medium text-sm hover:bg-[#F1E9DA]"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-[#21170F] text-[#FFFDF8] font-medium text-sm hover:bg-[#332218] flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-[#D9B16A]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
