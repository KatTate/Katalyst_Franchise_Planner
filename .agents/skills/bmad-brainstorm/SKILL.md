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

The workflow uses step-file architecture with configuration loading from `_bmad/core/config.yaml`.
Brain techniques loaded from CSV data file. Output to brainstorming directory.

## Workflow Steps (8 Step Files Total)

1. **Step 1: Session Setup** — Check for existing session, initialize document, gather session context, present technique approach selection (4 options)
2. **Step 1b: Continue** — (Conditional) Handle continuation of existing session with progress analysis
3. **Step 2a: User-Selected Techniques** — Browse technique library by category, select from 36+ techniques
4. **Step 2b: AI-Recommended Techniques** — Context-analyzed technique recommendations matched to session goals
5. **Step 2c: Random Selection** — Serendipitous technique discovery with intelligent random selection
6. **Step 2d: Progressive Flow** — 4-phase systematic journey from exploration to action planning
7. **Step 3: Technique Execution** — Interactive facilitation with anti-bias protocols, aim for 100+ ideas, energy checkpoints
8. **Step 4: Idea Organization** — Theme identification, prioritization, action planning, session documentation

## Commonly Missed Steps

- ⚠️ **Step 1 Existing Session Check:** Agents skip checking for existing brainstorming document — MUST check FIRST and route to Step 1b if found
- ⚠️ **Step 3 Anti-Bias Domain Pivot:** Agents cluster ideas semantically — MUST consciously shift creative domain every 10 ideas
- ⚠️ **Step 3 Quantity Target:** Agents move to organization too early — aim for 100+ ideas MINIMUM before suggesting Step 4
- ⚠️ **Step 3 Energy Checkpoints:** Agents skip periodic check-ins — MUST check energy after every 4-5 exchanges
- ⚠️ **Step 4 Action Planning:** Agents skip creating concrete next steps — MUST develop actionable plans for prioritized ideas, not just organize themes
- ⚠️ **Technique Approach Menus:** Agents auto-select approach — MUST HALT and wait for user to choose 1-4

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per major workflow phase: (1) Session Setup, (2) Technique Selection (covers steps 2a-2d based on user choice), (3) Technique Execution & Idea Generation, (4) Idea Organization & Action Planning. If Step 1b continuation is triggered, add it as a task dynamically. Each task should include the phase number and name (e.g., "Phase 1: Session Setup — Check for existing session, gather context"). Mark the first task as `in_progress`. As you complete each phase, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- Keep the user in GENERATIVE EXPLORATION mode as long as possible
- Shift creative domain every 10 ideas to combat sequential bias (Anti-Bias Protocol)
- Aim for 100+ ideas before organizing — the magic happens in ideas 50-100
- NEVER suggest organization until user explicitly requests it OR 100+ ideas AND 45+ minutes
- Default is to KEEP EXPLORING — only move to organization when user explicitly requests it
- Use IDEA FORMAT TEMPLATE: [Category #X]: Title / Concept / Novelty

## What's Next

After brainstorming, the typical next steps are:
- **Create Brief (CB)** — nail down the product idea from brainstorming output
- Optional: **Research (MR/DR/TR)** — if topics need deeper investigation
