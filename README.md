# AuditRAG — Technical Playground (Frontend)

An interactive Next.js dashboard for **AuditRAG**, an adversarial regulatory compliance audit interface designed to inspect policy documents against India's **Digital Personal Data Protection (DPDP) Act, 2023**.

> **Note on Current Scope:** This frontend runs as a standalone, offline-capable technical playground. It combines pre-calculated compliance presets, a simulated 5-stage adversarial RAG pipeline, client-side PDF rendering (`react-pdf`), and browser-side remediation plan generation (`jsPDF`)—ready to be connected to a backend RAG/audit API using the typed `AuditReportJSON` contract.

---

## Features

- **Split-Pane Audit Workspace**
  - **Left Pane (45%) — Adversarial Critic Feed:** Lists compliance findings grouped into `CRITICAL_VIOLATION`, `VIOLATION`, and `OMISSION` severity tiers with collapsible cards, concise remediation previews, and statutory citations (e.g., `DPDP Act Sec. 8(3)`).
  - **Right Pane (55%) — Ground Truth Reference Viewer:** Displays either the structured *Gazette of India (DPDP Act, 2023)* ground-truth view or a user-uploaded PDF rendered via `react-pdf`.
- **Ground-Truth Synchronization & Bounding-Box Overlays**
  - Clicking **Focus Ground Truth** on any finding auto-scrolls the viewer, jumps to the cited page, highlights the matching region with a pulsing crimson bounding box and coordinate tooltip, and draws an SVG Bezier connector on `xl` viewports for Card #1 on Page 4.
  - Includes working page navigation (direct page input + previous/next controls) and zoom controls (`60%`–`180%`).
- **Upload & Demo Presets (`UploadModal`)**
  - Drag-and-drop or browse local documents (`.pdf`, `.doc`, `.docx`, `.txt` accepted by the picker; `.pdf` files render live via `URL.createObjectURL` and the local PDF.js worker).
  - Switch between two built-in compliance presets:
    - `Honey-Pot_Data_Policy_2023.pdf` — 5 discrepancies (`93.4%` faithfulness, `4.2s` review latency)
    - `NeoPay_Lending_Terms_2024.pdf` — 3 discrepancies (`88.2%` faithfulness, `3.7s` review latency)
- **Simulated Pipeline Execution (`AuditProgressModal`)**
  - Animated 5-step execution view covering *Document Ingestion & Chunking*, *Dense Vector Embedding Retrieval*, *Cross-Encoder Reranking*, *Adversarial Critic Synthesis*, and *Ground Truth Citation Mapping*.
- **Client-Side PDF Remediation Export (`jsPDF`)**
  - Generates and downloads `AuditRAG_Improvement_Plan_<document>.pdf` containing telemetry metrics, severity badges, finding descriptions, statutory remediation clauses, and ground-truth page/coordinate citations.
- **Instant Hackathon Fallback (`Ctrl+Shift+F` / `Cmd+Shift+F`)**
  - Pre-loads `HONEY_POT_FALLBACK_JSON` on startup and supports a keyboard shortcut (`Ctrl+Shift+F` on Windows/Linux, `Cmd+Shift+F` on macOS) to instantly reset to the default DPDP Act demo dataset with an emerald screen-flash indicator.

---

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, Webpack mode) | `^16.4.5` |
| UI Library | React / React DOM | `^19.3.1` |
| Language | TypeScript (`strict: true`) | `^7.0.2` |
| Styling | Tailwind CSS (`@tailwindcss/postcss`) | `^4.3.5` |
| PDF Viewer | `react-pdf` + local `/pdf.worker.min.mjs` | `^11.0.0` |
| PDF Export | `jspdf` | `^4.2.1` |
| Icons | `lucide-react` | `^1.70.0` |
| Fonts | `Inter` & `JetBrains Mono` (Google Fonts) | — |

---

## Project Structure

```text
AuditRag_frontend/
├── public/
│   ├── DPDP_Act_2023_Official.pdf     # Official DPDP Act 2023 reference PDF
│   └── pdf.worker.min.mjs             # Local PDF.js worker for offline rendering
├── src/
│   ├── app/
│   │   ├── globals.css                # Dark theme variables, scrollbars, PDF & pulse animations
│   │   ├── layout.tsx                 # Root layout, dark class, Inter & JetBrains Mono fonts
│   │   └── page.tsx                   # Main split-pane dashboard, state orchestration, jsPDF export
│   ├── components/
│   │   ├── AuditProgressModal.tsx     # 5-stage animated adversarial pipeline modal
│   │   ├── CriticFeed.tsx             # Left-pane findings feed & empty state
│   │   ├── Header.tsx                 # Top bar ("AuditRAG" / "Technical Playground")
│   │   ├── ImprovementPlanBar.tsx     # Bottom bar summarizing fixes/omissions & PDF download
│   │   ├── PdfViewer.tsx              # Ground Truth Gazette & react-pdf uploaded PDF viewer
│   │   ├── Sidebar.tsx                # 56px navigation rail
│   │   ├── TelemetryBar.tsx           # Faithfulness/latency metrics & action buttons
│   │   ├── UploadModal.tsx            # File drag-and-drop + preset audit report selector
│   │   └── ViolationCard.tsx          # Expandable severity card with citation & focus action
│   ├── data/
│   │   └── honeyPotFallback.ts        # TypeScript schemas & Honey-Pot / NeoPay demo datasets
│   └── hooks/
│       └── useHackathonFallback.ts    # Default fallback state & Ctrl/Cmd+Shift+F hotkey
├── empty-module.js                    # Empty CommonJS stub module
├── next.config.ts                     # Disables devIndicators; aliases `canvas: false` in webpack
├── package.json                       # Dependencies and Next.js webpack scripts
├── postcss.config.mjs                 # Tailwind CSS v4 PostCSS plugin
└── tsconfig.json                      # TypeScript config with `@/*` -> `./src/*` path alias
```

---

## Getting Started

### Prerequisites

- **Node.js** `18.18+` or `20+`
- **npm** (uses `package-lock.json`)

### Installation & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

Defined in `package.json`:

| Command | Script | Notes |
| --- | --- | --- |
| `npm run dev` | `next dev --webpack` | Runs Next.js dev server with Webpack (required by `next.config.ts` `canvas: false` alias for `react-pdf`) |
| `npm run build` | `next build --webpack` | Builds the production bundle using Webpack |
| `npm run start` | `next start` | Starts the production server after building |
| `npm run lint` | `next lint` | Runs Next.js linter (requires ESLint packages if run locally) |

---

## Backend Integration Schema

To wire this frontend to a live AuditRAG backend, return JSON matching `AuditReportJSON` (defined in `src/data/honeyPotFallback.ts`):

```ts
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
```

---

## Current Implementation Notes

- **Mocked Analysis for Custom Uploads:** Uploading a local PDF in `UploadModal.tsx` renders the actual PDF pages in the right-hand viewer while populating 3 sample Page 1 findings (`up-001`, `up-002`, `up-003`) for demonstration until connected to an inference endpoint.
- **Static Navigation Chrome:** `Sidebar.tsx` (`Overview`, `Playground`, `Frameworks`, `Integrations`, `Sign out`) and `Header.tsx` action icons (`HelpCircle`, `Bell`) are currently UI placeholders without route handlers.
- **Plan Inclusion Toggling:** `handleTogglePlan` in `src/app/page.tsx` and `includedInPlan` filtering in `ImprovementPlanBar.tsx` / `jsPDF` export are wired, while `ViolationCard.tsx` currently displays a streamlined card layout without a per-card toggle checkbox.
- **Ground Truth Surface:** `PdfViewer.tsx` renders an HTML/Tailwind *Gazette of India* layout for the Ground Truth tab (with detailed Section 7/8/9 clauses on Page 4 and dynamic finding summaries on other pages), while `public/DPDP_Act_2023_Official.pdf` is included in `public/`.

