# Katalyst Growth Planner — Agent Configuration

## Overview

This project is building the **Katalyst Growth Planner**, a Franchise Location Planning tool for PostNet. It aims to empower franchisees to effectively plan new location openings. This is a greenfield B2B2C Vertical SaaS project. The project utilizes the **BMad Method**, an AI-driven agile development framework, to guide development from idea through implementation using structured agent personas and workflows.

## User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI must not auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps IN EXACT ORDER, never skipping a step.

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are always visible.
- **Layout:** "Direction F (Hybrid Adaptive)" is used, with the sidebar collapsing in "Planning Assistant" and expanding in "Forms/Quick Entry".
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) is the signature advisory color for AI confidence and informational panels.
- **White-label Approach:** The system uses a branded shell with a prominent Katalyst identity, allowing brand customization.

**Technical Implementations & System Design:**
- **Authentication:** Dual model with Google OAuth for Katalyst administrators (`@katgroupinc.com` domain) and invitation-based password authentication for franchisees/franchisors.
- **Backend Stack:** Full-stack JavaScript using React (frontend), Express (backend), and PostgreSQL (database). Server routes are modularized into `server/routes/` with domain-specific routers (auth, invitations, brands, onboarding, admin, users, financial-engine). Main `server/routes.ts` handles session/passport setup and mounts routers.
- **Database Schema:** Includes `brands` (with `default_account_manager_id`), `users` (with `password_hash`, `profile_image_url`, `account_manager_id`, `booking_url`), `invitations`, `brand_account_managers` (join table linking managers to brands with per-brand booking URLs), and `plans` (financial plans with `financialInputs`, `projections`, `startupCosts` JSONB columns) tables.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Middleware (`requireAuth()`, `requireRole()`, `scopeToUser()`, `projectForRole()`) controls access based on user roles.
- **Onboarding:** A 3-question flow recommends a tier (Planning Assistant, Forms, Quick Entry) for franchisees.
- **BMad File Structure:** Organized with `_bmad/` for the toolkit, `_bmad-output/` for artifacts (including `reference-data/` for franchise business plan spreadsheets), `_config/` for manifests, and `_memory/` for agent memory.
- **Financial Engine:** Pure TypeScript computation engine in `shared/financial-engine.ts`. Takes raw numeric `FinancialInputs`, produces 60-month projections (P&L, cash flow, balance sheet, ROI). All currency values stored in cents. Intentionally pre-tax. Uses simple monthly growth (`rate/12`) to match franchise industry conventions.

**Feature Specifications:**
- **Invitation Management:** UI and API for creating invitations, viewing status, and copying links.
- **Login/Logout:** Supports Google OAuth, email/password login, and session management.
- **Dev Login Bypass:** A "Dev Login (Admin)" button for temporary admin access during development.

## Recent Changes

- **2026-02-10:** Reference data reorganization — Moved 4 franchise business plan spreadsheets (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) from `attached_assets/` to `_bmad-output/planning-artifacts/reference-data/`. Updated all cross-references across 9 files.
- **2026-02-10:** Story 3.1 consolidated code review — Cross-referenced findings from BMAD Adversarial Review (external agent) and Replit Agent review via Party Mode. 7 must-fix findings (CR-1 through CR-7), 5 design decisions documented, 3 items flagged for PostNet spreadsheet verification, 7 out-of-scope items tracked for later stories. Story status set to `review`.
- **2026-02-09:** Story 3.1 (Financial Engine Core & Plan Schema) initial implementation — `shared/financial-engine.ts` with `calculateProjections()`, `FinancialInputs`/`EngineOutput` types, 60-month projection engine. `plans` table added to `shared/schema.ts`. Storage CRUD in `server/storage.ts`. Test file `shared/financial-engine.test.ts` with PostNet reference data.
- **2026-02-09:** Pre-Epic-3 preparation completed — Route modularization (server/routes.ts split into 7 domain routers in server/routes/), tab component extraction (admin-brand-detail.tsx reduced from ~95 lines, 4 components extracted to client/src/components/brand/), financial-engine.ts scaffolded as empty router. 0 LSP errors, e2e tests pass.
- **2026-02-09:** Epic 2 Retrospective completed — 4/4 stories done, 0 LSP errors, 0 tech debt markers, 2.6% fix ratio (2/78 commits). Story 2.5 relocated to Epic 3 as Story 3.7.
- **2026-02-09:** Epic 1 completed (Auth, Onboarding & User Management) — 6/6 stories done with retrospective identifying workflow improvement items.

## External Dependencies

- **Database:** PostgreSQL
- **Authentication:**
    - Google OAuth (via `passport-google-oauth20`)
    - `bcrypt`
    - `connect-pg-simple`
- **Frameworks/Libraries:**
    - React
    - Express
    - Passport.js
- **Reference Data:** `_bmad-output/planning-artifacts/reference-data/` — PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix business plan spreadsheets