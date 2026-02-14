---
name: bmad-sprint-planning
description: >
  BMAD Method: Generate and manage the sprint status tracking file for
  implementation. Use when user says "sprint planning", "SP", "plan the sprint",
  "create sprint plan", or needs to select stories and plan build order.
  Phase 4 Implementation workflow.
---

# BMAD Sprint Planning Workflow

This skill activates the BMAD Sprint Planning workflow. It extracts all epics
and stories from epic files and creates the sprint status tracking file that
drives the implementation lifecycle.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Epic file discovery and loading (all epics)
- Sprint status template application
- Sprint status file creation at `implementation_artifacts/sprint-status.yaml`
- Checklist validation

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.md referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- ALL epics must be loaded to build the complete status

## What's Next

After sprint planning, the typical next step is:
- **Create Story (CS)** — prepare the first story for implementation
