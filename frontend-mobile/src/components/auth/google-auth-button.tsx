"use client";

import { useState } from "react";
import { useAuth } from "../../lib/firebase/provider";

import { getFirebaseAuthErrorMessage } from "../../lib/firebase/errors";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export default function GoogleAuthButton({
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.debug("[Auth] Google sign in failed:", error);
      if (onError) onError(getFirebaseAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      className="flex items-center justify-center w-full h-[48px] px-4 border border-[#E2D5C1] bg-[#FFFDF8] hover:bg-[#F8F4EC] text-[#21170F] rounded-xl font-medium text-sm transition-all shadow-sm outline-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center justify-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#A66A22]"
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
          <span className="text-xs font-semibold text-[#A66A22]">Connecting to Google...</span>
        </span>
      ) : (
        <span className="flex items-center space-x-3">
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.727 5.727 0 0 1 8.2 12.8a5.727 5.727 0 0 1 5.79-5.735c1.47 0 2.805.518 3.864 1.54l3.155-3.155C19.035 3.527 16.275 2.4 13.99 2.4a9.6 9.6 0 0 0-9.6 9.6a9.6 9.6 0 0 0 9.6 9.6c5.364 0 9.518-3.777 9.518-9.6c0-.65-.082-1.285-.245-1.915H12.24Z"
            />
          </svg>
          <span className="font-semibold text-sm text-[#21170F]/90">Continue with Google</span>
        </span>
      )}
    </button>
  );
}
