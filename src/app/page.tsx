"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { jsPDF } from "jspdf";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TelemetryBar from "@/components/TelemetryBar";
import CriticFeed from "@/components/CriticFeed";
import ImprovementPlanBar from "@/components/ImprovementPlanBar";
import AuditProgressModal from "@/components/AuditProgressModal";
import UploadModal from "@/components/UploadModal";
import { useHackathonFallback } from "@/hooks/useHackathonFallback";
import {
  HONEY_POT_FALLBACK_JSON,
  type ViolationItem,
  type AuditReportJSON,
} from "@/data/honeyPotFallback";

// Dynamic import for PdfViewer with SSR disabled
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#121216] text-zinc-500 text-xs gap-2">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <span>Initializing Ground Truth Viewer...</span>
    </div>
  ),
});

export default function DashboardPage() {
  // ── PILLAR D: Hackathon Fallback ──
  const { report, setReport, showFlash, isFallbackActive, activateFallback } =
    useHackathonFallback();

  // ── PILLAR C: Focused violation for auto-scroll ──
  const [focusedViolation, setFocusedViolation] = useState<ViolationItem | null>(
    HONEY_POT_FALLBACK_JSON.findings[0]
  );
  const [currentPage, setCurrentPage] = useState<number>(4);
  const [showPlanBar, setShowPlanBar] = useState(true);

  // Uploaded PDF state
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedDocName, setUploadedDocName] = useState<string | null>(null);
  const [activeViewerTab, setActiveViewerTab] = useState<"uploaded" | "groundTruth">(
    "groundTruth"
  );

  // Modals for interactive demo
  const [isAuditing, setIsAuditing] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle plan inclusion for an item
  const handleTogglePlan = useCallback(
    (id: string) => {
      if (!report) return;
      setReport({
        ...report,
        findings: report.findings.map((f) =>
          f.id === id ? { ...f, includedInPlan: !f.includedInPlan } : f
        ),
      });
    },
    [report, setReport]
  );

  // Focus a violation → syncs page number & highlights bounding box
  const handleFocusGroundTruth = useCallback((v: ViolationItem) => {
    setFocusedViolation(v);
    setCurrentPage(v.pageNumber);
  }, []);

  // Rerun Audit pipeline simulation
  const handleRerunAudit = useCallback(() => {
    setIsAuditing(true);
  }, []);

  const handleAuditComplete = useCallback(() => {
    setIsAuditing(false);
    if (uploadedPdfUrl) {
      setActiveViewerTab("uploaded");
      setCurrentPage(1);
    } else {
      setActiveViewerTab("groundTruth");
      setCurrentPage(4);
    }
    showNotification("Adversarial Audit Completed: Violations successfully mapped!");
  }, [uploadedPdfUrl]);

  // Select new report / preset / uploaded file
  const handleSelectReport = useCallback(
    (newReport: AuditReportJSON, file?: File | null) => {
      if (file) {
        const objectUrl = URL.createObjectURL(file);
        setUploadedPdfUrl(objectUrl);
        setUploadedDocName(file.name);
        setActiveViewerTab("uploaded");
      } else {
        setUploadedPdfUrl(null);
        setUploadedDocName(null);
        setActiveViewerTab("groundTruth");
      }
      setReport(newReport);
      setFocusedViolation(newReport.findings[0]);
      setCurrentPage(newReport.findings[0]?.pageNumber || 1);
      setIsAuditing(true);
    },
    [setReport]
  );

  // ── PDF Export: Client-side jsPDF Generation ──
  const handleDownloadPlan = useCallback(() => {
    if (!report) return;

    const doc = new jsPDF();
    const included = report.findings.filter((f) => f.includedInPlan);

    // Document Header
    doc.setFillColor(13, 13, 16);
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("AuditRAG — STATUTORY IMPROVEMENT PLAN", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `Compliance Target: ${report.targetDocumentName} | Ground Truth: ${report.groundTruthPdfName}`,
      14,
      26
    );

    // Telemetry Summary Card
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(14, 42, 182, 22, 2, 2, "F");

    doc.setFontSize(9);
    doc.setTextColor(60, 60, 67);
    doc.text(
      `Faithfulness Score: ${report.telemetry.faithfulnessScore}   |   Review Latency: ${report.telemetry.reviewLatency}   |   Generated: ${new Date().toLocaleDateString()}`,
      20,
      55
    );

    let yPos = 74;

    included.forEach((item, idx) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 24;
      }

      const isCritical = item.type === "CRITICAL_VIOLATION";
      const isOmission = item.type === "OMISSION";

      doc.setFillColor(
        isCritical ? 254 : isOmission ? 254 : 255,
        isCritical ? 242 : isOmission ? 243 : 247,
        isCritical ? 242 : isOmission ? 199 : 237
      );
      doc.roundedRect(14, yPos, 45, 6.5, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(
        isCritical ? 225 : isOmission ? 180 : 217,
        isCritical ? 29 : isOmission ? 83 : 119,
        isCritical ? 72 : isOmission ? 9 : 6
      );
      doc.text(item.type.replace("_", " "), 17, yPos + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      doc.text(`${idx + 1}. ${item.title}`, 14, yPos + 13);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const descLines = doc.splitTextToSize(item.description, 178);
      doc.text(descLines, 14, yPos + 20);

      const revStartY = yPos + 22 + descLines.length * 4.5;

      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(14, revStartY, 182, 16, 1, 1, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text("STATUTORY REMEDIATION CLAUSE:", 18, revStartY + 5.5);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(20, 83, 45);
      const revLines = doc.splitTextToSize(item.suggestedRevision, 172);
      doc.text(revLines, 18, revStartY + 10.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(113, 113, 122);
      doc.text(
        `Ground Truth Citation: ${item.sourceMatched} (Page ${item.pageNumber}, coord #${item.coordinates.exactCoord})`,
        14,
        revStartY + 21
      );

      yPos = revStartY + 30;
    });

    doc.save(`AuditRAG_Improvement_Plan_${report.targetDocumentName.replace(".pdf", "")}.pdf`);
    showNotification("Improvement Plan PDF successfully generated and downloaded.");
  }, [report]);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#0a0a0c] relative select-none">
      {/* ── PILLAR D: Fallback Visual Flash ── */}
      {showFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none fallback-flash bg-emerald-500/10 border-4 border-emerald-500/40" />
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#16161c] text-white text-xs border border-zinc-700 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Left Sidebar Navigation Rail ── */}
      <Sidebar />

      {/* ── Main App Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Telemetry Status Bar */}
        <TelemetryBar
          report={report}
          onDownloadPlan={handleDownloadPlan}
          onRerunAudit={handleRerunAudit}
          onTriggerFallback={() => {
            setUploadedPdfUrl(null);
            setUploadedDocName(null);
            setActiveViewerTab("groundTruth");
            activateFallback();
            showNotification("⚡ Hackathon Fallback Re-engaged: DPDP Act Ground Truth Synced");
          }}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* ── PILLAR A: Split-Pane Workspace ── */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Left Pane: Adversarial Critic Feed (45%) */}
          <div className="w-[45%] flex flex-col border-r border-zinc-800 bg-[#121216] min-h-0 relative">
            <CriticFeed
              report={report}
              focusedViolationId={focusedViolation?.id ?? null}
              onFocusGroundTruth={handleFocusGroundTruth}
              onTogglePlan={handleTogglePlan}
              onOpenUpload={() => setIsUploadOpen(true)}
            />

            {/* Improvement Plan Bottom Bar */}
            {report && (
              <ImprovementPlanBar
                findings={report.findings}
                onDownload={handleDownloadPlan}
                visible={showPlanBar}
                onDismiss={() => setShowPlanBar(false)}
              />
            )}
          </div>

          {/* Right Pane: Live PDF Viewer (55%) */}
          <div className="flex-1 flex flex-col bg-[#121216] min-h-0 relative">
            <PdfViewer
              pdfUrl={isFallbackActive ? "/DPDP_Act_2023_Official.pdf" : null}
              uploadedPdfUrl={uploadedPdfUrl}
              uploadedDocName={uploadedDocName}
              targetDocName={report?.targetDocumentName}
              groundTruthPdfName={report?.groundTruthPdfName ?? "DPDP_Act_2023_Official.pdf"}
              totalPages={report?.totalPages ?? 28}
              focusedViolation={focusedViolation}
              allViolations={report?.findings ?? []}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              activeTab={activeViewerTab}
              onTabChange={setActiveViewerTab}
            />

            {/* Visual Bezier Connector when Card #1 is focused on Page 4 in Ground Truth view */}
            {activeViewerTab === "groundTruth" &&
              focusedViolation?.cardNumber === 1 &&
              currentPage === 4 && (
                <svg
                  className="absolute inset-0 pointer-events-none z-40 w-full h-full hidden xl:block"
                  style={{ overflow: "visible" }}
                >
                  <path
                    d="M -30 220 C 40 220, 80 340, 150 340"
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="opacity-75"
                  />
                  <circle cx="150" cy="340" r="3" fill="#e11d48" />
                </svg>
              )}
          </div>
        </div>
      </div>

      {/* ── Interactive Modals ── */}
      <AuditProgressModal
        isOpen={isAuditing}
        onComplete={handleAuditComplete}
        targetDocName={report?.targetDocumentName ?? "Honey-Pot_Data_Policy_2023.pdf"}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectReport={handleSelectReport}
      />
    </div>
  );
}
