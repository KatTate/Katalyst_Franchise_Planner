---
name: bmad-brainstorm
description: >
  BMAD Method: Facilitate interactive brainstorming sessions using diverse
  creative techniques. Use when user says "brainstorm", "BP", "generate ideas",
  "brainstorm project", or wants to explore ideas through guided techniques.
  Phase 1 Analysis workflow.
---

# BMAD Brainstorming Workflow

This skill activates the BMAD Brainstorming workflow. It facilitates interactive
brainstorming sessions using diverse creative techniques and ideation methods,
aiming for 100+ ideas before any organization.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/core/workflows/brainstorming/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/core/config.yaml`
- Session setup and technique discovery
- Technique selection (user-selected, AI-recommended, random, or progressive)
- Technique execution with anti-bias protocols
- Idea organization and session output
- Brain techniques loaded from CSV data file
- Output to brainstorming directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- Keep the user in GENERATIVE EXPLORATION mode as long as possible
- Shift creative domain every 10 ideas to combat sequential bias
- Aim for 100+ ideas before organizing — the magic happens in ideas 50-100

## What's Next

After brainstorming, the typical next steps are:
- **Create Brief (CB)** — nail down the product idea from brainstorming output
- Optional: **Research (MR/DR/TR)** — if topics need deeper investigation
