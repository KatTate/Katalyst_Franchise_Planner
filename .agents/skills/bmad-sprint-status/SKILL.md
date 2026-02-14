---
name: bmad-sprint-status
description: >
  BMAD Method: View sprint status summary, surface risks, and get routed to
  the right implementation workflow. Use when user says "sprint status", "SS",
  "show sprint", "where are we?", or needs a quick implementation progress
  overview. Phase 4 Implementation workflow.
---

# BMAD Sprint Status Workflow

This skill activates the BMAD Sprint Status workflow. It summarizes the
sprint-status.yaml file, surfaces risks, and routes to the right
implementation workflow.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Sprint status file loading from implementation artifacts
- Status summary and risk analysis
- Routing recommendations to the next workflow

## Critical Rules

- NEVER skip steps or optimize the sequence
- ALWAYS present a clear summary of current sprint state
- Surface blockers and risks prominently

## What's Next

Sprint status provides routing guidance — it recommends the next workflow
based on current state (create story, dev story, code review, etc.).
