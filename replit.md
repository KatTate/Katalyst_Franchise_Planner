<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-Beta.7 — Agent Configuration

## Overview

This project uses the **BMad Method** — an AI-driven agile development framework. It provides structured agent personas and workflows that guide projects from idea through implementation.

**How to use:** Just speak naturally. Say things like "act as the PM", "create a PRD", "what should I do next?", or use any 2-letter code (BP, CP, CA, etc.).

## Routing

When the user's message matches a BMAD trigger phrase, agent name, or workflow code:

1. **Read the routing table:** `_bmad/replit-routing.md`
2. **Match the request** to an agent or workflow using the trigger phrases listed there
3. **Load the matched file** and follow its instructions
4. **For workflows:** Execute using `_bmad/core/tasks/workflow.xml` as the execution engine
5. **For agents:** Adopt the persona and present the agent's menu
6. **For "what's next?" or "help":** Execute `_bmad/core/tasks/help.md`

## Quick Reference — Agents

| Say | Agent | Role |
|---|---|---|
| "act as analyst" or "Mary" | Business Analyst | Brainstorming, research, briefs |
| "act as PM" or "John" | Product Manager | PRDs, epics, stories |
| "act as architect" or "Winston" | Architect | Technical architecture |
| "act as UX designer" or "Sally" | UX Designer | User experience design |
| "act as dev" or "Amelia" | Developer | Story implementation |
| "act as QA" or "Quinn" | QA Engineer | Testing and quality |
| "act as SM" or "Bob" | Scrum Master | Sprint planning and management |
| "act as tech writer" or "Paige" | Technical Writer | Documentation |
| "quick flow" or "Barry" | Quick Flow Solo Dev | Fast builds, simple projects |
| "start BMad" | BMad Master | Initialize and get oriented |

## Quick Reference — Key Workflows

| Say | Code | What It Does |
|---|---|---|
| "assess brownfield" | AB | Scan existing project, find best BMAD entry point |
| "brainstorm" | BP | Generate and explore ideas |
| "create brief" | CB | Nail down the product idea |
| "create PRD" | CP | Product requirements document |
| "create architecture" | CA | Technical architecture |
| "create epics" | CE | Break work into epics and stories |
| "sprint planning" | SP | Plan the implementation sprint |
| "dev story" | DS | Implement a story |
| "code review" | CR | Review implemented code |
| "what's next?" | BH | Get guidance on next steps |
| "quick spec" | QS | Fast technical spec (simple projects) |
| "quick dev" | QD | Fast implementation (simple projects) |

## Project State

- **Current Phase:** Solutioning → Epics & Stories (BMAD Solutioning Phase)
- **Project Type:** greenfield (B2B2C Vertical SaaS — Franchise Location Planning)
- **Completed Artifacts:**
  - Product Brief (`_bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md`)
  - PRD — 58 FRs, 28 NFRs (`_bmad-output/planning-artifacts/prd.md`)
  - PRD Validation Report (`_bmad-output/planning-artifacts/prd-validation-report.md`)
  - Architecture Document — complete (`_bmad-output/planning-artifacts/architecture.md`)
    - Steps 1-8 all complete (initialization, context analysis, template evaluation, 15 core decisions, 25 implementation patterns, project structure, validation PASS, completion)
  - UX Design Specification — Steps 1-9 complete (`_bmad-output/planning-artifacts/ux-design-specification.md`)
    - Direction F (Hybrid Adaptive) selected as layout direction
    - Visual foundation: color system, typography, spacing density, chart specs
    - HTML mockups at `_bmad-output/planning-artifacts/ux-design-directions.html`
- **Next:** Sprint Planning (SP) — ready to plan implementation sprints
  - Epics & Stories Document (`_bmad-output/planning-artifacts/epics.md`)
    - 36 stories across 8 MVP epics, 58/58 FRs covered
    - Party Mode reviewed: 10 improvements applied (seed admin, Quick ROI, dashboard reorder, 409 conflict handling, RBAC negative tests, Quick Entry split, metadata blur, PDF quality, accounting logging, mode persistence)

## Key Design Decisions

- **User-facing mode labels:** Planning Assistant / Forms / Quick Entry (NOT Story/Normal/Expert)
  - Labels describe INPUT METHOD, not skill level — prevents gatekeeping
  - Internal dev references may still use Story/Normal/Expert for clarity
  - All three options ALWAYS visible to ALL users — onboarding suggests but never restricts
- **Layout:** Direction F (Hybrid Adaptive) — sidebar collapses in Planning Assistant for immersion, restores in Forms/Quick Entry for power navigation
- **"Gurple" (Mystical #A9A2AA):** Signature advisory color for ROI Guardian, AI confidence, info panels (never errors)
- **White-label approach:** Branded shell with prominent Katalyst identity — brands apply accent colors/logos, Katalyst owns design system
- **Dual auth model:** Google OAuth for Katalyst admins (@katgroupinc.com domain only, passport-google-oauth20); invitation-based for franchisees/franchisors (auth mechanism TBD in Stories 1.2-1.4)
  - No seed script — admin users self-register via first Google OAuth login with `katalyst_admin` role
  - Double domain enforcement: Google `hd` parameter + server-side email suffix check
  - Stories 1.3 and 1.4 have TBD markers for franchisee auth mechanism

## BMad File Structure

```
_bmad/                    # BMad Method toolkit
├── core/                 # Core engine (workflow executor, help, brainstorming)
│   ├── agents/           # BMad Master agent
│   ├── tasks/            # Help, workflow engine, editorial tasks
│   └── workflows/        # Brainstorming, party mode, elicitation
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 9 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis → implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Trigger phrase → file routing table

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **User config:** `_bmad/core/config.yaml` (user name, language)
- **Project config:** `_bmad/bmm/config.yaml` (project name, skill level, output paths)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)

## Project Context

- **Goal:** Franchise location planning tool for helping franchisees open new PostNet locations
- **Attached Reference:** `attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx` — PostNet business plan spreadsheet with financial data for location planning
- **Stack:** Full-stack JavaScript (React + Express + PostgreSQL)

## Recent Changes

- 2026-02-08: Installed BMad Method v6.0.0-Beta.7 (brownfield into existing Replit template)
- 2026-02-08: Attached PostNet Business Plan Excel file for reference data
- 2026-02-08: Product Brief completed
- 2026-02-08: PRD completed (49 FRs, 25 NFRs) and validated (4/5 quality)
- 2026-02-08: AI Integration Amendment — Story Mode reimagined as AI Planning Advisor, Expert Mode added to MVP, Advisory Board deferred to Phase 2. PRD now 58 FRs, 28 NFRs.
- 2026-02-08: Architecture Steps 1-4 complete — project context analysis, starter template evaluation, and 15 core architectural decisions documented (data model, RBAC, financial engine, AI integration, component architecture, API design)
- 2026-02-08: Architecture Step 5 complete — 25 implementation pattern conflict points resolved via Party Mode (naming, numbers, structure, format, communication patterns)
- 2026-02-08: Architecture Step 6 complete — complete project file tree with [T]/[C] legend, route modules pattern, 3 layout components, error boundary, brand seed data, page access matrix, dynamic brand theming
- 2026-02-08: Architecture Step 7 complete — validation PASS on coherence, requirements coverage (58 FRs, 28 NFRs), and implementation readiness. Party Mode additions: 409 conflict handling for auto-save, split-screen responsive stacking, shippable unit boundaries, cut order elevated to handoff
- 2026-02-08: Architecture Step 8 complete — workflow finished
- 2026-02-08: UX Design Specification Steps 1-9 complete — Direction F (Hybrid Adaptive) selected, visual foundation documented (color system, typography, spacing, charts), HTML mockups created
- 2026-02-08: Party Mode naming decision — user-facing labels changed from Story/Normal/Expert to Planning Assistant/Forms/Quick Entry. Labels describe input method, not skill level. All three always visible to all users.
- 2026-02-08: UX spec and HTML mockups updated with new naming throughout
- 2026-02-09: Epics & Stories completed — 36 stories across 8 MVP epics, 58/58 FRs covered
- 2026-02-09: Story 1.1 contexted with Google OAuth approach for Katalyst admin auth
- 2026-02-09: Correct Course workflow executed — Sprint Change Proposal created and applied. 23 edits across architecture.md (14), epics.md (6), prd.md (3). Auth model updated from universal email/password to dual model: Google OAuth for Katalyst admins + invitation-based for franchisees
- 2026-02-09: **Story 1.1 IMPLEMENTED** — Project initialization & auth database schema
  - Database: `brands`, `users` (no password_hash, has profile_image_url), `invitations` tables created
  - Auth: Google OAuth via passport-google-oauth20 with @katgroupinc.com domain restriction (hd param + email suffix check)
  - Backend routes: `/api/auth/google`, `/api/auth/google/callback`, `POST /api/auth/logout`, `GET /api/auth/me`
  - Frontend: Login page with Google sign-in button, protected dashboard, `useAuth()` hook
  - Session: PostgreSQL-backed via connect-pg-simple with 24h expiry
  - Removed: bcrypt, passport-local, seed.ts — replaced with Google OAuth self-registration
  - Env vars needed: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (from Google Cloud Console)
  - **Dev login bypass:** When Google OAuth creds are absent, login page shows "Dev Login (Admin)" button instead of Google sign-in. Creates dev@katgroupinc.com user with katalyst_admin role. Auto-disables when real OAuth creds are set.

## Current Phase: Implementation — Sprint 1

- **Story 1.1:** IMPLEMENTED (dev login bypass active — Google OAuth ready when creds are added)
- **Story 1.2-1.8:** Pending
<!-- BMAD-METHOD-END -->
