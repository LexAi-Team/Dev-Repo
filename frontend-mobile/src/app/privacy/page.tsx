import Link from "next/link";
import { Scale } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#21170F] py-16 px-6 sm:px-12 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-8 sm:p-12 shadow-lg space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#21170F] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold leading-none">Privacy Policy</h1>
            <span className="text-xs text-[#766B5F] font-semibold">LEXCONNECT Legal Platform</span>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[#766B5F] leading-relaxed border-t border-[#E2D5C1]/40 pt-6">
          <p className="font-bold text-[#21170F]">1. Information Collection</p>
          <p>
            We collect user details (name, email, bar enrollment or university details) to build customized advocate/student workspaces, verify authorization permissions, and sync secure application profiles.
          </p>
          <p className="font-bold text-[#21170F]">2. Firebase & Secure Hosting</p>
          <p>
            Authentication is securely hosted and handled by Firebase. We never receive or store your passwords in our database system. Custom profile database rows are encrypted and hosted securely on Neon.
          </p>
          <p className="font-bold text-[#21170F]">3. Data Sharing</p>
          <p>
            We do not sell, distribute, or share user profile information with third parties. All analytics and audit logs remain strictly internal to the ecosystem.
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
