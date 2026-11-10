"use client";

import React from "react";
import { ChevronUp, ChevronDown, Wrench, Eye } from "lucide-react";
import type { ViolationItem } from "@/data/honeyPotFallback";

const TYPE_STYLES: Record<
  ViolationItem["type"],
  {
    border: string;
    bg: string;
    pillBg: string;
    pillBorder: string;
    pillText: string;
  }
> = {
  CRITICAL_VIOLATION: {
    border: "border-rose-900/60",
    bg: "bg-[#141014]",
    pillBg: "bg-rose-950/50",
    pillBorder: "border-rose-800/60",
    pillText: "text-rose-300",
  },
  VIOLATION: {
    border: "border-rose-950/40",
    bg: "bg-[#131115]",
    pillBg: "bg-rose-950/40",
    pillBorder: "border-rose-900/50",
    pillText: "text-rose-300",
  },
  OMISSION: {
    border: "border-amber-950/40",
    bg: "bg-[#131210]",
    pillBg: "bg-amber-950/40",
    pillBorder: "border-amber-800/50",
    pillText: "text-amber-300",
  },
};

function formatShortFix(text: string) {
  const cleaned = text.replace(/^["']|["']$/g, "").trim();
  if (cleaned.length <= 85) return cleaned;
  return cleaned.slice(0, 82) + "...";
}

interface ViolationCardProps {
  violation: ViolationItem;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFocusGroundTruth: (v: ViolationItem) => void;
  onTogglePlan?: (id: string) => void;
}

export default function ViolationCard({
  violation,
  isSelected,
  isExpanded,
  onToggleExpand,
  onFocusGroundTruth,
}: ViolationCardProps) {
  const style = TYPE_STYLES[violation.type];

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-150 ${
        isSelected
          ? `${style.border} ${style.bg}`
          : "border-zinc-800/80 bg-[#111116] hover:border-zinc-700"
      }`}
    >
      {/* Card Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span
          className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border ${style.pillBg} ${style.pillBorder} ${style.pillText} uppercase`}
        >
          {violation.type === "CRITICAL_VIOLATION"
            ? `CRITICAL VIOLATION: ${violation.title}`
            : violation.type === "VIOLATION"
            ? `VIOLATION: ${violation.title}`
            : `OMISSION: ${violation.title}`}
        </span>

        <span className="text-zinc-500 hover:text-zinc-300 ml-2">
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Expanded Concise View — Clean UI without checkbox or nested bulky boxes */}
      {isExpanded ? (
        <div className="px-3.5 pb-3 space-y-2 pt-0.5">
          {/* Violation in Short */}
          <p className="text-zinc-300 text-xs leading-relaxed">
            {violation.description}
          </p>

          {/* Improvement in Short */}
          <div className="flex items-center gap-2 bg-[#16161d] border border-zinc-800/80 rounded px-2.5 py-1.5 text-xs">
            <Wrench size={12} className="text-emerald-400 flex-shrink-0" />
            <span className="text-emerald-400 font-semibold text-[11px]">Fix:</span>
            <span className="text-zinc-200 text-[11px] truncate">
              {formatShortFix(violation.suggestedRevision)}
            </span>
          </div>

          {/* Clean Citation & Focus Action */}
          <div className="flex items-center justify-between pt-0.5 text-[11px]">
            <span className="text-zinc-500">
              Citation:{" "}
              <span className="text-zinc-300 font-medium">
                {violation.sourceMatched}
              </span>
            </span>

            <button
              onClick={() => onFocusGroundTruth(violation)}
              className="flex items-center gap-1.5 bg-[#17171d] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-[11px] font-medium px-2.5 py-1 rounded transition-colors shadow-sm cursor-pointer"
            >
              <Eye size={12} className="text-violet-400" />
              <span>Focus Ground Truth</span>
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed Clean 1-Line Preview */
        <div
          onClick={onToggleExpand}
          className="px-3.5 pb-2 pt-0.5 text-xs text-zinc-400 cursor-pointer hover:bg-white/[0.01]"
        >
          <p className="text-zinc-300 text-[11.5px] truncate">
            {violation.description}
          </p>
        </div>
      )}
    </div>
  );
}
