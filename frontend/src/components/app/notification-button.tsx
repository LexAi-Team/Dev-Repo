"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Bell, Check, Info } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await api.getNotifications();
        if (active && response && response.status === "success") {
          setNotifications((response.data.notifications as NotificationItem[]) || []);
        }
      } catch (err) {
        console.debug("[Notifications] Fetch failed:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const el = dropdownRef.current;
    function handleClickOutside(event: MouseEvent) {
      if (el && !el.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.debug("[Notifications] Mark read failed:", err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2D5C1] hover:bg-[#F8F4EC] transition-all outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-[#766B5F]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A66A22] text-[#FFFDF8] text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl shadow-md overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-[#E2D5C1]/40 flex items-center justify-between">
            <span className="text-xs font-bold text-[#21170F] uppercase tracking-wider">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-[#A66A22] bg-[#A66A22]/10 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[#E2D5C1]/30">
            {loading ? (
              <div className="p-4 text-center text-xs text-[#766B5F] font-semibold">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-[#E2D5C1]/20 flex items-center justify-center mx-auto">
                  <Info className="w-4.5 h-4.5 text-[#766B5F]/60" />
                </div>
                <p className="text-xs font-bold text-[#21170F]">All caught up!</p>
                <p className="text-[10px] text-[#766B5F] font-medium leading-relaxed">
                  No notifications are currently pending.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3.5 transition-colors ${
                    notification.isRead ? "bg-transparent" : "bg-[#A66A22]/5"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#21170F] leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-[10px] text-[#766B5F] leading-relaxed mt-0.5 font-medium">
                        {notification.message}
                      </p>
                      <span className="text-[9px] text-[#766B5F]/60 font-semibold block mt-1.5">
                        {new Date(notification.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="w-5 h-5 flex items-center justify-center rounded-md border border-[#E2D5C1] hover:bg-[#A66A22] hover:text-[#FFFDF8] hover:border-transparent transition-all outline-none"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
