"use client";

import { CheckCircle2, Circle } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    {
      label: "8+ characters",
      met: password.length >= 8,
    },
    {
      label: "Uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Number",
      met: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-[#F8F4EC]/60 rounded-xl border border-[#E2D5C1]/40">
      {checks.map((check, index) => (
        <div
          key={index}
          className={`flex items-center space-x-1.5 text-xs transition-colors duration-200 ${
            check.met ? "text-[#A66A22] font-semibold" : "text-[#766B5F]/70"
          }`}
        >
          {check.met ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" />
          )}
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  );
}
export function validatePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
