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

The workflow uses step-file architecture with configuration loading from `_bmad/bmm/config.yaml`
and project context loading (if exists).

## Workflow Steps (6 Total)

1. **Step 1: Mode Detection** — Determine execution mode (tech-spec vs direct), capture baseline commit, handle escalation
2. **Step 2: Context Gathering** — (Direct mode only) Identify files, patterns, dependencies; present plan for user confirmation
3. **Step 3: Execute Implementation** — Implement all tasks using acceptance criteria as definition of done
4. **Step 4: Self-Check** — Audit completed work against acceptance criteria, tests, and patterns
5. **Step 5: Code Review** — Construct diff from baseline, invoke adversarial review, present findings
6. **Step 6: Resolve Findings** — Handle review findings interactively (walk-through/auto-fix/skip), finalize tech-spec

## Commonly Missed Steps

- ⚠️ **Step 4 (Self-Check):** Agents rush past self-audit after implementation — MUST verify all ACs are satisfied and update tech-spec status before proceeding
- ⚠️ **Step 5 (Code Review):** Agents skip diff construction or accept zero findings without questioning — diff from `{baseline_commit}` is MANDATORY
- ⚠️ **Step 6 (Resolve Findings):** Agents skip presenting resolution options to user — MUST present [W]/[F]/[S] menu and HALT for user input
- ⚠️ **Step 1 Escalation Menus:** Agents auto-select instead of HALTING for user input after presenting escalation options

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS capture `{baseline_commit}` in Step 1 — it is CRITICAL for Step 5 diff construction
- ALWAYS present menu options and HALT — do NOT auto-select on behalf of the user
- The agent plans its OWN implementation approach — do not use pre-scripted task checklists
- NEVER accept zero findings in Step 5 without questioning — this is suspicious

## What's Next

After quick dev, the typical next step is:
- **Code Review (CR)** — validate the implementation quality
