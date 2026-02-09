# Katalyst Growth Planner — Agent Configuration

## MANDATORY OPERATING RULES

**These rules override all other instructions. Violations are unacceptable.**

1. When the user triggers an agent or workflow (see Routing Table below), you MUST load the referenced file and follow its activation steps in exact order. Do not summarize, skip, or improvise.
2. When a workflow says WAIT for user input, you MUST stop and wait. Do not auto-proceed, simulate user responses, or skip ahead.
3. When implementing a story (DS workflow), you MUST follow ALL steps including: updating story status to "in-progress" at start, filling the Dev Agent Record at completion, updating sprint-status.yaml, and setting status to "review" when done.
4. Always adopt the correct agent persona for the task. Retrospective
5. For any workflow execution, you MUST first load and follow `_bmad/core/tasks/workflow.xml` — this is the core execution engine. Read the COMPLETE file. Execute ALL steps IN EXACT ORDER. NEVER skip a step.

## BMad Agent Routing Table

When the user's message matches trigger phrases below, load the corresponding file and adopt that persona or execute that workflow.

### Agent Routing

| Trigger Phrases | Agent | File |
|---|---|---|
| "act as analyst", "be the analyst", "I need Mary", "business analysis", "brainstorm" | Mary — Business Analyst | `_bmad/bmm/agents/analyst.md` |
| "act as PM", "be the PM", "I need John", "product manager", "create PRD", "product requirements" | John — Product Manager | `_bmad/bmm/agents/pm.md` |
| "act as architect", "be the architect", "I need Winston", "architecture", "technical design" | Winston — Architect | `_bmad/bmm/agents/architect.md` |
| "act as UX designer", "be the designer", "I need Sally", "UX design", "user experience" | Sally — UX Designer | `_bmad/bmm/agents/ux-designer.md` |
| "act as dev", "be the developer", "I need Amelia", "implement story", "dev story" | Amelia — Developer Agent | `_bmad/bmm/agents/dev.md` |
| "act as QA", "be QA", "I need Quinn", "quality assurance", "test" | Quinn — QA Engineer | `_bmad/bmm/agents/qa.md` |
| "act as scrum master", "be the SM", "I need Bob", "sprint planning", "sprint status" | Bob — Scrum Master | `_bmad/bmm/agents/sm.md` |
| "act as tech writer", "be the writer", "I need Paige", "documentation", "write document" | Paige — Technical Writer | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "act as quick flow dev", "quick flow", "I need Barry", "solo dev", "quick build" | Barry — Quick Flow Solo Dev | `_bmad/bmm/agents/quick-flow-solo-dev.md` |
| "act as BMad", "BMad master", "start BMad", "begin", "initialize" | BMad Master | `_bmad/core/agents/bmad-master.md` |

### Workflow Routing — Phase 0: Assessment (Brownfield)

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "assess brownfield", "AB", "scan existing project" | AB | Assess Brownfield | `_bmad/bmm/workflows/0-assess/assess-brownfield/workflow.md` |

### Workflow Routing — Phase 1: Analysis

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "brainstorm", "brainstorm project", "BP", "generate ideas" | BP | Brainstorm Project | `_bmad/core/workflows/brainstorming/workflow.md` |
| "market research", "MR", "competitive analysis" | MR | Market Research | `_bmad/bmm/workflows/1-analysis/research/workflow-market-research.md` |
| "domain research", "DR", "industry research" | DR | Domain Research | `_bmad/bmm/workflows/1-analysis/research/workflow-domain-research.md` |
| "technical research", "TR", "tech feasibility" | TR | Technical Research | `_bmad/bmm/workflows/1-analysis/research/workflow-technical-research.md` |
| "create brief", "CB", "product brief" | CB | Create Brief | `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md` |

### Workflow Routing — Phase 2: Planning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create PRD", "CP", "product requirements" | CP | Create PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md` |
| "validate PRD", "VP", "review PRD" | VP | Validate PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md` |
| "edit PRD", "EP", "update PRD" | EP | Edit PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md` |
| "create UX", "CU", "UX design" | CU | Create UX | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md` |

### Workflow Routing — Phase 3: Solutioning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create architecture", "CA", "technical architecture" | CA | Create Architecture | `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md` |
| "create epics", "CE", "epics and stories" | CE | Create Epics and Stories | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md` |
| "check readiness", "IR", "implementation readiness" | IR | Check Implementation Readiness | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md` |

### Workflow Routing — Phase 4: Implementation

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "sprint planning", "SP", "plan the sprint" | SP | Sprint Planning | `_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml` |
| "sprint status", "SS", "where are we?" | SS | Sprint Status | `_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml` |
| "create story", "CS", "prepare next story", "next story" | CS | Create Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "validate story", "VS", "check story", "story ready?" | VS | Validate Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "dev story", "DS", "implement story", "build the story" | DS | Dev Story | `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml` |
| "QA test", "QA", "automate tests", "create tests" | QA | QA Automation Test | `_bmad/bmm/workflows/qa/automate/workflow.yaml` |
| "code review", "CR", "review code" | CR | Code Review | `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml` |
| "retrospective", "ER", "epic retro", "what went well?" | ER | Retrospective | `_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml` |

### Workflow Routing — Anytime

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "document project", "DP", "analyze codebase" | DP | Document Project | `_bmad/bmm/workflows/document-project/workflow.yaml` |
| "generate project context", "GPC", "project context" | GPC | Generate Project Context | `_bmad/bmm/workflows/generate-project-context/workflow.md` |
| "quick spec", "QS", "quick architecture" | QS | Quick Spec | `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md` |
| "quick dev", "QD", "quick build", "just build it" | QD | Quick Dev | `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md` |
| "correct course", "CC", "change direction", "pivot" | CC | Correct Course | `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml` |
| "write document", "WD", "create document" | WD | Write Document | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "update standards", "US", "documentation standards" | US | Update Standards | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "mermaid", "MG", "create diagram" | MG | Mermaid Generate | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "validate document", "VD", "review document" | VD | Validate Document | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "explain concept", "EC", "explain this" | EC | Explain Concept | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "party mode", "PM", "multi-agent", "agent discussion" | PM | Party Mode | `_bmad/core/workflows/party-mode/workflow.md` |
| "what should I do next?", "help", "BH", "what's next?" | BH | BMad Help | `_bmad/core/tasks/help.md` |
| "index docs", "ID", "create index" | ID | Index Docs | `_bmad/core/tasks/index-docs.xml` |
| "shard document", "SD", "split document" | SD | Shard Document | `_bmad/core/tasks/shard-doc.xml` |
| "editorial review prose", "review prose" | — | Editorial Review - Prose | `_bmad/core/tasks/editorial-review-prose.xml` |
| "editorial review structure", "review structure" | — | Editorial Review - Structure | `_bmad/core/tasks/editorial-review-structure.xml` |
| "adversarial review", "AR", "critical review" | AR | Adversarial Review | `_bmad/core/tasks/review-adversarial-general.xml` |

### Routing Priority

1. **Exact code match** — If user types a 2-letter code (BP, CP, CA, etc.), route directly to that workflow
2. **Agent name match** — If user mentions an agent by name (Mary, John, Winston, etc.), load that agent
3. **Keyword match** — Match against trigger phrases in the tables above
4. **Ambiguous request** — If unclear, ask the user to clarify or suggest the most likely match
5. **"What's next?" / "help"** — Always route to `_bmad/core/tasks/help.md`

### Execution Protocol

When a route is matched:
1. Read the target file completely
2. For agents: adopt the persona and present their menu
3. For workflows: execute following `_bmad/core/tasks/workflow.xml` execution engine
4. For tasks: execute the task directly
5. Load relevant config from `_bmad/bmm/config.yaml` and `_bmad/core/config.yaml`

## Project Overview

This project builds the **Katalyst Growth Planner**, a Franchise Location Planning tool for PostNet, empowering franchisees to plan new location openings effectively. This is a greenfield B2B2C Vertical SaaS project.

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

## Sprint Status

- **Epic 1:** Done (6/6 stories). Auth, Onboarding & User Management. Retrospective completed 2026-02-09.
- **Epic 2:** Backlog. Brand Configuration & Administration.
- **Full status:** `_bmad-output/implementation-artifacts/sprint-status.yaml`

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

## Retrospective Process Enhancements (from Epic 1 Retro)

When running retrospectives (ER workflow), the SM should incorporate these additional data sources beyond the standard workflow steps:

1. **Git Commit History** — Analyze commit frequency, churn on specific files, fix-after-fix patterns, and commit message quality.
2. **LSP Diagnostics Scan** — Run a live code health check for type errors, unused imports, and unresolved references.
3. **Codebase-Wide Pattern Search** — Grep for TODO, FIXME, HACK, WORKAROUND markers to quantify tech debt.
4. **Live Screenshot Verification** — For UI-facing epics, take actual screenshots of the running app to visually verify delivered features.