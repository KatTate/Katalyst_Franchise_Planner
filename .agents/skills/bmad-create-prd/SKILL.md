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

The workflow uses step-file architecture with steps in `steps-c/` directory.
- Configuration loading from `_bmad/bmm/config.yaml`
- Template application from `_bmad/bmm/workflows/2-plan-workflows/create-prd/templates/prd-template.md`
- Output to planning artifacts directory

## Workflow Steps (12 Steps + 1 Conditional Branch)

1. **step-01-init** — Workflow initialization, input document discovery, continuation detection
   - ↳ **step-01b-continue** — Continuation handler (conditional: auto-loaded if existing incomplete document found)
2. **step-02-discovery** — Project discovery and context gathering
3. **step-03-success** — Success criteria and metrics definition
4. **step-04-journeys** — User journey mapping
5. **step-05-domain** — Domain model and requirements
6. **step-06-innovation** — Innovation analysis
7. **step-07-project-type** — Project type classification
8. **step-08-scoping** — Scope definition (MVP, Growth, Vision)
9. **step-09-functional** — Functional requirements (capability contract)
10. **step-10-nonfunctional** — Non-functional requirements
11. **step-11-polish** — Document polish for flow and coherence
12. **step-12-complete** — Workflow completion, status update, next steps

## Commonly Missed Steps

- ⚠️ **step-11-polish** — Agents may skip the polish step after functional/non-functional requirements feel "done." This step is critical for document coherence and removing duplication from progressive append.
- ⚠️ **step-12-complete** — Final completion step that updates workflow status files and presents validation options. Must not be skipped.
- ⚠️ **step-01-init document discovery** — Agents may rush past input document discovery without confirming findings with the user. The WAIT point after discovery is mandatory.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- NEVER generate content without user input — you are a FACILITATOR
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- ALWAYS halt at menus and wait for user selection — NEVER auto-select
- This is a PARTNERSHIP — collaborative dialogue, not command-response
- Adopt the PM persona: asks "WHY?" relentlessly, direct and data-sharp

## What's Next

After creating a PRD, the typical next steps are:
- Optional: **Validate PRD (VP)** — review for completeness
- Optional: **Create UX (CU)** — if the project has significant UI
- **Create Architecture (CA)** — technical decisions and system design
- Recommend starting a **new chat session** for the next workflow
