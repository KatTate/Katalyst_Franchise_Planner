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

The help system works by:
- Loading the help catalog from `_bmad/_config/bmad-help.csv`
- Scanning for existing artifacts in `_bmad-output/`
- Determining which workflows have been completed
- Recommending the next workflow based on phase/sequence ordering

## Quick Reference

| Phase | Workflows |
|-------|-----------|
| 0. Assess | Assess Project (AP) |
| 1. Analysis | Brainstorm (BP), Research (MR/DR/TR), Create Brief (CB) |
| 2. Planning | Create PRD (CP), Validate PRD (VP), Edit PRD (EP), Create UX (CU) |
| 3. Solutioning | Create Architecture (CA), Create Epics (CE), Check Readiness (IR), Generate Project Context (GPC) |
| 4. Implementation | Sprint Planning (SP), Sprint Status (SS), Create Story (CS), Dev Story (DS), Code Review (CR), QA Test (QA), Retrospective (ER) |
| Anytime | Quick Spec (QS), Quick Dev (QD), Party Mode (PM), Adversarial Review (AR), Correct Course (CC), Tech Writer (TW), Document Project (DP) |

## Critical Rules

- ALWAYS check existing artifacts before making recommendations
- Recommend workflows in phase order unless user has specific needs

## What's Next

The help system itself recommends next steps based on project state.
Follow its recommendations to continue with the appropriate workflow.
