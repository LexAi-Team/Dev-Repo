"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export default function PasswordInput({
  id,
  label,
  value,
  placeholder = "Enter your password",
  onChange,
  error,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wider text-[#21170F]"
        >
          {label}
        </label>
      </div>
      <div className="relative rounded-xl shadow-sm">
        <input
          type={showPassword ? "text" : "password"}
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`block w-full h-[48px] px-4 pr-12 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none transition-all ${
            error
              ? "border-[#C58A35] focus:ring-1 focus:ring-[#C58A35] focus:border-[#C58A35]"
              : "border-[#E2D5C1] focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
          } placeholder:text-[#766B5F]/50 text-sm`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#766B5F]/70 hover:text-[#21170F] transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs font-semibold text-[#A66A22] mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
