"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Check,
  X,
  FileCheck,
  Trash2,
} from "lucide-react";
import {
  PRESET_AUDIT_REPORTS,
  HONEY_POT_FALLBACK_JSON,
  type AuditReportJSON,
} from "@/data/honeyPotFallback";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: AuditReportJSON, uploadedFile?: File | null) => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  onSelectReport,
}: UploadModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("honey-pot");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setSelectedPreset("custom");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStartAudit = () => {
    if (uploadedFile) {
      // Build realistic audit report with dummy violations placed on Page 1 of the uploaded document
      const customReport: AuditReportJSON = {
        targetDocumentName: uploadedFile.name,
        groundTruthPdfName: "DPDP_Act_2023_Official.pdf",
        totalPages: 10,
        telemetry: {
          faithfulnessScore: "92.6%",
          reviewLatency: "3.9s",
          rerankingLatency: "~340ms",
        },
        findings: [
          {
            id: `up-001-${Date.now()}`,
            cardNumber: 1,
            type: "CRITICAL_VIOLATION",
            title: "UNAUTHORIZED PURPOSE LIMITATION DRIFT",
            description: `Audit scan of '${uploadedFile.name}' identified clause permitting processing of user telemetry and identity logs beyond declared purpose without renewed statutory consent.`,
            suggestedRevision:
              '"Personal data shall solely be processed for the specific, informed, and lawful purpose stated during initial collection as mandated under statutory compliance."',
            sourceMatched: "DPDP Act Sec. 6(1)",
            pageNumber: 1,
            coordinates: {
              label: "Purpose Limitation Violation",
              exactCoord: 95,
              topPct: 24,
              leftPct: 7,
              widthPct: 86,
              heightPct: 18,
            },
            includedInPlan: true,
          },
          {
            id: `up-002-${Date.now()}`,
            cardNumber: 2,
            type: "VIOLATION",
            title: "NON-COMPLIANT INCIDENT ESCALATION WINDOW",
            description: `Target document '${uploadedFile.name}' specifies a 7-day notification window for data breaches, violating the statutory 72-hour board escalation mandate.`,
            suggestedRevision:
              '"In the event of a personal data breach, the data fiduciary shall intimate the Data Protection Board and each affected data principal within 72 hours."',
            sourceMatched: "DPDP Act Sec. 8(6)",
            pageNumber: 1,
            coordinates: {
              label: "Incident Escalation Window Gap",
              exactCoord: 142,
              topPct: 48,
              leftPct: 7,
              widthPct: 86,
              heightPct: 16,
            },
            includedInPlan: true,
          },
          {
            id: `up-003-${Date.now()}`,
            cardNumber: 3,
            type: "OMISSION",
            title: "MISSING DPO AUDIT GOVERNANCE CLAUSE",
            description: `Target document lacks required institutional governance provisions designating a Data Protection Officer based in India for regulatory liaison.`,
            suggestedRevision:
              '"A resident Data Protection Officer shall be appointed with direct reporting to senior governance and empowered to conduct quarterly compliance audits."',
            sourceMatched: "DPDP Act Sec. 10(2)",
            pageNumber: 1,
            coordinates: {
              label: "DPO Appointment Mandate",
              exactCoord: 210,
              topPct: 70,
              leftPct: 7,
              widthPct: 86,
              heightPct: 15,
            },
            includedInPlan: true,
          },
        ],
      };
      onSelectReport(customReport, uploadedFile);
    } else {
      const report =
        PRESET_AUDIT_REPORTS[selectedPreset] || HONEY_POT_FALLBACK_JSON;
      onSelectReport(report, null);
    }
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#121216] border border-zinc-800 rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-white text-base font-semibold mb-1">
          Upload Target Document for Audit
        </h3>
        <p className="text-zinc-400 text-xs mb-5">
          Upload your PDF to view it live with real-time adversarial violation highlights.
        </p>

        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Drag and Drop Zone / Selected File View */}
        {uploadedFile ? (
          <div className="border border-violet-500/60 bg-violet-950/20 rounded-lg p-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <FileCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[280px]">
                  {uploadedFile.name}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {formatFileSize(uploadedFile.size)} • Will render live with dummy violation bounding boxes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadedFile(null);
                  setSelectedPreset("honey-pot");
                }}
                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                title="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-5 ${
              dragActive
                ? "border-violet-500 bg-violet-950/20"
                : "border-zinc-700 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/60"
            }`}
          >
            <UploadCloud size={32} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-zinc-200 text-xs font-medium">
              Drag & drop target policy PDF, or{" "}
              <span className="text-violet-400 underline font-semibold">
                browse files
              </span>
            </p>
            <p className="text-zinc-500 text-[10px] mt-1">
              Supports .pdf, .docx, .txt (Max 50MB)
            </p>
          </div>
        )}

        {/* Demo Presets */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Or Choose Demo Preset
          </label>
          <div className="space-y-2">
            <button
              onClick={() => {
                setUploadedFile(null);
                setSelectedPreset("honey-pot");
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                selectedPreset === "honey-pot" && !uploadedFile
                  ? "border-violet-500/80 bg-violet-950/20 text-white"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-rose-400" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Honey-Pot_Data_Policy_2023.pdf
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    5 Discrepancies (Indefinite Retention, Breach SLA, DPO Omission)
                  </p>
                </div>
              </div>
              {selectedPreset === "honey-pot" && !uploadedFile && (
                <Check size={16} className="text-violet-400" />
              )}
            </button>

            <button
              onClick={() => {
                setUploadedFile(null);
                setSelectedPreset("fintech-lending");
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                selectedPreset === "fintech-lending" && !uploadedFile
                  ? "border-violet-500/80 bg-violet-950/20 text-white"
                  : "border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    NeoPay_Lending_Terms_2024.pdf
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    3 Discrepancies (Credit Graph Syndication, Minor Protection Gap)
                  </p>
                </div>
              </div>
              {selectedPreset === "fintech-lending" && !uploadedFile && (
                <Check size={16} className="text-violet-400" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartAudit}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded text-xs font-semibold shadow-lg shadow-violet-900/40 transition-all cursor-pointer"
          >
            {uploadedFile ? "Upload & Live View PDF" : "Run Adversarial Analysis"}
          </button>
        </div>
      </div>
    </div>
  );
}
