---
name: bmad-quick-spec
description: >
  BMAD Method: Conversational spec engineering — ask questions, investigate code,
  produce implementation-ready tech-spec. Use when user says "quick spec", "QS",
  "quick architecture", "fast spec", or needs a fast tech spec with acceptance
  criteria without full planning. Anytime workflow.
---

# BMAD Quick Spec Workflow

This skill activates the BMAD Quick Spec workflow. It creates implementation-ready
technical specifications through conversational discovery, code investigation,
and structured documentation.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Understand the request through conversation
- Step 2: Investigate existing code and context
- Step 3: Generate the tech spec with acceptance criteria
- Step 4: Review and refine the spec
- Output to the planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- The spec must meet the "Ready for Development" standard before completion:
  - Actionable: every task has a clear file path and specific action
  - Logical: tasks ordered by dependency
  - Testable: all ACs follow Given/When/Then
  - Complete: no placeholders or TBD
  - Self-Contained: a fresh agent can implement without reading chat history

## What's Next

After creating a quick spec, the typical next step is:
- **Quick Dev (QD)** — implement the spec
