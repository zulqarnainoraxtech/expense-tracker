"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaRegistrar() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("[PWA] Service Worker registration failed:", err);
        });
    }

    // Check if running as installed standalone PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari standalone check
      window.navigator.standalone === true
    ) {
      setIsStandalone(true);
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Don't show if already in standalone app mode or dismissed or prompt not available
  if (isStandalone || isDismissed || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-emerald-500/30 bg-[#0c1424] p-4 shadow-2xl shadow-emerald-950/40 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-[#00d68f] text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Install Expense Tracker</h4>
            <p className="text-[11px] text-slate-400 truncate">Add to home screen for 1-tap offline access</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleInstallClick}
            className="h-8 px-3 text-xs font-bold"
          >
            Install
          </Button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-[#15223c] flex items-center justify-center transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
