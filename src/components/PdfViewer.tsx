"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
} from "lucide-react";
import type { ViolationItem } from "@/data/honeyPotFallback";

// Local worker for 100% offline reliability
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PdfViewerProps {
  pdfUrl: string | null;
  uploadedPdfUrl: string | null;
  uploadedDocName: string | null;
  targetDocName?: string;
  groundTruthPdfName: string;
  totalPages: number;
  focusedViolation: ViolationItem | null;
  allViolations: ViolationItem[];
  currentPage: number;
  onPageChange: (page: number) => void;
  activeTab: "uploaded" | "groundTruth";
  onTabChange: (tab: "uploaded" | "groundTruth") => void;
}

export default function PdfViewer({
  pdfUrl,
  uploadedPdfUrl,
  uploadedDocName,
  targetDocName,
  groundTruthPdfName,
  totalPages,
  focusedViolation,
  allViolations,
  currentPage,
  onPageChange,
  activeTab,
  onTabChange,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(totalPages || 28);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  const isViewingUploaded = activeTab === "uploaded" && Boolean(uploadedPdfUrl);
  const currentDisplayUrl = isViewingUploaded ? uploadedPdfUrl : pdfUrl;

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
    },
    []
  );

  // Auto-scroll when focused violation changes
  useEffect(() => {
    if (!focusedViolation) return;
    onPageChange(focusedViolation.pageNumber);

    requestAnimationFrame(() => {
      if (pageContainerRef.current) {
        pageContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  }, [focusedViolation, onPageChange]);

  const goToPage = (p: number) => {
    const validPage = Math.max(1, Math.min(p, numPages));
    onPageChange(validPage);
  };

  const currentPageViolations = allViolations.filter(
    (v) => v.pageNumber === currentPage
  );

  return (
    <div className="flex flex-col h-full bg-[#121216]">
      {/* Clean Viewer Header matching reference screenshot */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-[#121216] flex items-center justify-between">
        <h2 className="text-white text-xs font-bold tracking-wider uppercase">
          Ground Truth Reference Viewer
        </h2>

        {/* Discreet Document Switcher only if an uploaded PDF exists */}
        {uploadedPdfUrl && (
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => onTabChange("groundTruth")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTab === "groundTruth"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Ground Truth
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => onTabChange("uploaded")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeTab === "uploaded"
                  ? "bg-violet-950/80 text-violet-200 border border-violet-700/50 font-medium"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Uploaded Doc
            </button>
          </div>
        )}
      </div>

      {/* PDF Document Tab (Green Circled Area: Shows Target/Uploaded PDF Name) */}
      <div className="px-4 py-1.5 border-b border-zinc-800 bg-[#0f0f13]">
        <div className="inline-flex items-center gap-2 text-zinc-300 text-xs bg-[#17171d] px-2.5 py-1 rounded border border-zinc-800 font-mono">
          <FileText size={12} className="text-violet-400" />
          <span>{uploadedDocName || targetDocName || groundTruthPdfName}</span>
        </div>
      </div>

      {/* Clean Toolbar — Only working navigation & zoom controls */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-800 bg-[#0f0f13] text-xs">
        {/* Left: Working Page Navigation */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500 text-[11px]">Page</span>
          <input
            type="number"
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="w-7 bg-zinc-800 border border-zinc-700 text-white text-[11px] text-center rounded px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-zinc-400 text-[11px]">
            {currentPage} of {numPages}
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Right: Working Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(1))))}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(1.8, Number((s + 0.1).toFixed(1))))}
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <span className="text-zinc-400 text-[11px] min-w-[34px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
        </div>
      </div>

      {/* PDF Rendering Surface */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#18181c] flex justify-center p-6"
      >
        <div
          ref={pageContainerRef}
          className="relative transition-transform duration-150 origin-top"
          style={{ transform: `scale(${scale})` }}
        >
          {isViewingUploaded && currentDisplayUrl ? (
            /* Uploaded PDF view */
            <Document
              file={currentDisplayUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="w-[620px] h-[820px] bg-white border border-zinc-300 flex flex-col items-center justify-center text-zinc-700 text-xs gap-3">
                  <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading PDF...</span>
                </div>
              }
            >
              <div className="relative shadow-2xl border border-zinc-300 bg-white">
                <Page
                  pageNumber={currentPage}
                  scale={1.0}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />

                {/* Bounding Box Overlays */}
                {currentPageViolations.map((v) => (
                  <div
                    key={v.id}
                    className="violation-bbox absolute rounded transition-all duration-300 pointer-events-auto"
                    style={{
                      top: `${v.coordinates.topPct}%`,
                      left: `${v.coordinates.leftPct}%`,
                      width: `${v.coordinates.widthPct}%`,
                      height: `${v.coordinates.heightPct}%`,
                      backgroundColor: "rgba(244, 63, 94, 0.2)",
                      border: "2px dashed #e11d48",
                    }}
                  >
                    <div className="absolute -top-10 left-0 z-30 bg-[#121216] text-white border border-zinc-700 rounded px-2 py-0.5 shadow-xl text-[10px]">
                      <span className="font-semibold text-rose-300">
                        {v.coordinates.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Document>
          ) : (
            /* High-Precision Gazette Surface for Ground Truth */
            <div className="w-[620px] min-h-[820px] bg-white text-zinc-900 p-10 shadow-2xl font-serif text-[12px] leading-relaxed relative select-text border border-zinc-300">
              {/* Gazette Running Header */}
              <div className="flex justify-between items-center text-[11px] text-zinc-700 pb-1 mb-1 font-sans">
                <span className="font-bold">{currentPage}</span>
                <span className="tracking-widest font-semibold uppercase text-[10px]">
                  THE GAZETTE OF INDIA
                </span>
                <span className="text-[10px]">December 11, 2023</span>
              </div>
              <div className="w-full border-b border-black mb-0.5" />
              <div className="w-full border-b border-black mb-6" />

              {currentPage === 4 ? (
                <>
                  <div className="text-center mb-6">
                    <p className="font-hindi text-base font-bold text-zinc-800 tracking-wide mb-0.5">
                      भारत का राजपत्र
                    </p>
                    <p className="text-xs font-bold tracking-widest uppercase mb-3">
                      THE GAZETTE OF INDIA
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">
                      DIGITAL PERSONAL DATA PROTECTION ACT, 2023
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1">
                      CHAPTER II:
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-800">
                      OBLIGATIONS OF DATA FIDUCIARY
                    </p>
                  </div>

                  <div className="space-y-4 text-justify font-serif text-[11.5px] text-zinc-900">
                    <div>
                      <p className="font-bold italic mb-1">Data: Fiduciary—</p>
                      <p className="leading-snug">
                        <span className="font-bold">7. (1)</span> A Data Fiduciary shall not process personal data that is inaccurate or incomplete, and in case the accuracy is questioned, shall immediately suspend processing pending verification.
                      </p>
                    </div>

                    <div className="relative">
                      <p className="leading-snug">
                        <span className="font-bold">8. (3)</span> A Data Fiduciary shall logs/user dat atc kept inetbinite of data &apos;indefinitely&apos;, directiption to leave no onelo is the sole of tratumtid-rending eadication, and simlar hand and save-of-atowa eentence and control the projection of DPD Fiduciary:
                      </p>
                      <div className="pl-6 mt-1 space-y-1">
                        <p className="leading-snug">
                          <span className="font-semibold">(a)</span> A Data Fiduciary shall gold an ingect of data calimiter or i.e on data Fiduciary&apos;, or aoothen ibemanent construction, cont itinations of the authority contradcation, for formirtsttements or in obligational data with coniorders;
                        </p>
                        <p className="leading-snug">
                          <span className="font-semibold">(ii)</span> A Data Fiduciary shall unit to see that inget tionactive to complete data an-eamentier and comanttements and protecction of persanial permitonent litate.
                        </p>
                        <p className="leading-snug">
                          <span className="font-semibold">(iii)</span> On a Data fiduciary shall sperkie compter ueral of protection, the compliances.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="leading-snug">
                        <span className="font-bold">9. (1)</span> The Data Fiduciary shall, before processing any personal data of a child or a person with disability, obtain verifiable consent of the parent of such child or lawful guardian.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 font-serif text-[12px] pt-4">
                  <div className="text-center mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider">
                      DIGITAL PERSONAL DATA PROTECTION ACT, 2023 — PAGE {currentPage}
                    </p>
                    <p className="text-[11px] text-zinc-500 italic mt-1">
                      Official Gazette of India Regulatory Framework
                    </p>
                  </div>
                  <p className="leading-relaxed">
                    Statutory provisions under Chapter II and Chapter III regarding fiduciary liabilities, compliance timelines, and cross-border data transfer safeguards.
                  </p>
                  {currentPageViolations.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-amber-50 border-l-4 border-amber-600 rounded text-zinc-800 text-xs"
                    >
                      <p className="font-bold uppercase tracking-wide text-amber-900">
                        {v.sourceMatched} — {v.title}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed">
                        {v.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bounding Box Overlays on Gazette */}
              {currentPageViolations.map((v) => {
                const isSelected = focusedViolation?.id === v.id;
                return (
                  <div
                    key={v.id}
                    className={`violation-bbox absolute rounded transition-all duration-300 pointer-events-auto ${
                      isSelected ? "ring-2 ring-rose-500/80" : ""
                    }`}
                    style={{
                      top: `${v.coordinates.topPct}%`,
                      left: `${v.coordinates.leftPct}%`,
                      width: `${v.coordinates.widthPct}%`,
                      height: `${v.coordinates.heightPct}%`,
                      backgroundColor: "rgba(244, 63, 94, 0.18)",
                      border: "2px dashed #e11d48",
                    }}
                  >
                    <div className="absolute -top-11 left-0 z-30 bg-[#121216] text-white border border-zinc-700 rounded-md px-2.5 py-1 shadow-2xl min-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                          CONTRADICTION FOUND with Card #{v.cardNumber}:
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[11px] font-semibold text-rose-300">
                          {v.coordinates.label}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800 px-1 py-0.2 rounded">
                          Exact coordinate: {v.coordinates.exactCoord}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
