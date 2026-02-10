# Katalyst Growth Planner — Agent Configuration

## Overview

This project is developing the **Katalyst Growth Planner**, a Franchise Location Planning tool for PostNet. Its primary goal is to provide franchisees with the necessary tools to effectively plan the opening of new locations. This is a greenfield B2B2C Vertical SaaS project. The development process is guided by the **BMad Method**, an AI-driven agile development framework that leverages structured agent personas and workflows throughout the project lifecycle, from initial concept to implementation.

## User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps IN EXACT ORDER, never skipping a step.

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are consistently visible.
- **Layout:** "Direction F (Hybrid Adaptive)" is employed, with the sidebar collapsing in "Planning Assistant" mode and expanding in "Forms/Quick Entry" modes.
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) serves as the signature advisory color for AI confidence and informational panels.
- **White-label Approach:** The system features a branded shell with a prominent Katalyst identity, allowing for future brand customization.

**Technical Implementations & System Design:**
- **Authentication:** A dual authentication model supports Google OAuth for Katalyst administrators (`@katgroupinc.com` domain) and invitation-based password authentication for franchisees and franchisors.
- **Backend Stack:** A full-stack JavaScript environment utilizing React for the frontend, Express for the backend, and PostgreSQL as the database. Server routes are modularized into `server/routes/`, with domain-specific routers (e.g., auth, invitations, brands, onboarding, admin, users, financial-engine). The main `server/routes.ts` file manages session/passport setup and mounts these routers.
- **Database Schema:** Key tables include `brands` (featuring `default_account_manager_id`), `users` (with `password_hash`, `profile_image_url`, `account_manager_id`, `booking_url`), `invitations`, `brand_account_managers` (a join table linking managers to brands with per-brand booking URLs), and `plans` (financial plans containing `financialInputs`, `projections`, `startupCosts` as JSONB columns).
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry are managed using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Access is controlled through middleware (`requireAuth()`, `requireRole()`, `scopeToUser()`, `projectForRole()`) based on assigned user roles.
- **Onboarding:** A guided 3-question flow assists in recommending an appropriate tier (Planning Assistant, Forms, or Quick Entry) for franchisees.
- **BMad File Structure:** The project's internal structure includes `_bmad/` for the BMad Method toolkit, `_bmad-output/` for generated artifacts (including `reference-data/`), `_config/` for manifests, and `_memory/` for agent-specific memory.
- **Financial Engine:** A pure TypeScript computation engine located in `shared/financial-engine.ts`. This engine processes raw numeric `FinancialInputs` to generate 60-month projections (P&L, cash flow, balance sheet, ROI). All currency values are stored in cents and calculations are intentionally pre-tax. It employs simple monthly growth (`rate/12`) to align with common franchise industry conventions.

**Feature Specifications:**
- **Invitation Management:** Provides both UI and API capabilities for creating invitations, monitoring their status, and copying invitation links.
- **Login/Logout:** Supports Google OAuth, email/password authentication, and robust session management.
- **Dev Login Bypass:** A "Dev Login (Admin)" button offers temporary administrative access for development purposes.

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
- **Reference Data:** `_bmad-output/planning-artifacts/reference-data/` contains franchise business plan spreadsheets for PostNet, Jeremiah's Italian Ice, Tint World, and Ubreakifix.