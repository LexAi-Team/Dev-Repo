"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

interface AppShellProps {
  role: "STUDENT" | "LAWYER" | "ADMIN" | null;
  children: React.ReactNode;
}

export default function AppShell({ role, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-[#21170F] flex overflow-hidden">
      {/* Desktop Sidebar (visible on screens large and above, collapsible) */}
      <div
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          isDesktopSidebarCollapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-64"
        }`}
      >
        <Sidebar role={role} />
      </div>

      {/* Mobile Drawer Sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#21170F]/40 backdrop-blur-xs z-50 lg:hidden animate-fade-in">
          <div className="fixed inset-y-0 left-0 w-64 h-full shadow-2xl">
            <Sidebar role={role} onClose={() => setIsSidebarOpen(false)} />
          </div>
          {/* Overlay Click Area to dismiss menu */}
          <div className="w-full h-full" onClick={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* App Main Shell Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar navigation panel */}
        <Topbar
          onMenuToggle={() => setIsSidebarOpen(true)}
          isDesktopSidebarCollapsed={isDesktopSidebarCollapsed}
          onToggleDesktopSidebar={toggleDesktopSidebar}
        />

        {/* Dynamic page contents scrollable area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full mx-auto transition-all duration-300 ${
            isDesktopSidebarCollapsed ? "max-w-none" : "max-w-7xl"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
