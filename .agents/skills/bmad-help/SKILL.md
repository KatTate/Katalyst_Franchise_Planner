---
name: bmad-help
description: >
  BMAD Method: Get help and guidance on what to do next. Use when user says
  "help", "BH", "BMad help", "what should I do?", or needs orientation on
  which BMAD workflow to use. Anytime workflow. See also bmad-core for
  "start BMad" and "what's next?".
---

# BMAD Help System

This skill provides BMAD help and guidance by analyzing project state and
recommending the next workflow.

## Activation

When this skill is triggered, load and execute:

Read fully and follow: `_bmad/core/tasks/help.md`

The help system uses data from:
- Help catalog: `_bmad/_config/bmad-help.csv`
- Module configs: `_bmad/bmm/config.yaml` and `_bmad/core/config.yaml`
- Existing artifacts: `_bmad-output/` directory

## Execution Steps (7 Steps)

1. **Load Catalog** — Load `_bmad/_config/bmad-help.csv` containing all workflow definitions
2. **Resolve Output Locations** — Scan module `config.yaml` files to resolve `output-location` variables so artifact paths can be searched
3. **Detect Active Module** — Identify which module (bmm, core) is active from conversation context, recent workflows, or user keywords
4. **Analyze Input** — Determine what was just completed: explicit user statement, conversation context, or artifact presence
5. **Present Recommendations** — Show next steps based on completed workflows, phase/sequence ordering, and artifact presence
6. **Additional Guidance** — Recommend new chat for major workflows, suggest different LLM for validation workflows
7. **Return** — Return to calling process after presenting recommendations

## Quick Reference

| Phase | Workflows |
|-------|-----------|
| 0. Assess | Assess Project (AB) |
| 1. Analysis | Brainstorm (BP), Research (MR/DR/TR), Create Brief (CB) |
| 2. Planning | Create PRD (CP), Validate PRD (VP), Edit PRD (EP), Create UX (CU) |
| 3. Solutioning | Create Architecture (CA), Create Epics (CE), Check Readiness (IR), Generate Project Context (GPC) |
| 4. Implementation | Sprint Planning (SP), Sprint Status (SS), Create Story (CS), Dev Story (DS), Code Review (CR), QA Test (QA), Retrospective (ER) |
| Anytime | Quick Spec (QS), Quick Dev (QD), Party Mode (PM), Adversarial Review (AR), Correct Course (CC), Tech Writer (TW), Document Project (DP) |

## Commonly Missed Items

- ⚠️ **Artifact Scanning:** Agents skip scanning `_bmad-output/` for existing artifacts and give generic phase-1 advice — MUST check what planning/implementation artifacts already exist before recommending
- ⚠️ **Output Location Resolution:** Agents use raw `output-location` variable names instead of resolving them against module config.yaml — MUST resolve variables like `planning_artifacts` to actual paths
- ⚠️ **Required Workflow Gates:** Agents recommend optional workflows when required workflows haven't been completed — MUST check `required=true` column and block progress past incomplete required workflows
- ⚠️ **Command vs Agent Display:** Agents show slash commands for agent-based workflows (empty `command` field) — MUST use natural language triggers and code shortcuts instead (e.g., "say 'tech writer' or 'TW'")
- ⚠️ **Module Detection:** Agents assume BMM module without checking — MUST detect active module from context or ask user if ambiguous
- ⚠️ **New Chat Recommendation:** Agents fail to recommend starting a new chat for context-heavy workflows — MUST advise fresh context for PRD, architecture, epics

## Critical Rules

- ALWAYS check existing artifacts before making recommendations
- ALWAYS resolve output-location variables against module config before searching
- Recommend workflows in phase order unless user has specific needs
- Required workflows (`required=true`) block progress to later phases
- ALWAYS recommend new chat for major workflows (PRD, architecture, epics)
- For validation workflows, recommend using a different high-quality LLM if available
- Match the user's tone while presenting recommendations clearly

## What's Next

The help system itself recommends next steps based on project state.
Follow its recommendations to continue with the appropriate workflow.
