"use client";

import { useAuth } from "@/lib/firebase/provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AppShell from "@/components/app/app-shell";

export default function LawyerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "LAWYER") {
        if (user?.role === "STUDENT") router.push("/student/dashboard");
        else if (user?.role === "ADMIN") router.push("/admin/dashboard");
        else router.push("/register");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== "LAWYER") {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#A66A22] animate-spin" />
      </div>
    );
  }

  return <AppShell role="LAWYER">{children}</AppShell>;
}
