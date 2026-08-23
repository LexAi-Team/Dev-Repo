"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";

export default function CapacitorBackButton() {
  useEffect(() => {
    let handler: { remove: () => void } | null = null;
    async function initBackButton() {
      try {
        handler = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch (err) {
        // Safe fallback when running in browser mode without native Capacitor bridge
        console.debug("[CapacitorBackButton] Web mode or bridge not available:", err);
      }
    }
    initBackButton();
    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  return null;
}
