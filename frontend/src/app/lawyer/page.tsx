"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LawyerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lawyer/dashboard");
  }, [router]);

  return null;
}
