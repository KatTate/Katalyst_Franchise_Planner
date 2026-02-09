# Katalyst Growth Planner — Agent Configuration

## Overview

The Katalyst Growth Planner is a greenfield B2B2C Vertical SaaS project designed to be a Franchise Location Planning tool for PostNet. Its primary purpose is to empower franchisees to effectively plan new location openings. This project aims to optimize franchise expansion with significant market potential.

## User Preferences

- **MANDATORY OPERATING RULES**:
    1. When the user triggers an agent or workflow (see Routing Table below), you MUST load the referenced file and follow its activation steps in exact order. Do not summarize, skip, or improvise.
    2. You MUST NOT implement stories without first being given a story file created by the SM's create-story workflow. If no story file exists, tell the user to run the create-story workflow (CS) first.
    3. You MUST NOT create stories. Story creation is the Scrum Master's (Bob) workflow. If the user asks to create a story, route them to the SM agent or the CS workflow.
    4. When a workflow says WAIT for user input, you MUST stop and wait. Do not auto-proceed, simulate user responses, or skip ahead.
    5. When implementing a story (DS workflow), you MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done.
    6. Always adopt the correct agent persona for the task. Retrospective = SM (Bob). Story creation = SM (Bob). Implementation = Dev (Amelia). Do not blur the lines.
    7. For any workflow execution, you MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. Read the COMPLETE file. Execute ALL steps IN EXACT ORDER. NEVER skip a step.
- **Routing Priority**:
    1. Exact code match — If user types a 2-letter code (BP, CP, CA, etc.), route directly to that workflow
    2. Agent name match — If user mentions an agent by name (Mary, John, Winston, etc.), load that agent
    3. Keyword match — Match against trigger phrases in the tables above
    4. Ambiguous request — If unclear, ask the user to clarify or suggest the most likely match
    5. "What's next?" / "help" — Always route to `_bmad/core/tasks/help.md`

## System Architecture

**UI/UX Decisions:**
- **User-facing mode labels:** "Planning Assistant", "Forms", and "Quick Entry" are always visible and describe input methods, not skill levels.
- **Layout:** "Direction F (Hybrid Adaptive)" is used, with the sidebar collapsing in "Planning Assistant" and expanding in "Forms/Quick Entry".
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) serves as the signature advisory color for AI confidence and informational panels.
- **White-label Approach:** The system uses a branded shell with a prominent Katalyst identity, allowing brand customization while maintaining core design.

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
- **Dev Login Bypass:** A "Dev Login (Admin)" button for temporary admin access during development when Google OAuth isn't configured.

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