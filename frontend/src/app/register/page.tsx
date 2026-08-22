"use client";

import AuthLayout from "@/components/auth/auth-layout";
import SignupForm from "@/components/auth/signup-form";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}
