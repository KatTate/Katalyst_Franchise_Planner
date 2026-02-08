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

- **Current Phase:** not started
- **Project Type:** greenfield
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
<!-- BMAD-METHOD-END -->
