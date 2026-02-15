---
name: bmad-assess-project
description: >
  BMAD Method: Scan an existing project to understand its current state,
  technology stack, architecture, and patterns. Use when user says "assess
  project", "AP", "scan project", "brownfield assessment", or has an existing
  codebase to analyze before starting BMAD planning. Phase 0 Assessment workflow.
---

# BMAD Assess Established Project Workflow

This skill activates the BMAD Brownfield Assessment workflow. It scans an
existing project to understand what's built, identify the tech stack and
architecture patterns, then determines the optimal BMAD entry point.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/0-assess/assess-brownfield/workflow.md`

The workflow uses step-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Project scanning (files, structure, dependencies, patterns)
- Technology stack identification
- Architecture pattern recognition
- Replit-specific structure analysis (workflows, database, deployment)
- Assessment template application
- Output: brownfield assessment report

## Workflow Steps (3 Total)

1. **Step 1: Project Scan & Discovery** (`steps/step-01-scan.md`) — Systematically scan the existing Replit project: environment scan, tech stack discovery, architecture pattern discovery, current state assessment, platform intelligence (LSP diagnostics, git history, tech debt markers, database schema, visual state capture), present discovery summary, validate assumptions with user, initialize assessment document
2. **Step 2: BMAD Entry Point Assessment** (`steps/step-02-assess.md`) — Analyze scan findings AND user's validated answers to determine project maturity, map existing work to BMAD phases with skeptical lens, recommend optimal entry point (Path A-E), present assessment with phase mapping table
3. **Step 3: Integration & Kickoff** (`steps/step-03-integrate.md`) — Finalize assessment document, update replit.md project state, recommend Generate Project Context if applicable, present kickoff summary with workflow sequence and trigger phrases

## Commonly Missed Steps

- ⚠️ **Step 1 — Assumption Validation (Section 6)**: Agents frequently skip the "Validate Assumptions" section in Step 1, treating scan results as settled facts instead of presenting them as questions for user confirmation. This is marked CRITICAL — DO NOT SKIP in the step file. The user's answers dramatically change which BMAD path is appropriate.
- ⚠️ **Step 1 — Platform Intelligence (Section 4.5)**: Agents tend to skip LSP diagnostics, git history analysis, tech debt marker scanning, database schema scanning, and visual state capture. These provide objective baselines beyond visual scanning.
- ⚠️ **Step 3 — replit.md Update**: Agents skip updating replit.md with established project state. This is marked FORBIDDEN to skip in the step file.
- ⚠️ **Step 3 — GPC Recommendation**: Agents skip recommending Generate Project Context when the chosen path includes it (Paths A, B, or D).

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- NEVER proceed from Step 1 to Step 2 until user explicitly selects [C] AND has answered the assumption validation questions
- NEVER proceed from Step 2 to Step 3 until user has explicitly chosen a path (A/B/C/D/E or custom)
- NEVER treat existing code as "complete" or "working" without user confirmation — code existing does NOT mean a feature is done
- NEVER mark BMAD phases as "done" just because code exists — BE SKEPTICAL
- ALWAYS present assumptions as questions for user validation, not as settled facts
- ALWAYS scan Replit-specific resources (workflows, database, env vars, deployment)
- ALWAYS run platform intelligence scans (LSP, git, debt markers) — do not skip them
- FORBIDDEN to modify anything between `<!-- BMAD-METHOD-START -->` and `<!-- BMAD-METHOD-END -->` markers in replit.md

## What's Next

After assessment, the typical next steps depend on findings:
- **Create Brief (CB)** — if the project needs a clear product definition
- **Create PRD (CP)** — if brief exists but requirements are unclear
- **Create Architecture (CA)** — if PRD exists but architecture needs formalization
