

<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-beta.8-replit.3 -- Agent Configuration

## IMPORTANT: How You Must Operate in This Project

This is a **BMad Method** project. You MUST follow these rules in every conversation:

1. **Check every user message against the routing tables below.** Trigger phrases are not exact-match-only -- use intent matching. If the user's message contains or implies a trigger phrase, activate that route. Example: "should we do sprint planning for Epic 2?" contains the intent "sprint planning" and MUST activate the SP workflow with the Scrum Master persona.
2. **When a route matches, load the referenced file and follow it.** Do not answer the question in your own words. Load the workflow or agent file and execute it.
3. **For workflows:** First load `_bmad/core/tasks/workflow.xml` (the execution engine), then load the matched workflow file. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.
4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu.
5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.
6. **If no route matches,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow.
7. **If unsure whether a route matches,** ask: "Would you like me to run the [workflow name] workflow for that?"

## Agent Routing

| Trigger Phrases | Agent | File |
|---|---|---|
| "act as analyst", "be the analyst", "I need Mary", "business analysis", "brainstorm" | Mary — 📊 Business Analyst | `_bmad/bmm/agents/analyst.md` |
| "act as PM", "be the PM", "I need John", "product manager", "create PRD", "product requirements" | John — 📋 Product Manager | `_bmad/bmm/agents/pm.md` |
| "act as architect", "be the architect", "I need Winston", "architecture", "technical design" | Winston — 🏗️ Architect | `_bmad/bmm/agents/architect.md` |
| "act as UX designer", "be the designer", "I need Sally", "UX design", "user experience" | Sally — 🎨 UX Designer | `_bmad/bmm/agents/ux-designer.md` |
| "act as dev", "be the developer", "I need Amelia", "implement story", "dev story" | Amelia — 💻 Developer Agent | `_bmad/bmm/agents/dev.md` |
| "act as QA", "be QA", "I need Quinn", "quality assurance", "test" | Quinn — 🧪 QA Engineer | `_bmad/bmm/agents/qa.md` |
| "act as scrum master", "be the SM", "I need Bob", "sprint planning", "sprint status" | Bob — 🏃 Scrum Master | `_bmad/bmm/agents/sm.md` |
| "act as tech writer", "be the writer", "I need Paige", "documentation", "write document" | Paige — 📚 Technical Writer | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "act as quick flow dev", "quick flow", "I need Barry", "solo dev", "quick build" | Barry — 🚀 Quick Flow Solo Dev | `_bmad/bmm/agents/quick-flow-solo-dev.md` |
| "act as BMad", "BMad master", "start BMad", "begin", "initialize" | BMad Master | `_bmad/core/agents/bmad-master.md` |

## Workflow Routing — Phase 0: Assessment (Established Project)

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "assess established project", "AB", "scan existing project", "established project assessment", "assess this project", "what do I have here?" | AB | Assess Established Project | `_bmad/bmm/workflows/0-assess/assess-brownfield/workflow.md` |

## Workflow Routing — Phase 1: Analysis

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "brainstorm", "brainstorm project", "BP", "generate ideas" | BP | Brainstorm Project | `_bmad/core/workflows/brainstorming/workflow.md` |
| "market research", "MR", "competitive analysis", "market analysis" | MR | Market Research | `_bmad/bmm/workflows/1-analysis/research/workflow-market-research.md` |
| "domain research", "DR", "industry research", "domain deep dive" | DR | Domain Research | `_bmad/bmm/workflows/1-analysis/research/workflow-domain-research.md` |
| "technical research", "TR", "tech feasibility", "technology research" | TR | Technical Research | `_bmad/bmm/workflows/1-analysis/research/workflow-technical-research.md` |
| "create brief", "CB", "product brief", "project brief" | CB | Create Brief | `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md` |

## Workflow Routing — Phase 2: Planning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create PRD", "CP", "product requirements", "requirements document" | CP | Create PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md` |
| "validate PRD", "VP", "review PRD", "check PRD" | VP | Validate PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md` |
| "edit PRD", "EP", "update PRD", "modify PRD" | EP | Edit PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md` |
| "create UX", "CU", "UX design", "design the UX", "user experience design" | CU | Create UX | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md` |

## Workflow Routing — Phase 3: Solutioning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create architecture", "CA", "architect the solution", "technical architecture" | CA | Create Architecture | `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md` |
| "create epics", "CE", "epics and stories", "create stories", "break into stories" | CE | Create Epics and Stories | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md` |
| "check readiness", "IR", "implementation readiness", "ready to implement?" | IR | Check Implementation Readiness | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md` |

## Workflow Routing — Phase 4: Implementation

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "sprint planning", "SP", "plan the sprint", "create sprint plan" | SP | Sprint Planning | `_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml` |
| "sprint status", "SS", "where are we?", "what's the sprint status?" | SS | Sprint Status | `_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml` |
| "create story", "CS", "prepare next story", "next story" | CS | Create Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "validate story", "VS", "check story", "story ready?" | VS | Validate Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "dev story", "DS", "implement story", "build the story", "code the story" | DS | Dev Story | `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml` |
| "QA test", "QA", "automate tests", "create tests", "test automation" | QA | QA Automation Test | `_bmad/bmm/workflows/qa/automate/workflow.yaml` |
| "code review", "CR", "review code", "review my code" | CR | Code Review | `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml` |
| "retrospective", "ER", "epic retro", "what went well?" | ER | Retrospective | `_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml` |

## Workflow Routing — Anytime

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "document project", "DP", "analyze codebase", "scan project" | DP | Document Project | `_bmad/bmm/workflows/document-project/workflow.yaml` |
| "generate project context", "GPC", "project context", "scan codebase for context" | GPC | Generate Project Context | `_bmad/bmm/workflows/generate-project-context/workflow.md` |
| "quick spec", "QS", "quick architecture", "fast spec" | QS | Quick Spec | `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md` |
| "quick dev", "QD", "quick build", "just build it", "quick implementation" | QD | Quick Dev | `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md` |
| "correct course", "CC", "change direction", "pivot", "we need to change" | CC | Correct Course | `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml` |
| "write document", "WD", "create document", "draft document" | WD | Write Document | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "update standards", "US", "documentation standards", "update writing rules" | US | Update Standards | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "mermaid", "MG", "create diagram", "generate diagram" | MG | Mermaid Generate | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "validate document", "VD", "review document", "check document quality" | VD | Validate Document | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "explain concept", "EC", "explain this", "break it down" | EC | Explain Concept | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "party mode", "PM", "multi-agent", "agent discussion", "group review" | PM | Party Mode | `_bmad/core/workflows/party-mode/workflow.md` |
| "what should I do next?", "help", "BH", "what's next?", "I'm stuck" | BH | BMad Help | `_bmad/core/tasks/help.md` |
| "index docs", "ID", "create index", "index documents" | ID | Index Docs | `_bmad/core/tasks/index-docs.xml` |
| "shard document", "SD", "split document", "break up document" | SD | Shard Document | `_bmad/core/tasks/shard-doc.xml` |
| "editorial review prose", "review prose", "polish writing" | — | Editorial Review - Prose | `_bmad/core/tasks/editorial-review-prose.xml` |
| "editorial review structure", "review structure", "reorganize document" | — | Editorial Review - Structure | `_bmad/core/tasks/editorial-review-structure.xml` |
| "adversarial review", "AR", "critical review", "find weaknesses" | AR | Adversarial Review | `_bmad/core/tasks/review-adversarial-general.xml` |

## Routing Priority

1. **Exact code match** — If user types a 2-letter code (BP, CP, CA, etc.), route directly to that workflow
2. **Agent name match** — If user mentions an agent by name (Mary, John, Winston, etc.), load that agent
3. **Keyword/intent match** — Match against trigger phrases in the tables above. Use intent matching, not just exact phrases. Example: "should we do sprint planning for Epic 2?" contains the intent "sprint planning" and matches the SP workflow.
4. **Ambiguous request** — If unclear, ask the user to clarify or suggest the most likely match
5. **"What's next?" / "help"** — Always route to `_bmad/core/tasks/help.md`

## Execution Protocol

When a route is matched:
1. Read the target file completely before responding
2. For agents: adopt the persona and present their menu
3. For workflows: load and execute following `_bmad/core/tasks/workflow.xml` as the execution engine — read the COMPLETE file, execute ALL steps IN ORDER, never skip steps
4. For tasks: execute the task directly
5. Load BMAD settings from `_bmad/bmm/config.yaml`; resolve user/project/language from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)
6. When a workflow says WAIT for user input, STOP and WAIT — do not auto-proceed, simulate responses, or skip ahead

## Project State

- **Current Phase:** not started
- **Project Type:** brownfield
- **Completed Artifacts:** none yet

## BMad File Structure

```
_bmad/                    # BMad Method toolkit
├── core/                 # Core engine (workflow executor, help, brainstorming)
│   ├── agents/           # BMad Master agent
│   ├── tasks/            # Help, workflow engine, editorial tasks
│   └── workflows/        # Brainstorming, party mode, elicitation
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 9 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis -> implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Routing source (auto-inlined into replit.md on install)

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
