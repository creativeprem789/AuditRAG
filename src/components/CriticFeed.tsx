"use client";

import React, { useState } from "react";
import { Upload } from "lucide-react";
import type { AuditReportJSON, ViolationItem } from "@/data/honeyPotFallback";
import ViolationCard from "./ViolationCard";

interface CriticFeedProps {
  report: AuditReportJSON | null;
  focusedViolationId: string | null;
  onFocusGroundTruth: (v: ViolationItem) => void;
  onTogglePlan: (id: string) => void;
  onOpenUpload: () => void;
}

export default function CriticFeed({
  report,
  focusedViolationId,
  onFocusGroundTruth,
  onTogglePlan,
  onOpenUpload,
}: CriticFeedProps) {
  // Only the active/focused card is expanded by default (Card #1) to keep the UI clean
  const [expandedId, setExpandedId] = useState<string | null>("cv-001");

  const handleCardClick = (v: ViolationItem) => {
    setExpandedId((prev) => (prev === v.id ? null : v.id));
    onFocusGroundTruth(v);
  };

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-4 p-8">
        <div
          onClick={onOpenUpload}
          className="w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-violet-500 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Upload size={28} className="text-zinc-500 hover:text-violet-400" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-zinc-300">
            No Audit Report Loaded
          </p>
          <p className="text-xs text-zinc-500 max-w-[280px]">
            Upload a target document to begin adversarial audit, or press{" "}
            <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono">
              Ctrl+Shift+F
            </kbd>{" "}
            to engage hackathon demo mode.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-3 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <Upload size={13} />
            <span>Upload Target Document (PDF)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2.5 relative">
      {/* Header with Upload/Change PDF option moved to the empty red circled area */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-white text-[12px] font-bold tracking-wider uppercase font-sans">
            Adversarial Critic Feed
          </h2>
          <p className="text-zinc-400 text-xs mt-0.5">
            Target:{" "}
            <span className="text-zinc-200 font-medium">
              {report.targetDocumentName.replace(/_/g, " ").replace(".pdf", "")}
            </span>
          </p>
        </div>

        {/* Upload / Change PDF option (Empty red circled area) */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 bg-[#17171d] hover:bg-zinc-800 border border-zinc-700/80 hover:border-violet-500/60 text-zinc-200 hover:text-white px-2.5 py-1 rounded text-[11px] font-medium transition-all shadow-sm cursor-pointer group"
          title="Upload or change target PDF"
        >
          <Upload size={12} className="text-violet-400 group-hover:text-violet-300" />
          <span>Upload / Change PDF</span>
        </button>
      </div>

      {/* Dynamic Violation Cards */}
      <div className="space-y-2.5">
        {report.findings.map((v) => (
          <ViolationCard
            key={v.id}
            violation={v}
            isSelected={focusedViolationId === v.id}
            isExpanded={expandedId === v.id}
            onToggleExpand={() => handleCardClick(v)}
            onFocusGroundTruth={onFocusGroundTruth}
            onTogglePlan={onTogglePlan}
          />
        ))}
      </div>
    </div>
  );
}
