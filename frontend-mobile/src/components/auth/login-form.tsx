"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/firebase/provider";
import PasswordInput from "./password-input";
import GoogleAuthButton from "./google-auth-button";
import { getFirebaseAuthErrorMessage } from "../../lib/firebase/errors";

export default function LoginForm() {
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isGoogleOnly, setIsGoogleOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setFormError("");
    setIsGoogleOnly(false);

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setIsGoogleOnly(false);
    setFormError("");

    try {
      await signIn(email, password);
    } catch (error: unknown) {
      console.debug("[Auth] Login failed:", error);
      const err = error as { code?: string };
      if (err?.code === "auth/google-only") {
        setIsGoogleOnly(true);
      } else {
        setFormError(getFirebaseAuthErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2 text-center md:text-left">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#21170F] tracking-tight">
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-[#766B5F] font-medium">
          Sign in to continue to LEXCONNECT.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Custom Google Warning Card */}
        {isGoogleOnly && (
          <div className="p-5 bg-[#C58A35]/15 border border-[#C58A35]/40 rounded-2xl text-center space-y-4 shadow-sm animate-fade-in">
            <p className="text-xs font-bold text-[#A66A22] leading-relaxed">
              This account uses Google Sign-In.<br />
              Please continue with Google to sign in.
            </p>
            <div className="pt-1">
              <GoogleAuthButton onError={(err) => setFormError(err)} />
            </div>
          </div>
        )}

        {formError && !isGoogleOnly && (
          <div className="p-3.5 bg-[#C58A35]/10 border border-[#C58A35]/30 rounded-xl text-xs font-bold text-[#A66A22]">
            {formError}
          </div>
        )}

        {/* Hide password/email inputs if Google redirection is active to focus the UX */}
        {!isGoogleOnly && (
          <>
            {/* Email Field */}
            <div className="space-y-1.5 w-full">
              <label
                htmlFor="email"
                className="text-xs font-bold uppercase tracking-wider text-[#21170F]"
              >
                Email
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
                    ? "border-[#C58A35] focus:ring-1 focus:ring-[#C58A35] focus:border-[#C58A35]"
                    : "border-[#E2D5C1] focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
                } placeholder:text-[#766B5F]/50 text-sm`}
              />
              {emailError && (
                <p id="email-error" className="text-xs font-semibold text-[#A66A22] mt-1">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={passwordError}
              />
              <div className="flex justify-end pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#A66A22] hover:text-[#C58A35] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full h-[48px] bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </>
        )}
      </form>

      {/* Divider & Google Login (Visible only when not already showing Google Only redirect) */}
      {!isGoogleOnly && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2D5C1]/75"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8F4EC] px-3 font-bold text-[#766B5F]/70 tracking-widest text-[10px]">
                OR
              </span>
            </div>
          </div>

          <GoogleAuthButton onError={(err) => setFormError(err)} />
        </>
      )}

      {/* Reset button if GoogleOnly lock needs to be cancelled */}
      {isGoogleOnly && (
        <button
          type="button"
          onClick={() => setIsGoogleOnly(false)}
          className="text-xs font-bold text-[#766B5F] hover:text-[#21170F] block mx-auto underline transition-colors"
        >
          Use different email
        </button>
      )}

      {/* Redirect Link */}
      <div className="text-center">
        <p className="text-xs text-[#766B5F] font-semibold">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#A66A22] hover:text-[#C58A35] transition-colors underline font-bold"
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
