"use client";

import AuthBrandPanel from "./auth-brand-panel";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#F8F4EC]">
      {/* Brand Panel (Hidden on Mobile) */}
      <AuthBrandPanel />

      {/* Auth Content Panel */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 min-h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-[440px] space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
