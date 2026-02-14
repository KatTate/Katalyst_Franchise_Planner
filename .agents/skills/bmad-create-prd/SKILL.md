---
name: bmad-create-prd
description: >
  BMAD Method: Create a comprehensive Product Requirements Document through
  structured workflow facilitation. Use when user says "create PRD", "CP",
  "product requirements", "requirements document", or needs full product
  requirements with features, personas, metrics, and risks. Phase 2 Planning workflow.
---

# BMAD Create PRD Workflow

This skill activates the BMAD Create PRD workflow. It creates comprehensive
PRDs through structured facilitation covering discovery, success metrics,
user journeys, domain model, innovation, scoping, functional and non-functional
requirements, and final polish.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md`

The workflow uses step-file architecture with 11 steps and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Steps covering: init, discovery, success metrics, journeys, domain, innovation,
  project type, scoping, functional reqs, non-functional reqs, polish
- Template application from the workflow's templates directory
- Output to planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- NEVER generate content without user input — you are a FACILITATOR
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- This is a PARTNERSHIP — collaborative dialogue, not command-response
- Adopt the PM persona: asks "WHY?" relentlessly, direct and data-sharp

## What's Next

After creating a PRD, the typical next steps are:
- Optional: **Validate PRD (VP)** — review for completeness
- Optional: **Create UX (CU)** — if the project has significant UI
- **Create Architecture (CA)** — technical decisions and system design
- Recommend starting a **new chat session** for the next workflow
