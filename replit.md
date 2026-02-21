# Overview

This project is a full-stack JavaScript application designed to provide comprehensive financial planning and analysis tools for franchisors and franchisees. It offers structured forms for data input ("My Plan") and interactive financial statements with inline editing capabilities ("Reports"). Key capabilities include 60-month financial projections (P&L, cash flow, balance sheet, ROI), scenario modeling, and business plan generation. The platform aims to streamline financial oversight and strategic planning within franchise networks.

# User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps in EXACT ORDER, never skipping a step.

# System Architecture

## UI/UX Decisions
- **Navigation:** A two-door sidebar model ("My Plan" and "Reports").
- **Two-Surface Design Principle (Epic 7):** Forms (My Plan) = onboarding wizard for less experienced personas. Reports = power editing surface where all financial assumptions are editable inline. Expert users skip Forms entirely and build their plan directly in Reports. Forms does NOT replicate Reports' granular per-year or per-month editing.
- **Per-Year & Per-Month Independence:** All financial assumptions support per-year independence (5 values). Qualifying fields (revenue, COGS%, labor%, marketing%) additionally support per-month independence (60 values) for seasonality modeling. Drill-down UI (annual → quarterly → monthly) provides progressive disclosure.
- **AI Planning Assistant:** A slide-in panel within "My Plan," not a separate workspace mode.
- **Color Scheme:** "Gurple" (#A9A2AA) for advisory panels; red reserved for errors.
- **White-labeling:** Branded shell with Katalyst identity, overriding `--primary`, `--primary-foreground`, and `--ring` CSS variables. `--katalyst-brand` for specific Katalyst elements.

## Technical Implementations & System Design
- **Authentication:** Supports Google OAuth for Katalyst administrators and invitation-based password authentication for franchisees/franchisors.
- **Backend Stack:** React (frontend), Express (backend), PostgreSQL (database). Server routes are modularized in `server/routes/`.
- **Database Schema:** Includes `brands`, `users`, `invitations`, `brand_account_managers`, and `plans` tables. `plans` stores `financialInputs`, `projections`, and `startupCosts` as JSONB.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Middleware functions like `requireAuth()`, `requireRole()`, `scopeToUser()`, and `projectForRole()` enforce access control.
- **Onboarding:** A guided flow introduces users to "My Plan" (structured forms) and "Reports" (interactive financial statements).
- **BMad File Structure:** Organized with `_bmad/` for the toolkit, `_bmad-output/` for generated artifacts, `_config/` for manifests, and `_memory/` for agent memory.
- **Financial Engine:** A pure TypeScript engine (`shared/financial-engine.ts`) generates 60-month projections from `FinancialInputs`, covering P&L, cash flow, balance sheet, and ROI. All currency is in cents, calculations are pre-tax, with simple monthly growth. Extended to include Balance Sheet and Cash Flow disaggregation, Valuation, ROIC Extended, P&L Analysis, and audit checks.
- **Financial Statements View:** A workspace toggle (Dashboard/Statements) in the planning header switches to a 7-tab financial statements container (`client/src/components/planning/financial-statements.tsx`). Features progressive disclosure (annual→quarterly→monthly) and data-driven table definitions.
- **Impact Strip & Document Preview:** `ImpactStrip` (`client/src/components/planning/impact-strip.tsx`) is a sticky bottom bar in Forms view, showing context-sensitive metrics, delta indicators, and guardian dots. `DocumentPreviewModal` (`client/src/components/planning/document-preview-modal.tsx`) displays a styled HTML business plan preview with a cover page, financial summaries, and DRAFT watermark if completeness is under 90%.
- **FinancialValue Component:** `client/src/components/shared/financial-value.tsx` provides shared formatting for all financial displays, handling various types (currency, percentages, ratios), accounting-style parentheses for negatives, and destructive color for negative values.
- **Invitation Management:** UI and API for creating, monitoring, and copying invitation links.
- **Login/Logout:** Supports Google OAuth, email/password, and robust session management, including a "Dev Login (Admin)" bypass for development.

# External Dependencies

- **Database:** PostgreSQL
- **Authentication:** Google OAuth (via `passport-google-oauth20`), `bcrypt`, `connect-pg-simple`
- **Frameworks/Libraries:** React, Express, Passport.js