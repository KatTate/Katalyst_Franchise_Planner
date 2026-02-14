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

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Validate prerequisites (PRD + Architecture required, UX recommended)
- Step 2: Design epics
- Step 3: Create stories with acceptance criteria
- Step 4: Final validation
- Template application from the workflow's templates directory
- Output to planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- PRD and Architecture documents MUST exist before starting this workflow

## What's Next

After creating epics and stories, the typical next steps are:
- **Check Readiness (IR)** — validate everything is aligned before implementation
- Recommend starting a **new chat session** for readiness check
