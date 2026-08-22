"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/provider";
import {
  Scale,
  LayoutDashboard,
  Sparkles,
  PlayCircle,
  History,
  Users,
  Bell,
  User,
  Briefcase,
  CheckSquare,
  Network,
  MessageSquare,
  GraduationCap,
  ShieldCheck,
  Activity,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  role: "STUDENT" | "LAWYER" | "ADMIN" | null;
  onClose?: () => void;
}

export default function Sidebar({ role, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const getLinks = () => {
    switch (role) {
      case "STUDENT":
        return [
          { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { label: "AI Legal Assistant", href: "/student/assistant", icon: Sparkles },
          { label: "Case Simulator", href: "/student/simulator", icon: PlayCircle },
          { label: "Practice History", href: "/student/practice", icon: History },
          { label: "Community", href: "/student/community", icon: Users },
          { label: "Notifications", href: "/student/notifications", icon: Bell },
          { label: "Profile", href: "/student/profile", icon: User },
        ];
      case "LAWYER":
        return [
          { label: "Dashboard", href: "/lawyer/dashboard", icon: LayoutDashboard },
          { label: "My Cases", href: "/lawyer/cases", icon: Briefcase },
          { label: "Hearings", href: "/lawyer/hearings", icon: Scale },
          { label: "Tasks", href: "/lawyer/tasks", icon: CheckSquare },
          { label: "AI Legal Assistant", href: "/lawyer/assistant", icon: Sparkles },
          { label: "Collaboration", href: "/lawyer/collaboration", icon: Network },
          { label: "Messages", href: "/lawyer/messages", icon: MessageSquare },
          { label: "Notifications", href: "/lawyer/notifications", icon: Bell },
          { label: "Profile", href: "/lawyer/profile", icon: User },
        ];
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: Users },
          { label: "Students", href: "/admin/students", icon: GraduationCap },
          { label: "Lawyers", href: "/admin/lawyers", icon: ShieldCheck },
          { label: "System Activity", href: "/admin/activity", icon: Activity },
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <div className="w-64 h-full bg-[#FFFDF8] border-r border-[#E2D5C1] flex flex-col justify-between shadow-sm">
      {/* Brand Section */}
      <div>
        <div className="h-16 px-6 border-b border-[#E2D5C1] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-[#21170F] text-[#D9B16A] flex items-center justify-center border border-[#A66A22]/30 shadow-sm">
              <Scale className="w-4.5 h-4.5" />
            </div>
            <span className="font-serif text-lg tracking-tight font-bold text-[#21170F]">
              LEX<span className="text-[#A66A22]">CONNECT</span>
            </span>
          </Link>
        </div>

        {/* Links List */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-[#A66A22]/10 text-[#A66A22] border border-[#A66A22]/20 shadow-xs"
                    : "text-[#766B5F] hover:text-[#21170F] hover:bg-[#F8F4EC] border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#A66A22]" : "text-[#766B5F]"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-[#E2D5C1] space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#A66A22]/10 border border-[#A66A22]/20 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[#A66A22]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#21170F] truncate">{user.name}</p>
              <p className="text-[10px] font-semibold text-[#766B5F] uppercase tracking-wider">
                {role}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (onClose) onClose();
            signOut();
          }}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 border border-[#E2D5C1] rounded-xl text-xs font-bold text-[#766B5F] hover:text-[#21170F] hover:bg-[#F8F4EC] transition-all"
        >
          <LogOut className="w-4 h-4 text-[#766B5F]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
