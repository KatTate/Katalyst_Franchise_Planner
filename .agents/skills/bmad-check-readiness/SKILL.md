---
name: bmad-check-readiness
description: >
  BMAD Method: Critical validation that assesses PRD, Architecture, and Epics
  for completeness and alignment before implementation. Use when user says
  "check readiness", "IR", "implementation readiness", "ready to implement?",
  or needs to verify planning documents are aligned. Phase 3 Solutioning workflow.
---

# BMAD Check Implementation Readiness Workflow

This skill activates the BMAD Implementation Readiness workflow. It validates
that PRD, Architecture, Epics and Stories are complete and aligned before
Phase 4 implementation starts, using an adversarial review approach.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Document discovery
- Step 2: PRD analysis
- Step 3: Epic coverage validation
- Step 4: UX alignment
- Step 5: Epic quality review
- Step 6: Final assessment
- Output to planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- Focus on spotting GAPS — this is adversarial, assume problems exist

## What's Next

After checking readiness, the typical next step is:
- **Sprint Planning (SP)** — plan the implementation order
