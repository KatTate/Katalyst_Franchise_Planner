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
- **Backend Stack:** Full-stack JavaScript using React (frontend), Express (backend), and PostgreSQL (database).
- **Database Schema:** Includes `brands`, `users` (with `password_hash` and `profile_image_url`), and `invitations` tables.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Middleware (`requireAuth()`, `requireRole()`, `scopeToUser()`, `projectForRole()`) controls access based on user roles.
- **Onboarding:** A 3-question flow recommends a tier (Planning Assistant, Forms, Quick Entry) for franchisees.
- **BMad File Structure:** Organized with `_bmad/` for the toolkit, `_bmad-output/` for artifacts, `_config/` for manifests, and `_memory/` for agent memory.

**Feature Specifications:**
- **Invitation Management:** UI and API for creating invitations, viewing status, and copying links.
- **Login/Logout:** Supports Google OAuth, email/password login, and session management.
- **Dev Login Bypass:** A "Dev Login (Admin)" button for temporary admin access during development.

## Recent Changes

- **2026-02-09:** Story 2.2 (Startup Cost Template Management) completed — Reorder controls (move up/down buttons with boundary disable), aria-labels on all icon buttons (Move Up, Move Down, Edit, Delete), help text on Item 7 Low/High and Line Item Name form fields, sort_order normalization after every mutation. Code review passed with 0 findings.
- **2026-02-09:** Story 2.1 (Brand Entity & Financial Parameter Configuration) completed — Brand management list page, create brand dialog with auto-slug generation, brand detail page with financial parameters editor (tabbed: Revenue, Operating Costs, Financing, Startup Capital), sidebar navigation for katalyst_admin, role-based access control on brand admin endpoints, brand name uniqueness enforcement (DB constraint + application validation).
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
- **Reference Data:** `attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx`