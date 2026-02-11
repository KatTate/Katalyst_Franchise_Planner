# Katalyst Growth Planner — Agent Configuration

## Overview

The Katalyst Growth Planner is a Franchise Location Planning tool designed for PostNet franchisees to plan new location openings. This greenfield B2B2C Vertical SaaS project utilizes the BMad Method, an AI-driven agile development framework, to manage the entire project lifecycle from concept to implementation, leveraging structured agent personas and workflows.

## User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps in EXACT ORDER, never skipping a step.

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are consistently visible.
- **Layout:** "Direction F (Hybrid Adaptive)" with a sidebar that collapses in "Planning Assistant" mode and expands in "Forms/Quick Entry" modes.
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) for AI confidence and informational panels.
- **White-label Approach:** A branded shell with Katalyst identity, allowing future brand customization.

**Technical Implementations & System Design:**
- **Authentication:** Dual model supporting Google OAuth for Katalyst administrators (`@katgroupinc.com`) and invitation-based password authentication for franchisees and franchisors.
- **Backend Stack:** Full-stack JavaScript environment using React (frontend), Express (backend), and PostgreSQL (database). Server routes are modularized in `server/routes/` with a main `server/routes.ts` file managing session/passport setup.
- **Database Schema:** Key tables include `brands`, `users`, `invitations`, `brand_account_managers`, and `plans` (with `financialInputs`, `projections`, `startupCosts` as JSONB).
- **Session Management:** PostgreSQL-backed sessions with 24-hour expiry using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Access controlled via middleware (`requireAuth()`, `requireRole()`, `scopeToUser()`, `projectForRole()`).
- **Onboarding:** A guided 3-question flow to recommend appropriate tiers (Planning Assistant, Forms, or Quick Entry).
- **BMad File Structure:** Project internal structure includes `_bmad/` for the BMad Method toolkit, `_bmad-output/` for generated artifacts, `_config/` for manifests, and `_memory/` for agent memory.
- **Financial Engine:** A pure TypeScript computation engine (`shared/financial-engine.ts`) processing `FinancialInputs` to generate 60-month projections (P&L, cash flow, balance sheet, ROI). All currency values are stored in cents, calculations are pre-tax, and use simple monthly growth.

**Feature Specifications:**
- **Invitation Management:** UI and API for creating, monitoring, and copying invitation links.
- **Login/Logout:** Supports Google OAuth, email/password, and session management.
- **Dev Login Bypass:** A "Dev Login (Admin)" button for temporary administrative access during development.

## External Dependencies

- **Database:** PostgreSQL
- **Authentication:** Google OAuth (via `passport-google-oauth20`), `bcrypt`, `connect-pg-simple`.
- **Frameworks/Libraries:** React, Express, Passport.js.
- **Reference Data:** Franchise business plan spreadsheets located in `_bmad-output/planning-artifacts/reference-data/`.