---
name: bmad-create-brief
description: >
  BMAD Method: Guided session to define your product idea, users, and MVP scope.
  Use when user says "create brief", "CB", "product brief", "project brief",
  or wants to nail down their product idea. Phase 1 Analysis workflow.
---

# BMAD Create Product Brief Workflow

This skill activates the BMAD Create Product Brief workflow. It guides a
collaborative step-by-step discovery process to create a comprehensive
product brief as a creative Business Analyst working with the user as peers.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Initialization and document setup
- Step 2: Vision discovery
- Step 3: Users and personas
- Step 4: Metrics and success criteria
- Step 5: Scope and MVP definition
- Step 6: Completion and output
- Template from the workflow directory
- Output to planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- NEVER generate content without user input — you are a FACILITATOR
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- This is a PARTNERSHIP — collaborative dialogue, not command-response

## What's Next

After creating a product brief, the typical next steps are:
- **Create PRD (CP)** — full product requirements document
- Optional: **Research (MR/DR/TR)** — if more information is needed
- Recommend starting a **new chat session** for the PRD workflow
