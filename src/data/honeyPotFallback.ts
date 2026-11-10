// ──────────────────────────────────────────────────────────────
// PILLAR A — Pre-Calculated Fallback Schema & Presets
// Loaded instantly via Ctrl+Shift+F (Hackathon Fallback)
// ──────────────────────────────────────────────────────────────

export interface ViolationItem {
  id: string;
  cardNumber: number;
  type: "CRITICAL_VIOLATION" | "VIOLATION" | "OMISSION";
  title: string;
  description: string;
  suggestedRevision: string;
  sourceMatched: string;
  pageNumber: number;
  coordinates: {
    label: string;
    exactCoord: number;
    topPct: number;
    leftPct: number;
    widthPct: number;
    heightPct: number;
  };
  includedInPlan: boolean;
}

export interface AuditReportJSON {
  targetDocumentName: string;
  groundTruthPdfName: string;
  totalPages: number;
  telemetry: {
    faithfulnessScore: string;
    reviewLatency: string;
    rerankingLatency: string;
  };
  findings: ViolationItem[];
}

export const HONEY_POT_FALLBACK_JSON: AuditReportJSON = {
  targetDocumentName: "Honey-Pot_Data_Policy_2023.pdf",
  groundTruthPdfName: "DPDP_Act_2023_Official.pdf",
  totalPages: 28,
  telemetry: {
    faithfulnessScore: "93.4%",
    reviewLatency: "4.2s",
    rerankingLatency: "~380ms",
  },
  findings: [
    {
      id: "cv-001",
      cardNumber: 1,
      type: "CRITICAL_VIOLATION",
      title: "INDEFINITE DATA RETENTION",
      description:
        'Section 12 of target document states logs/user data are kept "indefinitely", directly contradicting DPDP Act Section 8.',
      suggestedRevision:
        '"All personal data shall be permanently deleted or anonymized within 30 days of account/service termination, as per statutory compliance."',
      sourceMatched: "DPDP Act Sec. 8(3)",
      pageNumber: 4,
      coordinates: {
        label: "Indefinite Data Retention",
        exactCoord: 95,
        topPct: 37,
        leftPct: 7,
        widthPct: 86,
        heightPct: 20,
      },
      includedInPlan: true,
    },
    {
      id: "v-002",
      cardNumber: 2,
      type: "VIOLATION",
      title: "BYPASSING BREACH SLA",
      description:
        "Allows 14-day delay for notification, violating DPDP timelines",
      suggestedRevision:
        '"In the event of a breach, notify the Board & affected users within 72 hours."',
      sourceMatched: "DPDP Act Sec. 8(6)",
      pageNumber: 6,
      coordinates: {
        label: "Breach SLA Bypass",
        exactCoord: 142,
        topPct: 22,
        leftPct: 6,
        widthPct: 88,
        heightPct: 15,
      },
      includedInPlan: true,
    },
    {
      id: "o-003",
      cardNumber: 3,
      type: "OMISSION",
      title: "NO DATA PROTECTION OFFICER",
      description:
        "Missing standard regulatory DPO appointment mandate required under DPDP Act Section 10.",
      suggestedRevision:
        '"A qualified Data Protection Officer shall be appointed within 30 days of this policy taking effect, with authority to audit all data flows."',
      sourceMatched: "DPDP Act Sec. 10(1)",
      pageNumber: 8,
      coordinates: {
        label: "DPO Appointment Gap",
        exactCoord: 210,
        topPct: 42,
        leftPct: 5,
        widthPct: 90,
        heightPct: 14,
      },
      includedInPlan: true,
    },
    {
      id: "v-004",
      cardNumber: 4,
      type: "VIOLATION",
      title: "CONSENT DARK PATTERNS",
      description:
        'Section 5 uses pre-checked consent boxes and buried opt-out links, violating the "free and informed consent" requirements.',
      suggestedRevision:
        '"Consent shall be obtained through clear, affirmative action. Pre-checked boxes and dark patterns are strictly prohibited."',
      sourceMatched: "DPDP Act Sec. 6(1)",
      pageNumber: 3,
      coordinates: {
        label: "Consent Dark Pattern",
        exactCoord: 78,
        topPct: 50,
        leftPct: 7,
        widthPct: 86,
        heightPct: 12,
      },
      includedInPlan: true,
    },
    {
      id: "o-005",
      cardNumber: 5,
      type: "OMISSION",
      title: "NO GRIEVANCE REDRESSAL MECHANISM",
      description:
        "Target document fails to specify any grievance redressal mechanism for data principals as mandated by DPDP Act Section 13.",
      suggestedRevision:
        '"A dedicated grievance redressal portal shall be established, with acknowledgment within 48 hours and resolution within 30 days."',
      sourceMatched: "DPDP Act Sec. 13(1)",
      pageNumber: 12,
      coordinates: {
        label: "Grievance Mechanism Gap",
        exactCoord: 305,
        topPct: 30,
        leftPct: 7,
        widthPct: 86,
        heightPct: 15,
      },
      includedInPlan: true,
    },
  ],
};

export const PRESET_AUDIT_REPORTS: Record<string, AuditReportJSON> = {
  "honey-pot": HONEY_POT_FALLBACK_JSON,
  "fintech-lending": {
    targetDocumentName: "NeoPay_Lending_Terms_2024.pdf",
    groundTruthPdfName: "DPDP_Act_2023_Official.pdf",
    totalPages: 28,
    telemetry: {
      faithfulnessScore: "88.2%",
      reviewLatency: "3.7s",
      rerankingLatency: "~290ms",
    },
    findings: [
      {
        id: "fin-001",
        cardNumber: 1,
        type: "CRITICAL_VIOLATION",
        title: "UNRESTRICTED CREDIT BUREAU DATA RESELLING",
        description:
          "Clause 19 permits automated syndication of borrower contact graphs to secondary debt recovery partners without explicit consent.",
        suggestedRevision:
          '"Borrower data shall only be processed for loan underwriting and servicing, with no third-party syndication without granular opt-in."',
        sourceMatched: "DPDP Act Sec. 7(b)",
        pageNumber: 4,
        coordinates: {
          label: "Secondary Data Sharing Violation",
          exactCoord: 104,
          topPct: 37,
          leftPct: 7,
          widthPct: 86,
          heightPct: 20,
        },
        includedInPlan: true,
      },
      {
        id: "fin-002",
        cardNumber: 2,
        type: "VIOLATION",
        title: "FORCE MAJEURE BREACH NOTIFICATION WAIVER",
        description:
          "Waiver clause excuses data fiduciary from notifying customers of cybersecurity incidents caused by upstream cloud providers.",
        suggestedRevision:
          '"All cloud infrastructure compromises impacting user data shall trigger mandatory 72-hour regulatory notification regardless of fault."',
        sourceMatched: "DPDP Act Sec. 8(6)",
        pageNumber: 6,
        coordinates: {
          label: "Cloud Incident Waiver",
          exactCoord: 155,
          topPct: 22,
          leftPct: 6,
          widthPct: 88,
          heightPct: 15,
        },
        includedInPlan: true,
      },
      {
        id: "fin-003",
        cardNumber: 3,
        type: "OMISSION",
        title: "NO MINOR CONSENT VERIFICATION MECHANISM",
        description:
          "Platform lacks verifiable parental consent gates despite offering credit education and cards to users aged 16-18.",
        suggestedRevision:
          '"Verifiable parental or legal guardian consent must be collected and cryptographic age authentication enforced before processing minors data."',
        sourceMatched: "DPDP Act Sec. 9(1)",
        pageNumber: 8,
        coordinates: {
          label: "Minor Protection Gap",
          exactCoord: 188,
          topPct: 42,
          leftPct: 5,
          widthPct: 90,
          heightPct: 14,
        },
        includedInPlan: true,
      },
    ],
  },
};
