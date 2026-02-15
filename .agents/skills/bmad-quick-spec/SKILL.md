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

The workflow uses step-file architecture with configuration loading from `_bmad/bmm/config.yaml`.
Output goes to the planning/implementation artifacts directory.

## Workflow Steps (4 Total)

1. **Step 1: Analyze Requirement Delta** — Check for WIP, greet user, orient scan, ask informed questions, capture core understanding, initialize WIP file
2. **Step 2: Map Technical Constraints** — Load WIP, investigate code deeply, document technical context (stack, patterns, files), update WIP
3. **Step 3: Generate Implementation Plan** — Create tasks with specific files and actions, generate Given/When/Then ACs, complete dependencies and testing strategy
4. **Step 4: Review & Finalize** — Present complete spec for review, handle edits, verify Ready-for-Dev standard, rename to final file, offer adversarial review

## Commonly Missed Steps

- ⚠️ **Step 1 WIP Check:** Agents skip checking for existing WIP file before greeting — MUST check `{wipFile}` FIRST
- ⚠️ **Step 2 Investigation Depth:** Agents do surface scans instead of reading complete files — MUST read files fully and document patterns
- ⚠️ **Step 3 AC Quality:** Agents write vague ACs instead of Given/When/Then — every AC MUST be testable
- ⚠️ **Step 4 Ready-for-Dev Verification:** Agents mark complete without verifying the standard — spec MUST be Actionable, Logical, Testable, Complete, and Self-Contained
- ⚠️ **Step 4 File Rename:** Agents forget to rename WIP to `tech-spec-{slug}.md` — MUST rename before completion
- ⚠️ **Checkpoint Menus (All Steps):** Agents auto-proceed past [A]/[P]/[C] menus — MUST HALT and wait for user selection

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update `stepsCompleted` in WIP frontmatter when completing each step
- NEVER create mental todo lists from future steps
- The spec MUST meet the "Ready for Development" standard before completion:
  - Actionable: every task has a clear file path and specific action
  - Logical: tasks ordered by dependency
  - Testable: all ACs follow Given/When/Then
  - Complete: no placeholders or TBD
  - Self-Contained: a fresh agent can implement without reading chat history

## What's Next

After creating a quick spec, the typical next step is:
- **Quick Dev (QD)** — implement the spec (recommended in a FRESH CONTEXT)
