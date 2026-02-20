---
name: bmad-create-epics
description: >
  BMAD Method: Transform PRD requirements and architecture decisions into
  comprehensive stories organized by user value. Use when user says "create epics",
  "CE", "epics and stories", "create stories", "break into stories", or needs
  to break work into epics and implementation-ready user stories.
  Phase 3 Solutioning workflow.
---

# BMAD Create Epics and Stories Workflow

This skill activates the BMAD Create Epics and Stories workflow. It transforms
PRD requirements and Architecture decisions into comprehensive stories organized
by user value with complete acceptance criteria.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md`

The workflow uses step-file architecture with steps in `steps/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- Template: `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/templates/epics-template.md`
- Output to planning artifacts directory

## Workflow Steps (4 Total)

1. **step-01-validate-prerequisites** — Validate required documents exist (PRD + Architecture required, UX recommended), extract all FRs, NFRs, and additional requirements
2. **step-02-design-epics** — Design epic structure organized by user value, establish dependencies and ordering
3. **step-03-create-stories** — Create detailed stories with acceptance criteria, technical context, and FR traceability
4. **step-04-final-validation** — Validate complete FR coverage, architecture compliance, story dependencies, and epic independence

## Commonly Missed Steps

- ⚠️ **step-04-final-validation** — Agents may consider stories "done" after step-03 creation without running the validation checks. This step catches missing FR coverage, forward dependencies, and incorrect epic ordering.
- ⚠️ **step-01 requirements extraction** — Agents may rush to epic design without fully extracting ALL FRs, NFRs, and additional requirements from Architecture/UX documents. Complete extraction is critical.
- ⚠️ **step-04 dependency validation** — Within final validation, the dependency check (no forward dependencies, each epic independently valuable) is commonly skipped but prevents implementation blockers.

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (4 steps). Each task should include the step number and name (e.g., "Step 1: Validate Prerequisites — Validate required documents exist"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- PRD and Architecture documents MUST exist before starting this workflow
- Every FR must be covered by at least one story — no gaps allowed
- Stories must not have forward dependencies — only depend on PREVIOUS stories
- Database tables/entities created only when first needed, not all upfront

## What's Next

After creating epics and stories, the typical next steps are:
- **Check Readiness (IR)** — validate everything is aligned before implementation
- Recommend starting a **new chat session** for readiness check
