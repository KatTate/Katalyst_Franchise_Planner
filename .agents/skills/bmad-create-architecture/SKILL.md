---
name: bmad-create-architecture
description: >
  BMAD Method: Collaborative architectural decision facilitation for AI-agent
  consistency. Use when user says "create architecture", "CA", "architect the
  solution", "technical architecture", or needs technical decisions on stack,
  database, APIs, and folder structure. Phase 3 Solutioning workflow.
---

# BMAD Create Architecture Workflow

This skill activates the BMAD Create Architecture workflow. It creates
comprehensive architecture decisions through collaborative step-by-step
discovery that ensures AI agents implement consistently.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step 1: Initialization and input document discovery
- Step 2: Context and technical decisions
- Additional steps for architecture sections
- Data files from the workflow's data directory
- Output to planning artifacts directory

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter stepsCompleted before loading next step
- This is a PARTNERSHIP — you bring architectural knowledge, user brings domain expertise
- Focus on DECISIONS that prevent implementation conflicts between AI agents

## What's Next

After creating architecture, the typical next steps are:
- **Create Epics (CE)** — break work into epics and stories
- Recommend starting a **new chat session** for the epics workflow
