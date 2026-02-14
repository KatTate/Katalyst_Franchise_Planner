---
name: bmad-research
description: >
  BMAD Method: Conduct research using web data and verified sources. Supports
  three types: market research (MR), domain research (DR), and technical
  research (TR). Use when user says "market research", "domain research",
  "technical research", "MR", "DR", "TR", or needs competitive analysis,
  industry deep dive, or technical feasibility study. Phase 1 Analysis workflow.
---

# BMAD Research Workflows

This skill handles all three BMAD research types. Determine which type the user
needs and load the corresponding workflow.

## Market Research (MR)

When user says "market research", "MR", "competitive analysis", "market analysis":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-market-research.md`

Covers: market size, growth, competition, and customer insights.

## Domain Research (DR)

When user says "domain research", "DR", "industry research", "domain deep dive":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-domain-research.md`

Covers: industry analysis, regulations, technology trends, ecosystem dynamics.

## Technical Research (TR)

When user says "technical research", "TR", "tech feasibility", "technology research":

Read fully and follow: `_bmad/bmm/workflows/1-analysis/research/workflow-technical-research.md`

Covers: technology evaluation, architecture decisions, implementation approaches.

## Critical Rules (All Research Types)

- Web search is REQUIRED — if unavailable, abort and tell the user
- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS use verified sources with proper citations
- This is a COLLABORATION — user brings domain knowledge, you bring research methodology

## What's Next

After research, the typical next steps are:
- **Create Brief (CB)** — if defining a new product idea
- **Create PRD (CP)** — if research was to inform requirements
