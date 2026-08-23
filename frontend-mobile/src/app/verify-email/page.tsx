"use client";

import AuthLayout from "@/components/auth/auth-layout";
import VerificationMessage from "@/components/auth/verification-message";

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <VerificationMessage />
    </AuthLayout>
  );
}
