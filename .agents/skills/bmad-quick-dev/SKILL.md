---
name: bmad-quick-dev
description: >
  BMAD Method: Flexible development — execute tech-specs or direct instructions
  with optional planning. Use when user says "quick dev", "QD", "quick build",
  "just build it", "quick implementation", or wants fast implementation from
  a spec or direct instructions. Anytime workflow.
---

# BMAD Quick Dev Workflow

This skill activates the BMAD Quick Dev workflow. It executes implementation
tasks efficiently, either from a tech-spec or direct user instructions.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Mode detection (tech-spec vs direct instructions)
- Step 2: Context gathering
- Step 3: Execute implementation
- Step 4: Self-check
- Step 5: Review
- Step 6: Resolve findings
- Project context loading (if exists)

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- The agent plans its OWN implementation approach — do not use pre-scripted task checklists

## What's Next

After quick dev, the typical next step is:
- **Code Review (CR)** — validate the implementation quality
