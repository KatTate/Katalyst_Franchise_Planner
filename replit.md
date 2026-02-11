# Katalyst Growth Planner — Agent Configuration

## Overview

The Katalyst Growth Planner is a greenfield B2B2C Vertical SaaS project designed to be a Franchise Location Planning tool for PostNet franchisees. Its primary purpose is to assist in planning new location openings. The project leverages the BMad Method, an AI-driven agile development framework, to manage the entire project lifecycle from initial concept to implementation. This includes utilizing structured agent personas and workflows to streamline development processes and ensure comprehensive project management. The business vision is to provide a robust, AI-supported platform that empowers franchisees with data-driven insights for successful expansion.

## User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps in EXACT ORDER, never skipping a step.

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are consistently visible.
- **Layout:** "Direction F (Hybrid Adaptive)" featuring a sidebar that collapses in "Planning Assistant" mode and expands in "Forms/Quick Entry" modes.
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) is used for AI confidence and informational panels.
- **White-label Approach:** A branded shell with Katalyst identity, designed to allow future brand customization.

**Technical Implementations & System Design:**
- **Authentication:** Supports a dual model with Google OAuth for Katalyst administrators (`@katgroupinc.com`) and invitation-based password authentication for franchisees and franchisors.
- **Backend Stack:** A full-stack JavaScript environment utilizing React for the frontend, Express for the backend, and PostgreSQL as the database. Server routes are organized modularly in `server/routes/`, with `server/routes.ts` managing session and Passport setup.
- **Database Schema:** Key tables include `brands`, `users`, `invitations`, `brand_account_managers`, and `plans`, which incorporates `financialInputs`, `projections`, and `startupCosts` as JSONB data types.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry are implemented using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Access is controlled via middleware functions such as `requireAuth()`, `requireRole()`, `scopeToUser()`, and `projectForRole()`.
- **Onboarding:** A guided 3-question flow is provided to recommend appropriate user tiers (Planning Assistant, Forms, or Quick Entry).
- **BMad File Structure:** The project's internal file structure includes `_bmad/` for the BMad Method toolkit, `_bmad-output/` for generated artifacts, `_config/` for manifests, and `_memory/` for agent memory.
- **Financial Engine:** A pure TypeScript computation engine (`shared/financial-engine.ts`) processes `FinancialInputs` to generate 60-month projections covering Profit & Loss, cash flow, balance sheet, and ROI. All currency values are stored in cents, calculations are pre-tax, and utilize simple monthly growth.

**Feature Specifications:**
- **Invitation Management:** Provides both UI and API capabilities for creating, monitoring, and copying invitation links.
- **Login/Logout:** Supports Google OAuth, email/password authentication, and robust session management.
- **Dev Login Bypass:** Includes a "Dev Login (Admin)" button for temporary administrative access during development.

## External Dependencies

- **Database:** PostgreSQL
- **Authentication:** Google OAuth (via `passport-google-oauth20`), `bcrypt`, `connect-pg-simple`.
- **Frameworks/Libraries:** React, Express, Passport.js.
- **Reference Data:** Franchise business plan spreadsheets are stored in `_bmad-output/planning-artifacts/reference-data/`.