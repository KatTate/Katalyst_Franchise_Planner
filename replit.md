# BMad Method — Agent Configuration

## Overview

This project utilizes the **BMad Method**, an AI-driven agile development framework, to guide projects from conceptualization to implementation. It provides structured agent personas and workflows designed to streamline the development process. The primary goal is to build a Franchise Location Planning tool for PostNet, empowering franchisees to plan new location openings effectively. This is a greenfield B2B2C Vertical SaaS project with significant market potential in optimizing franchise expansion.

## User Preferences

- **Interaction Style:** Just speak naturally. Use phrases like "act as the PM", "create a PRD", "what should I do next?", or use any 2-letter code (BP, CP, CA, etc.).
- **Workflow Execution:** For workflows, the system will use `_bmad/core/tasks/workflow.xml` as the execution engine.
- **Agent Interaction:** When an agent is selected, the system will adopt the persona and present the agent's menu.
- **Help/Guidance:** For "what's next?" or "help" queries, the system will execute `_bmad/core/tasks/help.md`.

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are used to describe input methods, not skill levels, and are always visible to all users.
- **Layout:** "Direction F (Hybrid Adaptive)" is implemented, where the sidebar collapses in "Planning Assistant" for immersive experience and expands in "Forms/Quick Entry" for navigation.
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) serves as a signature advisory color for AI confidence and informational panels.
- **White-label Approach:** The system uses a branded shell with a prominent Katalyst identity, allowing brands to apply accent colors and logos while Katalyst maintains the core design system.

**Technical Implementations & System Design:**
- **Authentication:** A dual authentication model is employed:
    - Google OAuth for Katalyst administrators (restricted to `@katgroupinc.com` domain). Admin users self-register via their first Google OAuth login.
    - Invitation-based password authentication for franchisees/franchisors (mechanism determined in Stories 1.2-1.4).
- **Backend Stack:** Full-stack JavaScript using React for the frontend, Express for the backend, and PostgreSQL as the database.
- **Database Schema:** Includes `brands`, `users`, and `invitations` tables. The `users` table includes a `password_hash` column for non-Google OAuth users and `profile_image_url`.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry via `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Implemented using middleware (`requireAuth()`, `requireRole()`, `scopeToUser()`, `projectForRole()`) to control access to routes and UI elements based on user roles.
- **Onboarding:** A 3-question onboarding flow determines a tier recommendation (Planning Assistant, Forms, Quick Entry) for franchisees based on their experience and literacy.
- **BMad File Structure:** Organized with `_bmad/` for the toolkit (core engine, agents, workflows), `_bmad-output/` for generated artifacts (planning and implementation), `_config/` for manifests, and `_memory/` for agent memory.

**Feature Specifications:**
- **Invitation Management:** Full UI and API for creating invitations (email, role, brand selector), viewing invitation status, and copying links.
- **Login/Logout:** Supports Google OAuth, email/password login for franchisees/franchisors, and session management with expiry detection.
- **Dev Login Bypass:** A "Dev Login (Admin)" button is available when Google OAuth credentials are not configured, providing a temporary admin user for development.

## External Dependencies

- **Database:** PostgreSQL
- **Authentication:**
    - Google OAuth (via `passport-google-oauth20`)
    - `bcrypt` for password hashing
    - `connect-pg-simple` for PostgreSQL-backed sessions
- **Frameworks/Libraries:**
    - React
    - Express
    - Passport.js (for authentication strategies)
- **Reference Data:** `attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx` (PostNet business plan spreadsheet for financial data)