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

## Workflow Steps (9 Total — Interactive Mode)

1. **Step 0: Determine execution mode** — interactive (default), validate, or data mode
2. **Locate sprint status file** — find sprint-status.yaml or exit with guidance
3. **Read and parse sprint-status.yaml** — parse metadata, classify keys (epics/stories/retros), validate statuses, detect risks
4. **⚠️ Step 2.5: Platform intelligence** — git commit activity per story, codebase health check (LSP), tech debt markers, visual state snapshot
5. **Select next action recommendation** — priority-based routing to the right workflow
6. **Display summary** — show stories/epics counts, git activity, codebase health, risks, recommendation
7. **Offer actions** — run recommended workflow, show details, show raw file, or exit

Additional modes (non-interactive):
- **Step 20 (Data mode)** — parse and return structured data for other workflows
- **Step 30 (Validate mode)** — validate sprint-status.yaml structure and return validity status

## Commonly Missed Steps

- **Step 2.5 (Platform intelligence)**: Agents skip git activity analysis, LSP
  diagnostics, and tech debt scanning, presenting status numbers without objective
  codebase health context. This step adds critical intelligence about which stories
  have actual commits and whether the codebase is clean.
- **Risk detection (in Step 2)**: Agents fail to detect and surface all risk
  conditions: stale timestamps, orphaned stories, in-progress epics with no
  stories, and status validation errors.
- **Legacy status mapping**: Agents forget to map legacy statuses ("drafted" →
  "ready-for-dev", "contexted" → "in-progress") before counting and reporting.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Sprint status file loading from implementation artifacts
- Status summary and risk analysis
- Routing recommendations to the next workflow

## Critical Rules

- This workflow has **3 execution modes** — interactive (default), validate, and data. Execute the correct mode.
- NEVER skip steps or optimize the sequence
- ALWAYS present a clear summary of current sprint state
- Surface blockers and risks prominently — stale timestamps, orphaned stories, unknown statuses
- ALWAYS map legacy statuses before counting: "drafted" → "ready-for-dev", "contexted" → "in-progress"
- ALWAYS validate all statuses against known valid values and surface unrecognized statuses to the user
- ALWAYS run platform intelligence (Step 2.5) in interactive mode — git activity, LSP, and tech debt provide objective health data
- Priority-based routing: in-progress → review → ready-for-dev → backlog → retrospective → done
- NO TIME ESTIMATES — never mention hours, days, weeks, or timelines

## What's Next

Sprint status provides routing guidance — it recommends the next workflow
based on current state (create story, dev story, code review, etc.).
