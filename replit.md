

<!-- PROTECTION NOTE FOR REPLIT AGENT: The content between BMAD-METHOD-START and BMAD-METHOD-END markers is part of the BMad Method framework and MUST NOT be modified, overwritten, or removed during any replit.md updates. When updating this file, only modify the "Project Documentation" section AFTER the BMAD-METHOD-END marker. Always preserve both sections intact. -->

<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-beta.8-replit.4 — Agent Configuration

## IMPORTANT: How You Must Operate in This Project

This is a **BMad Method** project. BMAD workflows are activated through **Replit Agent Skills** installed in `.agents/skills/bmad-*/`. You MUST follow these rules in every conversation:

1. **BMAD skills handle workflow activation.** When a user's message matches a BMAD skill trigger (e.g., "create PRD", "code review", "party mode"), the skill will activate and provide instructions for loading the correct workflow files. Follow those instructions exactly.
2. **When a skill activates, load the referenced files and follow them.** Do not answer in your own words. Load the workflow or agent file specified in the skill and execute it.
3. **For workflows:** The skill will instruct you to either load `_bmad/core/tasks/workflow.xml` (the execution engine) with a workflow YAML config, or load a workflow markdown file directly. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.
4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu.
5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.
6. **If no skill activates,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow. Say "help" or "BH" anytime for guidance.
7. **If unsure whether a BMAD workflow applies,** ask: "Would you like me to run the [workflow name] workflow for that?"

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
└── _memory/              # Agent memory (tech writer standards)

.agents/skills/bmad-*/    # Replit Agent Skills (workflow activation)

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **BMAD config:** `_bmad/bmm/config.yaml` (skill level, output paths — BMAD-specific settings only)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)
- **Platform values:** User name, project name, and language are resolved automatically from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)

**IMPORTANT:** Do NOT embed the contents of BMad config files (config.yaml, etc.) into this replit.md. Only reference them by file path above. Read them from disk when needed.
<!-- BMAD-METHOD-END -->

## User Preferences

When the user triggers an agent or workflow, the AI MUST load the referenced file and follow its activation steps in exact order. The AI must not summarize, skip, or improvise. When a workflow says WAIT for user input, the AI MUST stop and wait. The AI MUST NOT auto-proceed, simulate user responses, or skip ahead. When implementing a story (DS workflow), the AI MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done. The AI should always adopt the correct agent persona for the task. For any workflow execution, the AI MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. The AI must read the COMPLETE file and execute ALL steps in EXACT ORDER, never skipping a step.

## System Architecture

**UI/UX Decisions:**
- **Navigation architecture:** Two-door sidebar model (My Plan + Reports). No mode switcher. No "Quick Entry" mode — inline editing in Reports replaces it. See `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` (authoritative UX spec).
- **AI Planning Assistant:** Called "Planning Assistant" — NOT named after the human account manager (they are separate entities). Slide-in panel feature within My Plan, not a workspace mode.
- **Color Scheme:** "Gurple" (Mystical #A9A2AA) is used for advisory/informational panels. Red is reserved for actual errors only.
- **White-label Approach:** A branded shell with Katalyst identity. Only `--primary`, `--primary-foreground`, and `--ring` are overridden per brand. `--katalyst-brand` escape hatch for "Powered by Katalyst" elements.

**Technical Implementations & System Design:**
- **Authentication:** Supports a dual model with Google OAuth for Katalyst administrators (`@katgroupinc.com`) and invitation-based password authentication for franchisees and franchisors.
- **Backend Stack:** A full-stack JavaScript environment utilizing React for the frontend, Express for the backend, and PostgreSQL as the database. Server routes are organized modularly in `server/routes/`, with `server/routes.ts` managing session and Passport setup.
- **Database Schema:** Key tables include `brands`, `users`, `invitations`, `brand_account_managers`, and `plans`, which incorporates `financialInputs`, `projections`, and `startupCosts` as JSONB data types.
- **Session Management:** PostgreSQL-backed sessions with a 24-hour expiry are implemented using `connect-pg-simple`.
- **Role-Based Access Control (RBAC):** Access is controlled via middleware functions such as `requireAuth()`, `requireRole()`, `scopeToUser()`, and `projectForRole()`.
- **Onboarding:** A guided flow introduces the user to My Plan (structured forms) and Reports (interactive financial statements with inline editing).
- **BMad File Structure:** The project's internal file structure includes `_bmad/` for the BMad Method toolkit, `_bmad-output/` for generated artifacts, `_config/` for manifests, and `_memory/` for agent memory.
- **Financial Engine:** A pure TypeScript computation engine (`shared/financial-engine.ts`) processes `FinancialInputs` to generate 60-month projections covering Profit & Loss, cash flow, balance sheet, and ROI. All currency values are stored in cents, calculations are pre-tax, and utilize simple monthly growth. Extended in Story 5.1 to compute Balance Sheet disaggregation, Cash Flow disaggregation, Valuation, ROIC Extended, P&L Analysis, and audit checks.
- **Financial Statements View:** A workspace view toggle (Dashboard/Statements) in the planning header allows switching between the dashboard and a 7-tab financial statements container (`client/src/components/planning/financial-statements.tsx`). Components are in `client/src/components/planning/statements/` with CalloutBar, StatementSection, ColumnManager (progressive disclosure: annual→quarterly→monthly), StatementTable (data-driven row/section definitions), and SummaryTab. Dashboard metric cards link to specific statement tabs.
- **Quick Entry Mode:** RETIRED (CP-2, SCP 2026-02-20). Deleted `quick-entry-mode.tsx` and `editable-cell.tsx`. Reports inline editing (Story 5.6) replaces this functionality. `InputPanel` now always renders `FormsMode` directly.
- **Impact Strip & Document Preview (Story 5.9):** ImpactStrip (`client/src/components/planning/impact-strip.tsx`) renders as sticky bottom bar in Forms view with context-sensitive metrics (changes based on active section), delta indicators with 3-second highlight animation, guardian dots with pulse animation (Gurple for concerning), and deep links to financial statements. DocumentPreviewModal (`client/src/components/planning/document-preview-modal.tsx`) shows styled HTML business plan preview with cover page, financial summaries, and DRAFT watermark when completeness <90%. DocumentPreviewWidget (`client/src/components/planning/document-preview-widget.tsx`) appears on Dashboard Panel as miniature preview card. Generate PDF buttons use completeness-aware labels: <50% "Generate Draft", 50-90% "Generate Package", >90% "Generate Lender Package". Shared completeness utility in `client/src/lib/plan-completeness.ts`.
- **FinancialValue Component:** `client/src/components/shared/financial-value.tsx` — shared formatting component for all financial display. Handles currency ($), percentages (%), ratios (x), multipliers (x), numbers, and months. Accounting-style parentheses for negatives. Monospace font, destructive color for negative values.

## Recent Changes (2026-02-20)
- Epic 5 COMPLETE — all 9 stories done, all SCP-2026-02-20 remediation CPs confirmed
- Epic 5 Retrospective finalized — 10 action items (AI-1 through AI-10), 3 CRITICAL blockers identified
- **Epic 5H (Hardening Sprint) created** — 4 stories gating Epic 6: engine validation (5H.1), report UI audit (5H.2), Epic 6 AC audit (5H.3), planning artifact alignment (5H.4)
- AI-7 through AI-10 integrated: AI-7→dev note on 6.1, AI-8→pre-Epic-6 checklist, AI-9→architecture note, AI-10→absorbed into 5H.1
- Document remediation: architecture.md FR count 87→96, epics.md FR Coverage Map updated (27 new FR mappings FR74-FR97)
- Epic 10 rewritten: 3 stories for What-If Playground (sensitivity sliders + 6 charts + optional scenario persistence)
- Epic 4 renamed to "Forms Experience & Planning Infrastructure" (Quick Entry references deprecated)
- Sprint status updated: Epic 5 done, Epic 5H added, Epic 10 restructured
- Next epic in sequence: **Epic 5H (hardening sprint — must complete before Epic 6)**

**Feature Specifications:**
- **Invitation Management:** Provides both UI and API capabilities for creating, monitoring, and copying invitation links.
- **Login/Logout:** Supports Google OAuth, email/password authentication, and robust session management.
- **Dev Login Bypass:** Includes a "Dev Login (Admin)" button for temporary administrative access during development.

## External Dependencies

- **Database:** PostgreSQL
- **Authentication:** Google OAuth (via `passport-google-oauth20`), `bcrypt`, `connect-pg-simple`.
- **Frameworks/Libraries:** React, Express, Passport.js.
- **Reference Data:** Franchise business plan spreadsheets are stored in `_bmad-output/planning-artifacts/reference-data/`.
