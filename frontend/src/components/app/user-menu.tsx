"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/provider";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const getRolePath = () => {
    switch (user.role) {
      case "STUDENT":
        return "/student";
      case "LAWYER":
        return "/lawyer";
      case "ADMIN":
        return "/admin";
      default:
        return "";
    }
  };

  const rolePath = getRolePath();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E2D5C1] hover:bg-[#F8F4EC] transition-all outline-none"
      >
        <div className="w-7 h-7 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/20 flex items-center justify-center overflow-hidden">
          {user.avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-[#A66A22]">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-[#21170F] leading-tight">{user.name}</p>
          <p className="text-[9px] font-semibold text-[#766B5F] uppercase tracking-wider leading-none mt-0.5">
            {user.role}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#766B5F]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl shadow-md py-1 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-[#E2D5C1]/40 sm:hidden">
            <p className="text-xs font-bold text-[#21170F]">{user.name}</p>
            <p className="text-[9px] font-semibold text-[#766B5F] uppercase tracking-wider mt-0.5">
              {user.role}
            </p>
          </div>

          <Link
            href={`${rolePath}/profile`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#766B5F] hover:text-[#21170F] hover:bg-[#F8F4EC] transition-colors"
          >
            <User className="w-4 h-4 text-[#766B5F]" />
            <span>Profile</span>
          </Link>

          <Link
            href={`${rolePath}/settings`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#766B5F] hover:text-[#21170F] hover:bg-[#F8F4EC] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#766B5F]" />
            <span>Settings</span>
          </Link>

          <div className="border-t border-[#E2D5C1]/40 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#A66A22] hover:bg-[#A66A22]/5 transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-[#A66A22]" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
