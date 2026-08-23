"use client";

import { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/auth-layout";
import { useAuth } from "@/lib/firebase/provider";
import { getFirebaseAuthErrorMessage } from "@/lib/firebase/errors";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    setEmailError("");
    setErrorMessage("");
    setInfoMessage("");

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setInfoMessage("Check your inbox for the password reset link.");
      setEmail("");
    } catch (error: unknown) {
      console.debug("[Auth] Reset password failed:", error);
      setErrorMessage(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Back link */}
        <div className="flex">
          <Link
            href="/login"
            className="flex items-center space-x-1 text-xs font-bold text-[#766B5F] hover:text-[#21170F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Headings */}
        <div className="space-y-2 text-center md:text-left">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
            Reset your password
          </h2>
          <p className="text-xs sm:text-sm text-[#766B5F] font-medium leading-relaxed">
            Enter your email and we&apos;ll send you a password reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {infoMessage && (
            <div className="p-3.5 bg-[#A66A22]/10 border border-[#A66A22]/30 rounded-xl text-xs font-semibold text-[#A66A22] flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-[#A66A22] shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-[#C58A35]/10 border border-[#C58A35]/30 rounded-xl text-xs font-bold text-[#A66A22]">
              {errorMessage}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5 w-full">
            <label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-[#21170F]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`block w-full h-[48px] px-4 text-[#21170F] bg-[#FFFDF8] border rounded-xl outline-none transition-all ${
                emailError
                  ? "border-[#C58A35] focus:ring-1 focus:ring-[#C58A35]"
                  : "border-[#E2D5C1] focus:ring-1 focus:ring-[#A66A22]"
              } placeholder:text-[#766B5F]/50 text-sm`}
            />
            {emailError && (
              <p id="email-error" className="text-xs font-semibold text-[#A66A22] mt-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full h-[48px] bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
