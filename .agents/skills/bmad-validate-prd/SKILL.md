---
name: bmad-validate-prd
description: >
  BMAD Method: Validate an existing PRD against BMAD standards for completeness,
  clarity, and quality. Use when user says "validate PRD", "VP", "review PRD",
  "check PRD", or wants to verify their PRD meets quality standards.
  Phase 2 Planning workflow.
---

# BMAD Validate PRD Workflow

This skill activates the BMAD PRD Validation workflow. It reviews an existing
PRD against BMAD standards through comprehensive quality assessment.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- PRD file discovery and loading
- Validation steps for completeness, clarity, and cohesion
- Output validation report

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- Recommend using a different high-quality LLM for validation if available

## What's Next

After validating a PRD, the typical next steps are:
- If issues found: **Edit PRD (EP)** — fix the identified problems
- If passed: **Create Architecture (CA)** or **Create UX (CU)**
