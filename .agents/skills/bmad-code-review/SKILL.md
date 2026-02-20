---
name: bmad-code-review
description: >
  BMAD Method: Adversarial code review verifying implementation against story
  acceptance criteria and dev notes. Use when user says "code review", "CR",
  "review code", "review my code", or requests code quality review.
  Phase 4 Implementation workflow.
---

# BMAD Code Review Workflow

This skill activates the BMAD Code Review workflow. It performs adversarial
code review that verifies implementation against story acceptance criteria
and dev notes constraints, checking code quality, security, and test coverage.

## Workflow Steps (6 Total — ALL MANDATORY)

1. **Load story and discover changes** — load story file, run git commands unconditionally, cross-reference File List vs git reality
2. **Build review attack plan** — extract ACs, Dev Notes constraints, create review plan
3. **Execute adversarial review** — validate every claim, check ACs, Dev Notes compliance, code quality deep dive
4. **Platform intelligence scan** — LSP diagnostics (use LSP tool per file), architect tool analysis (with git diff), visual verification for UI stories
5. **Present findings and resolve** — categorize findings, present to user, fix or document issues
6. **Update story status, sync sprint tracking, and validate completion** — determine new status, update story file, sync sprint-status.yaml, verify all step variables are set

## Commonly Missed Steps

- **Step 1 git discovery**: The agent MUST run `git status`, `git log`, and
  `git diff` commands unconditionally. These are NOT optional. Cross-reference
  results against the story's File List.
- **Step 3 minimum issue enforcement**: The reviewer MUST find at least 3
  specific issues. If fewer than 3 are found, re-examine the code harder.
  No lazy "looks good" reviews.
- **Step 4 (Platform intelligence scan)**: Agents skip LSP diagnostics,
  architect analysis, and visual verification. These platform checks catch
  issues that manual code reading misses. Use the LSP diagnostics tool on
  each changed file. Use the architect tool with story context and git diff.
  Use the screenshot tool for UI stories.
- **Step 6 (Update story status and sync sprint tracking)**: After presenting
  findings and resolving them, the reviewer MUST update the story status and
  sync sprint-status.yaml. This step is commonly skipped after the more
  engaging review and fix work. The final output MUST include completion
  verification variables proving all steps executed.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Story file discovery for the story being reviewed
- Architecture and UX doc loading for review context
- Sprint status tracking
- Instructions execution from the workflow's instructions.xml
- Checklist validation from the workflow's checklist.md

## Critical Rules

- YOU ARE AN ADVERSARIAL REVIEWER — assume problems exist and find them
- Find 3-10 specific issues in every review minimum — no lazy "looks good" reviews
- NEVER skip steps or optimize the sequence — ALL 6 STEPS ARE MANDATORY
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.xml referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- Step 4 is MANDATORY — run LSP diagnostics tool and architect tool
- Step 6 is MANDATORY — story status and sprint tracking MUST be updated
- The final output MUST include all completion verification variables — if any are missing, a step was skipped
- Do NOT present a "complete" summary until Step 6's completion gate passes

## What's Next

After code review, the typical next steps are:
- If fixes needed: **Dev Story (DS)** — go back and fix the issues found
- If passed: **Next Story (CS)** — create the next story in the sprint
- If epic complete: **Retrospective (ER)** — review the completed epic
