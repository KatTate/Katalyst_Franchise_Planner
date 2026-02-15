---
name: bmad-retrospective
description: >
  BMAD Method: Epic completion review — extract lessons learned and assess
  impact on remaining work. Use when user says "retrospective", "ER",
  "epic review", "lessons learned", or completes an epic.
  Phase 4 Implementation workflow.
---

# BMAD Retrospective Workflow

This skill activates the BMAD Retrospective workflow. It reviews a completed
epic to extract lessons learned and assess if new information impacts
remaining work.

## Workflow Steps (15 Total)

1. **Epic Discovery** — find completed epic with priority logic (sprint-status → user input → stories folder fallback)
2. **Step 0.5: Discover and load project documents** — invoke discovery protocol, load epic, architecture, PRD content
3. **Deep Story Analysis** — extract lessons from each story's dev notes, reviews, challenges, and debt
4. **⚠️ Step 2.5: Git Commit History Analysis** — analyze git history for commit patterns, file churn, fix ratios (Replit platform intelligence)
5. **⚠️ Step 2.75: Codebase Health Scan** — LSP diagnostics on changed files, search for tech debt markers (TODO, FIXME, HACK)
6. **Load and Integrate Previous Epic Retrospective** — cross-reference action items from previous retro, check follow-through
7. **Preview Next Epic with Change Detection** — load next epic, identify dependencies and assumptions
8. **Initialize Retrospective with Rich Context** — present epic summary metrics, set ground rules, assemble team with PARTY MODE format
9. **Epic Review Discussion** — facilitate team discussion on what went well AND what needs improvement, weave in story analysis patterns
10. **Next Epic Preparation Discussion** — collaborative discussion on readiness, dependencies, technical prep, knowledge gaps
11. **⚠️ Synthesize Action Items with Change Detection** — create SMART action items, assign ownership, detect if discoveries require epic updates
12. **⚠️ Critical Readiness Exploration** — interactive deep dive into testing, deployment, stakeholder acceptance, technical health
13. **⚠️ Retrospective Closure** — celebration, key takeaways, next steps
14. **⚠️ Save Retrospective and Update Sprint Status** — write retro document, update sprint-status.yaml
15. **Final Summary and Handoff** — verify document saved, sprint status updated, all action items documented

## Commonly Missed Steps

- **Step 2.5 and 2.75 (Platform intelligence)**: Agents skip git analysis and
  codebase health scans, missing objective data about commit patterns, file churn,
  and tech debt markers that enrich the retrospective discussion.
- **Step 8 (Synthesize Action Items with Change Detection)**: Agents skip creating
  structured SMART action items and miss the critical change detection analysis that
  determines if discoveries require epic updates before proceeding.
- **Step 9 (Critical Readiness Exploration)**: Agents rush through the readiness
  assessment instead of doing interactive deep dives into testing, deployment,
  stakeholder acceptance, and technical health.
- **Steps 11-12 (Save and Update)**: After the engaging team discussion, agents
  commonly skip saving the retrospective document and updating sprint-status.yaml.
  Both are MANDATORY — the retro document captures lessons for future epics.
- **Previous retro follow-through (Step 3)**: Agents skip checking whether action
  items from the previous epic's retrospective were actually completed.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all 15 steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Completed epic file loading
- Sprint status analysis
- Agent manifest loading for multi-perspective review
- Instructions execution from the workflow directory
- Lessons learned documentation

## Critical Rules

- This workflow has **15 steps**. You are NOT done until the retrospective document is saved and sprint status is updated.
- NEVER skip steps or optimize the sequence — execute ALL steps in exact order
- NEVER auto-proceed past WAIT points — stop and wait for user input at every WAIT gate
- ALWAYS save output after completing EACH workflow step
- Focus on ACTIONABLE lessons — what should change going forward
- ALWAYS check previous retro action items for follow-through — pattern recognition across epics is critical
- ALWAYS run platform intelligence scans (git analysis, LSP, tech debt markers) — objective data enriches the discussion
- Steps 11-12 (Save Retrospective and Update Sprint Status) are MANDATORY — do NOT skip after the discussion
- NO TIME ESTIMATES — never mention hours, days, weeks, or timelines
- Retrospective uses PARTY MODE format — all agent dialogue MUST use "Name (Role): dialogue" format

## What's Next

After retrospective, the typical next steps are:
- **Sprint Planning (SP)** — plan the next epic if sprint continues
- **Create Story (CS)** — start the next story
