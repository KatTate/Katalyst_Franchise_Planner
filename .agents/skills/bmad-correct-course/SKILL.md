---
name: bmad-correct-course
description: >
  BMAD Method: Navigate significant changes during sprint execution by analyzing
  impact and proposing solutions. Use when user says "correct course", "CC",
  "change direction", "pivot", "we need to change", or discovers major changes
  needed mid-implementation. Anytime workflow.
---

# BMAD Correct Course Workflow

This skill activates the BMAD Course Correction workflow. It analyzes the
impact of significant changes discovered during sprint execution and proposes
solutions for how to proceed.

## Workflow Steps (8 Total)

1. **Step 0.5: Discover and load project documents** — invoke discovery protocol, load PRD, epics, architecture, UX, tech spec
2. **Initialize Change Navigation** — confirm change trigger, verify document access, select mode (incremental vs batch)
3. **⚠️ Platform intelligence** — git history analysis, codebase health assessment (LSP + tech debt), sprint status cross-reference
4. **Execute Change Analysis Checklist** — work through systematic analysis checklist interactively with user
5. **Draft Specific Change Proposals** — create explicit edit proposals for each artifact (old → new format)
6. **⚠️ Generate Sprint Change Proposal** — compile comprehensive proposal document with impact analysis and recommendations
7. **⚠️ Finalize and Route for Implementation** — get user approval, classify scope, route to appropriate agents
8. **Workflow Completion** — summarize execution, confirm deliverables, report completion

## Commonly Missed Steps

- **Step 2 (Platform intelligence)**: Agents skip git analysis and codebase health
  assessment, missing critical context about what's actually been built and the
  codebase state before proposing changes.
- **Step 5 (Generate Sprint Change Proposal)**: Agents produce vague proposals
  instead of comprehensive documents with all 5 required sections (Issue Summary,
  Impact Analysis, Recommended Approach, Detailed Proposals, Implementation Handoff).
- **Step 6 (Finalize and Route)**: Agents skip getting explicit user approval and
  fail to classify change scope (Minor/Moderate/Major) for proper routing.
- **Sprint status update**: After approval, sprint-status.yaml must be updated to
  reflect any epic/story changes. This is in the checklist but commonly missed.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all 8 steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Loading all planning artifacts (PRD, epics, architecture, UX, tech spec)
- Sprint status analysis
- Impact assessment and change proposal generation
- Instructions and checklist from the workflow directory
- Output: change proposal document in planning artifacts

## Critical Rules

- This workflow has **8 steps**. You are NOT done until the Sprint Change Proposal is finalized and routed.
- NEVER skip steps or optimize the sequence — execute ALL 8 steps in exact order
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS load ALL planning documents for comprehensive impact analysis
- HALT if change trigger is unclear — cannot navigate change without understanding the issue
- HALT if core documents are unavailable — need PRD, Epics, Architecture, UI/UX for impact assessment
- HALT if user approval is not obtained — must have explicit approval before implementing changes
- Sprint Change Proposal MUST include all 5 sections: Issue Summary, Impact Analysis, Recommended Approach, Detailed Proposals, Implementation Handoff
- ALWAYS update sprint-status.yaml after approved epic/story changes (checklist section 6.4)

## What's Next

After course correction, the updated plans will guide next steps —
typically returning to the story cycle with adjusted scope.
