"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";

interface AuditProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
  targetDocName: string;
}

const PIPELINE_STEPS = [
  {
    title: "Document Ingestion & Chunking",
    desc: "Extracting semantic tokens and hierarchy from target policy",
    duration: 800,
  },
  {
    title: "Dense Vector Embedding Retrieval",
    desc: "Querying statutory index over DPDP Act 2023 Gazette corpus",
    duration: 900,
  },
  {
    title: "Cross-Encoder Reranking",
    desc: "Computing pairwise relevance scores (~380ms latency)",
    duration: 700,
  },
  {
    title: "Adversarial Critic Synthesis",
    desc: "Synthesizing statutory contradictions and negative-space omissions",
    duration: 900,
  },
  {
    title: "Ground Truth Citation Mapping",
    desc: "Aligning exact Gazette coordinates & generating Improvement Plan",
    duration: 600,
  },
];

export default function AuditProgressModal({
  isOpen,
  onComplete,
  targetDocName,
}: AuditProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    let step = 0;
    const runNextStep = () => {
      if (step < PIPELINE_STEPS.length - 1) {
        step += 1;
        setCurrentStep(step);
        setTimeout(runNextStep, PIPELINE_STEPS[step].duration);
      } else {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    };

    const timer = setTimeout(runNextStep, PIPELINE_STEPS[0].duration);
    return () => clearTimeout(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPercent = Math.min(
    100,
    Math.round(((currentStep + 1) / PIPELINE_STEPS.length) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#121216] border border-zinc-800 rounded-xl shadow-2xl p-6 overflow-hidden relative">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
            <Sparkles size={20} className="text-violet-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-white text-base font-semibold">
              Running Adversarial Audit
            </h3>
            <p className="text-zinc-400 text-xs">
              Target: <span className="text-zinc-200 font-mono">{targetDocName}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-400 font-medium">Pipeline Execution</span>
            <span className="text-violet-400 font-mono font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-violet-950/20 border-violet-500/40"
                    : isDone
                    ? "bg-zinc-900/50 border-zinc-800"
                    : "opacity-40 border-transparent"
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 size={16} className="text-violet-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-500">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-white"
                        : isDone
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info badge */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-zinc-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            DPDP Act 2023 Statutory Corpus
          </span>
          <span className="font-mono">RAG Faithfulness Target &gt;90%</span>
        </div>
      </div>
    </div>
  );
}

