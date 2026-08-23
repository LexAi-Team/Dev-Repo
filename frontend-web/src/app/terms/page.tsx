import Link from "next/link";
import { Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#21170F] py-16 px-6 sm:px-12 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-8 sm:p-12 shadow-lg space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold leading-none">Terms of Service</h1>
            <span className="text-xs text-[#766B5F] font-semibold">LEXCONNECT Legal Platform</span>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[#766B5F] leading-relaxed border-t border-[#E2D5C1]/40 pt-6">
          <p className="font-bold text-[#21170F]">1. Agreement to Terms</p>
          <p>
            Welcome to LEXCONNECT. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our ecosystem services.
          </p>
          <p className="font-bold text-[#21170F]">2. Description of Service</p>
          <p>
            LEXCONNECT is an AI-powered legal learning and practice platform. All simulation results, chat responses, and practice workflows are for mock educational and practitioner practice purposes only and do not constitute formal legal advice.
          </p>
          <p className="font-bold text-[#21170F]">3. User Account Security</p>
          <p>
            You are responsible for maintaining the confidentiality of your credentials and account parameters. All database actions recorded under your user profile will be associated with you.
          </p>
        </div>

        <div className="pt-6 border-t border-[#E2D5C1]/40 flex justify-between items-center text-xs">
          <span className="text-[#766B5F]">Last updated: August 2026</span>
          <Link href="/register" className="text-[#A66A22] font-bold hover:underline">
            Back to registration
          </Link>
        </div>
      </div>
    </div>
  );
}
