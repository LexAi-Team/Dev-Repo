"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/provider";
import { User, Bell, Shield, Eye, Save } from "lucide-react";
import PageHeader from "@/components/app/page-header";

export default function SettingsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "security" | "appearance">("account");
  const [loading, setLoading] = useState(false);

  // Settings State mockups
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Settings updated successfully (UI simulation).");
    }, 1000);
  };

  const tabs = [
    { id: "account", label: "Account Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Access", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Eye },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your LEXCONNECT account preferences and system configuration."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left outline-none ${
                  isActive
                    ? "bg-[#A66A22]/10 text-[#A66A22] border border-[#A66A22]/20 shadow-xs"
                    : "text-[#766B5F] hover:text-[#21170F] hover:bg-[#FFFDF8] border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-3 bg-[#FFFDF8] border border-[#E2D5C1] rounded-3xl p-6 shadow-xs">
          {/* Account Profile Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-1">
                  Ecosystem Profile
                </h3>
                <p className="text-xs text-[#766B5F] font-semibold">
                  Personalize your workspace visibility.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#21170F]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || ""}
                    className="block w-full h-[44px] px-3 text-xs font-semibold text-[#21170F] bg-[#F8F4EC]/40 border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#21170F]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="block w-full h-[44px] px-3 text-xs font-semibold text-[#766B5F] bg-[#E2D5C1]/20 border border-[#E2D5C1] rounded-xl outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-1">
                  Alert Preferences
                </h3>
                <p className="text-xs text-[#766B5F] font-semibold">
                  Configure real-time communication toggles.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#E2D5C1]/30">
                  <div>
                    <p className="text-xs font-bold text-[#21170F]">Email Notifications</p>
                    <p className="text-[10px] text-[#766B5F] font-medium leading-relaxed">
                      Receive statutory outlines and landmark judgment alerts via email.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4.5 h-4.5 accent-[#A66A22]"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E2D5C1]/30">
                  <div>
                    <p className="text-xs font-bold text-[#21170F]">Push Notifications</p>
                    <p className="text-[10px] text-[#766B5F] font-medium leading-relaxed">
                      Receive hearing updates, task reminders, and private message notifications.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="w-4.5 h-4.5 accent-[#A66A22]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-1">
                  Access & Security
                </h3>
                <p className="text-xs text-[#766B5F] font-semibold">
                  Authentication parameters are managed by Firebase credentials securely.
                </p>
              </div>

              <div className="p-4 bg-[#A66A22]/5 border border-[#A66A22]/20 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#A66A22] uppercase tracking-wider">
                  Firebase Identity Manager
                </h4>
                <p className="text-xs text-[#766B5F] leading-relaxed">
                  Your password resets, credential verification keys, and multi-factor authentications are protected natively under the LEXCONNECT Firebase instance. If you need to reset your access key, you can do so through the <span className="font-bold text-[#21170F]">Forgot Password</span> page link during sign-in.
                </p>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#21170F] uppercase tracking-wider mb-1">
                  Ecosystem Aesthetics
                </h3>
                <p className="text-xs text-[#766B5F] font-semibold">
                  Customize the presentation density.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#21170F]">
                    Theme Palette
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="block w-full h-[44px] px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
                  >
                    <option value="light">LEXCONNECT Light (Cream #F8F4EC)</option>
                    <option value="dark">LEXCONNECT Dark (Obsidian mockup)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#21170F]">
                    Text Sizing
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="block w-full h-[44px] px-3 text-xs font-semibold text-[#21170F] bg-[#FFFDF8] border border-[#E2D5C1] rounded-xl outline-none focus:ring-1 focus:ring-[#A66A22] focus:border-[#A66A22]"
                  >
                    <option value="small">Comfortable (Small)</option>
                    <option value="medium">Standard (Medium)</option>
                    <option value="large">Spacious (Large)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="mt-8 pt-5 border-t border-[#E2D5C1]/40 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-11 px-6 bg-[#A66A22] hover:bg-[#C58A35] text-[#FFFDF8] rounded-xl font-bold text-xs transition-all shadow-xs active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Saving..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
