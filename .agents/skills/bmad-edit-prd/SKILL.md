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

The workflow uses step-file architecture with steps in `steps-e/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- PRD file discovery and loading
- Output: updated PRD file

## Workflow Steps (4 Steps + 1 Conditional Branch)

1. **step-e-01-discovery** — Discover and load the PRD to edit, detect format (BMAD standard vs legacy)
   - ↳ **step-e-01b-legacy-conversion** — Legacy conversion handler (conditional: auto-loaded if non-BMAD PRD detected)
2. **step-e-02-review** — Review the PRD and identify areas for improvement
3. **step-e-03-edit** — Apply targeted edits based on review findings
4. **step-e-04-complete** — Complete edit workflow, offer validation or additional edits

## Commonly Missed Steps

- ⚠️ **step-e-04-complete** — Agents may consider editing "done" after step e-03 edits are applied without presenting the completion summary and validation options. This step offers seamless integration with the validation workflow.
- ⚠️ **step-e-01-discovery format detection** — The PRD format detection (BMAD standard vs legacy) determines workflow routing. Skipping proper detection can lead to incorrect editing approaches.

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (4 sequential steps; if step-e-01b legacy conversion is triggered, add it as a task dynamically). Each task should include the step number and name (e.g., "Step 1: Discovery — Discover and load the PRD to edit"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS halt at menus and wait for user selection
- The edit-validate cycle is iterative — user can edit, validate, edit again

## What's Next

After editing a PRD, the typical next steps are:
- Optional: **Validate PRD (VP)** — verify the edits improved quality
- **Create Architecture (CA)** or **Create UX (CU)** — continue planning
