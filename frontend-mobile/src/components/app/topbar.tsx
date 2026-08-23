"use client";

import { Menu, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import NotificationButton from "./notification-button";
import UserMenu from "./user-menu";

interface TopbarProps {
  onMenuToggle: () => void;
  isDesktopSidebarCollapsed?: boolean;
  onToggleDesktopSidebar?: () => void;
}

export default function Topbar({
  onMenuToggle,
  isDesktopSidebarCollapsed,
  onToggleDesktopSidebar,
}: TopbarProps) {
  return (
    <header className="h-16 bg-[#FFFDF8] border-b border-[#E2D5C1] px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0">
      {/* Left side: Menu, Desktop Sidebar Toggle, and Search */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Drawer Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-[#766B5F] outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        {onToggleDesktopSidebar && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex items-center justify-center p-2 hover:bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-[#766B5F] hover:text-[#A66A22] transition-colors outline-none"
            title={isDesktopSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Navigation Sidebar"}
            aria-label={isDesktopSidebarCollapsed ? "Expand Navigation Sidebar" : "Collapse Navigation Sidebar"}
          >
            {isDesktopSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Global Search Bar mockup */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#766B5F]/60" />
          <input
            type="text"
            placeholder="Search cases, statutory provisions, or files..."
            className="w-80 h-9 pl-10 pr-4 text-xs font-semibold text-[#21170F] bg-[#F8F4EC]/50 border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22] placeholder:text-[#766B5F]/40"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Button mockup */}
        <button
          className="md:hidden p-2 hover:bg-[#F8F4EC] rounded-xl border border-[#E2D5C1] text-[#766B5F] outline-none"
          aria-label="Search"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        <NotificationButton />
        <UserMenu />
      </div>
    </header>
  );
}
