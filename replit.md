# Overview

This project is a full-stack JavaScript application providing comprehensive financial planning and analysis tools for franchisors and franchisees. It features structured data input ("My Plan") and interactive financial statements ("Reports") with inline editing. The platform generates 60-month financial projections (P&L, cash flow, balance sheet, ROI), enables scenario modeling, and facilitates business plan generation. Its primary purpose is to streamline financial oversight and strategic planning within franchise networks.

# User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps in EXACT ORDER, never skipping a step.

# System Architecture

## UI/UX Decisions
- **Navigation:** A two-door sidebar model for "My Plan" and "Reports."
- **Two-Surface Design Principle:** "My Plan" functions as an onboarding wizard for structured data entry, while "Reports" serves as a power editing surface for inline financial assumption adjustments.
- **Per-Year & Per-Month Independence:** Financial assumptions support per-year independence (5 values), with qualifying fields also supporting per-month independence (60 values) for seasonality modeling.
- **AI Planning Assistant:** Integrated as a slide-in panel within "My Plan."
- **Color Scheme:** "Gurple" (#A9A2AA) for advisory elements; red for errors. White-labeling via CSS variable overrides.

## Technical Implementations & System Design
- **Authentication:** Google OAuth for administrators and invitation-based password authentication for franchisees/franchisors.
- **Backend Stack:** React (frontend), Express (backend), PostgreSQL (database).
- **Database Schema:** Key tables include `brands`, `users`, `invitations`, `brand_account_managers`, and `plans`. `plans` stores `financialInputs`, `projections`, and `startupCosts` as JSONB.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry.
- **Role-Based Access Control (RBAC):** Middleware functions enforce access control based on user roles and data ownership.
- **Onboarding:** A guided flow introduces users to "My Plan" and "Reports."
- **BMad File Structure:** Standardized organization for toolkit (`_bmad/`), generated artifacts (`_bmad-output/`), manifests (`_config/`), and agent memory (`_memory/`).
- **Financial Engine:** A pure TypeScript engine generates 60-month financial projections (P&L, cash flow, balance sheet, ROI) from `FinancialInputs`, handling all currency in cents and pre-tax calculations.
- **Financial Statements View:** A 7-tab container within the planning header offering progressive disclosure (annual → quarterly → monthly).
- **Impact Strip & Document Preview:** An `ImpactStrip` displays context-sensitive metrics, and a `DocumentPreviewModal` generates a styled HTML business plan preview.
- **FinancialValue Component:** Provides shared formatting for all financial displays, including currency, percentages, ratios, and negative value representation.
- **Invitation Management:** UI and API for creating, monitoring, and copying invitation links.
- **Plan Management:** Full CRUD operations (create, rename, clone, delete) for financial plans with last-plan protection.
- **Scenario Management:** Users can create, save, load, update, and delete named scenarios (max 10 per plan) for "What If" analysis. Scenarios are stored in the `plans` table's `whatIfScenarios` JSONB column.
- **Data Sharing Controls:** Franchisees can grant/revoke consent for franchisors to view financial plan details, with an append-only audit trail. This controls data visibility in the Franchisor Pipeline Dashboard.
- **Franchisor Pipeline Dashboard:** Provides franchisor admins with an overview of all franchisees in their brand, including pipeline stage, consent-based financial summaries, and detection of stalled plans.
- **Planning Assistant Interface:** A split-screen interface integrating a conversation panel with a live dashboard, featuring a simulated AI for populating financial inputs.

# External Dependencies

- **Database:** PostgreSQL
- **Authentication:** Google OAuth (`passport-google-oauth20`), `bcrypt`, `connect-pg-simple`
- **Frameworks/Libraries:** React, Express, Passport.js