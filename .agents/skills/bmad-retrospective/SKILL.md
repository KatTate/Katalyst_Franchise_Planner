---
name: bmad-retrospective
description: >
  BMAD Method: Epic completion review — extract lessons learned and assess
  impact on remaining work. Use when user says "retrospective", "ER",
  "epic review", "lessons learned", or completes an epic.
  Phase 4 Implementation workflow.
---

# BMAD Retrospective Workflow

This skill activates the BMAD Retrospective workflow. It reviews a completed
epic to extract lessons learned and assess if new information impacts
remaining work.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Completed epic file loading
- Sprint status analysis
- Agent manifest loading for multi-perspective review
- Instructions execution from the workflow directory
- Lessons learned documentation

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- Focus on ACTIONABLE lessons — what should change going forward

## What's Next

After retrospective, the typical next steps are:
- **Sprint Planning (SP)** — plan the next epic if sprint continues
- **Create Story (CS)** — start the next story
