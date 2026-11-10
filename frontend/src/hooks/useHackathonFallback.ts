// ──────────────────────────────────────────────────────────────
// PILLAR D — The Hackathon Fallback
// Hidden Ctrl+Shift+F shortcut loads pre-calculated JSON instantly
// ──────────────────────────────────────────────────────────────
"use client";

import { useEffect, useCallback, useState } from "react";
import { HONEY_POT_FALLBACK_JSON, type AuditReportJSON } from "@/data/honeyPotFallback";

export function useHackathonFallback() {
  // Start with clean initial state for real user uploads.
  // Fallback preset can be triggered anytime via Ctrl+Shift+F or demo presets.
  const [report, setReport] = useState<AuditReportJSON | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  const activateFallback = useCallback(() => {
    setReport(HONEY_POT_FALLBACK_JSON);
    setIsFallbackActive(true);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 1200);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Supports Ctrl + Shift + F and Cmd + Shift + F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        activateFallback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activateFallback]);

  return { report, setReport, showFlash, isFallbackActive, activateFallback };
}

