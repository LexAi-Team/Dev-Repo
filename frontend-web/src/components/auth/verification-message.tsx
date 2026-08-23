"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/firebase/provider";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { getFirebaseAuthErrorMessage } from "../../lib/firebase/errors";

export default function VerificationMessage() {
  const { firebaseUser, refreshUser, sendVerificationEmail, signOut } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerifyCheck = async () => {
    if (checking) return;
    setChecking(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      await refreshUser();
      // If verification succeeded, the provider's useEffect will automatically handle redirection.
      // We will show a warning if it is still unverified.
      setInfoMessage("Checking verification status...");
      setTimeout(() => {
        setInfoMessage("");
        setErrorMessage("Your email hasn't been verified yet. Please check your inbox.");
        setChecking(false);
      }, 1500);
    } catch (error) {
      setErrorMessage(getFirebaseAuthErrorMessage(error));
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage("");
    setInfoMessage("");

    try {
      await sendVerificationEmail();
      setInfoMessage("Verification link sent! Please check your inbox.");
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error) {
      console.debug("[Auth] Resend verification failed:", error);
      setErrorMessage(getFirebaseAuthErrorMessage(error));
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  return (
    <div className="space-y-6 text-center">
      {/* Visual Mail Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#A66A22]/10 flex items-center justify-center border border-[#A66A22]/20">
          <Mail className="w-8 h-8 text-[#A66A22]" />
        </div>
      </div>

      {/* Headings */}
      <div className="space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          Verify your email
        </h2>
        <p className="text-sm text-[#766B5F] font-semibold leading-relaxed">
          We&apos;ve sent a verification link to:
          <span className="block text-[#21170F] font-bold mt-0.5 break-all">
            {firebaseUser?.email || "your email address"}
          </span>
        </p>
      </div>

      <div className="space-y-4">
        {infoMessage && (
          <div className="p-3 bg-[#A66A22]/10 border border-[#A66A22]/30 rounded-xl text-xs font-semibold text-[#A66A22] flex items-center justify-center space-x-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{infoMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-[#C58A35]/10 border border-[#C58A35]/30 rounded-xl text-xs font-bold text-[#A66A22]">
            {errorMessage}
          </div>
        )}

        <p className="text-xs text-[#766B5F] leading-relaxed">
          Please verify your email before continuing to LEXCONNECT.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Refresh/Check Button */}
          <button
            type="button"
            disabled={checking}
            onClick={handleVerifyCheck}
            className="flex items-center justify-center w-full h-[48px] bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {checking ? (
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>I&apos;ve verified my email</span>
              </span>
            )}
          </button>

          {/* Resend Email Button with Cooldown */}
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResendEmail}
            className="flex items-center justify-center w-full h-[48px] border border-[#E2D5C1] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-[#21170F] rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend verification email"}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            onClick={() => {
              signOut().catch((e) => console.debug("[Auth] Signout failed:", e));
            }}
            className="text-xs font-bold text-[#766B5F] hover:text-[#21170F] transition-colors underline pt-2 block mx-auto"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
