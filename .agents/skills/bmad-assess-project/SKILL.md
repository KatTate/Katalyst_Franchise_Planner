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

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- Scan the project like an engineer onboarding to a new codebase
- Focus on PRACTICAL discovery that feeds into BMAD planning

## What's Next

After assessment, the typical next steps depend on findings:
- **Create Brief (CB)** — if the project needs a clear product definition
- **Create PRD (CP)** — if brief exists but requirements are unclear
- **Create Architecture (CA)** — if PRD exists but architecture needs formalization
