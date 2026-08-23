"use client";

import { GraduationCap, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  selectedRole: "STUDENT" | "LAWYER" | null;
  onChange: (role: "STUDENT" | "LAWYER") => void;
  error?: string;
}

export default function RoleSelector({
  selectedRole,
  onChange,
  error,
}: RoleSelectorProps) {
  return (
    <div className="space-y-3 w-full">
      <label className="text-xs font-bold uppercase tracking-wider text-[#21170F] block">
        Choose Your Role
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Student Option */}
        <button
          type="button"
          onClick={() => onChange("STUDENT")}
          className={`flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 outline-none hover:shadow-md ${
            selectedRole === "STUDENT"
              ? "bg-[#FFFDF8] border-[#A66A22] ring-1 ring-[#A66A22] shadow-sm"
              : "bg-[#FFFDF8]/40 border-[#E2D5C1] hover:border-[#A66A22]/50"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              selectedRole === "STUDENT"
                ? "bg-[#A66A22] text-[#FFFDF8]"
                : "bg-[#F8F4EC] text-[#A66A22]"
            }`}
          >
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-serif text-base font-bold text-[#21170F] mb-1">
            Law Student
          </span>
          <span className="text-xs text-[#766B5F] leading-relaxed max-w-[160px]">
            Learn, practice, and improve your legal reasoning.
          </span>
        </button>

        {/* Lawyer Option */}
        <button
          type="button"
          onClick={() => onChange("LAWYER")}
          className={`flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 outline-none hover:shadow-md ${
            selectedRole === "LAWYER"
              ? "bg-[#FFFDF8] border-[#A66A22] ring-1 ring-[#A66A22] shadow-sm"
              : "bg-[#FFFDF8]/40 border-[#E2D5C1] hover:border-[#A66A22]/50"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              selectedRole === "LAWYER"
                ? "bg-[#A66A22] text-[#FFFDF8]"
                : "bg-[#F8F4EC] text-[#A66A22]"
            }`}
          >
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="font-serif text-base font-bold text-[#21170F] mb-1">
            Lawyer
          </span>
          <span className="text-xs text-[#766B5F] leading-relaxed max-w-[160px]">
            Manage your practice and collaborate with legal professionals.
          </span>
        </button>
      </div>
      {error && (
        <p className="text-xs font-semibold text-[#A66A22] mt-1 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
