"use client";

import React from "react";
import { Download, RefreshCw } from "lucide-react";
import type { AuditReportJSON } from "@/data/honeyPotFallback";

interface TelemetryBarProps {
  report: AuditReportJSON | null;
  onDownloadPlan: () => void;
  onRerunAudit: () => void;
  onTriggerFallback?: () => void;
  onOpenUpload?: () => void;
}

export default function TelemetryBar({
  report,
  onDownloadPlan,
  onRerunAudit,
}: TelemetryBarProps) {
  const telemetry = report?.telemetry;

  return (
    <div className="h-10 bg-[#111115] border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0 text-xs">
      {/* Left: Telemetry Metrics */}
      <div className="flex items-center gap-3.5">
        {/* Faithfulness Score Pill */}
        <div className="flex items-center gap-1.5 border border-emerald-700/50 bg-emerald-950/40 rounded-full px-2.5 py-0.5">
          <span className="text-emerald-400 text-[10.5px] font-semibold tracking-wide">
            FAITHFULNESS SCORE:{" "}
            <span className="font-bold">{telemetry?.faithfulnessScore ?? "93.4%"}</span>
          </span>
        </div>

        <span className="text-zinc-400 text-[11px] font-medium">
          REVIEW LATENCY:{" "}
          <span className="text-white font-bold">{telemetry?.reviewLatency ?? "4.2s"}</span>
        </span>

        <span className="text-zinc-400 text-[11px] font-medium hidden sm:inline">
          RERANKING:{" "}
          <span className="text-white font-bold">{telemetry?.rerankingLatency ?? "~380ms"}</span>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onDownloadPlan}
          className="flex items-center gap-1.5 bg-[#17171c] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium px-3 py-1 rounded transition-colors shadow-sm cursor-pointer"
        >
          <Download size={13} className="text-zinc-400" />
          <span>Download Improvement Plan (PDF)</span>
        </button>

        <button
          onClick={onRerunAudit}
          className="flex items-center gap-1.5 bg-[#17171c] hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-[11px] font-medium px-3 py-1 rounded transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw size={12} className="text-zinc-400" />
          <span>Rerun Audit</span>
        </button>
      </div>
    </div>
  );
}
