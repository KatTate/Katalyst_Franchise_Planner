---
name: bmad-correct-course
description: >
  BMAD Method: Navigate significant changes during sprint execution by analyzing
  impact and proposing solutions. Use when user says "correct course", "CC",
  "change direction", "pivot", "we need to change", or discovers major changes
  needed mid-implementation. Anytime workflow.
---

# BMAD Correct Course Workflow

This skill activates the BMAD Course Correction workflow. It analyzes the
impact of significant changes discovered during sprint execution and proposes
solutions for how to proceed.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Loading all planning artifacts (PRD, epics, architecture, UX, tech spec)
- Sprint status analysis
- Impact assessment and change proposal generation
- Instructions and checklist from the workflow directory
- Output: change proposal document in planning artifacts

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS load ALL planning documents for comprehensive impact analysis

## What's Next

After course correction, the updated plans will guide next steps —
typically returning to the story cycle with adjusted scope.
