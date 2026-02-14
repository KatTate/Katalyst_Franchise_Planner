---
name: bmad-create-ux
description: >
  BMAD Method: Collaborative UX design — screens, flows, interactions, and
  visual patterns. Use when user says "create UX", "CU", "UX design",
  "design the UX", "user experience design", or needs user experience planning.
  Phase 2 Planning workflow. Recommended for UI-heavy projects.
---

# BMAD Create UX Design Workflow

This skill activates the BMAD UX Design workflow. It creates comprehensive
UX design specifications through collaborative visual exploration and
informed decision-making.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step-by-step UX design facilitation
- Visual patterns, screen flows, and interaction design
- Template application from the workflow directory
- Output: UX design specification in planning artifacts

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- This is a PARTNERSHIP — collaborative visual exploration as equals

## What's Next

After creating UX design, the typical next steps are:
- **Create Architecture (CA)** — if not yet done
- **Create Epics (CE)** — if architecture is complete
