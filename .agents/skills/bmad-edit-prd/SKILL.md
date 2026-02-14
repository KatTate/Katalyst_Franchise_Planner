---
name: bmad-edit-prd
description: >
  BMAD Method: Edit and improve an existing PRD for clarity, completeness,
  and quality. Use when user says "edit PRD", "EP", "update PRD", "modify PRD",
  or wants to enhance an existing Product Requirements Document.
  Phase 2 Planning workflow.
---

# BMAD Edit PRD Workflow

This skill activates the BMAD PRD Edit workflow. It provides structured
enhancement of an existing PRD through review and improvement.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- PRD file discovery and loading
- Edit steps for review, targeted editing, and completion
- Output: updated PRD file

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead

## What's Next

After editing a PRD, the typical next steps are:
- Optional: **Validate PRD (VP)** — verify the edits improved quality
- **Create Architecture (CA)** or **Create UX (CU)** — continue planning
