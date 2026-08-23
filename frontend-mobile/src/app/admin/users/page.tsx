"use client";

import PolishedPlaceholderPage from "@/components/dashboard/polished-placeholder";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <PolishedPlaceholderPage
      title="User Accounts Management"
      description="Inspect all platform accounts, edit system settings, and manage user roles."
      icon={Users}
    />
  );
}
