"use client";

import React from "react";
import { FileDown, X } from "lucide-react";
import type { ViolationItem } from "@/data/honeyPotFallback";

interface ImprovementPlanBarProps {
  findings: ViolationItem[];
  onDownload: () => void;
  visible: boolean;
  onDismiss: () => void;
}

export default function ImprovementPlanBar({
  findings,
  onDownload,
  visible,
  onDismiss,
}: ImprovementPlanBarProps) {
  if (!visible) return null;

  const fixes = findings.filter(
    (f) => f.includedInPlan && f.type !== "OMISSION"
  ).length;
  const omissions = findings.filter(
    (f) => f.includedInPlan && f.type === "OMISSION"
  ).length;

  return (
    <div className="h-10 bg-[#111115] border-t border-zinc-800 flex items-center justify-between px-3.5 flex-shrink-0 z-10 text-xs">
      <div className="flex items-center gap-2">
        <FileDown size={14} className="text-zinc-400" />
        <span className="text-white text-[11px] font-bold uppercase tracking-wider">
          Improvement Plan
        </span>
        <span className="text-zinc-400 text-[11px] ml-1">
          Draft PDF Ready ({fixes} Fixes, {omissions} Omission Appended)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          className="bg-[#17171c] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors shadow-sm cursor-pointer"
        >
          Download .PDF
        </button>
        <button
          onClick={onDismiss}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
          title="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
