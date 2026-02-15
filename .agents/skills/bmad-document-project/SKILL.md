---
name: bmad-document-project
description: >
  BMAD Method: Analyze and document established projects by scanning codebase,
  architecture, and patterns to create comprehensive reference documentation.
  Use when user says "document project", "DP", "generate docs", "project
  documentation", or needs comprehensive technical documentation.
  Anytime workflow.
---

# BMAD Document Project Workflow

This skill activates the BMAD Document Project workflow. It analyzes an
established project by scanning its codebase, architecture, and patterns
to produce comprehensive reference documentation for AI-assisted development.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/document-project/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Project type detection via documentation requirements CSV
- Codebase scanning and analysis
- Architecture pattern identification
- Documentation generation using workflow instructions and validation checklist
- Output: comprehensive project documentation

## Workflow Steps (4 Total)

1. **Step 1: Validate Workflow** — Check project status, detect greenfield/brownfield, validate sequencing
2. **Step 2: Check Resumability** — Check for existing state file (project-scan-report.json), offer resume/fresh/cancel
3. **Step 3: Determine Workflow Mode** — Check for existing docs, offer re-scan/deep-dive/cancel, delegate to sub-workflows
4. **Step 4: Update Status & Complete** — Update workflow status tracking, present completion summary

## Commonly Missed Steps

- ⚠️ **Step 2 Resumability:** Agents skip checking for existing state file — MUST check `project-scan-report.json` FIRST before loading CSV files
- ⚠️ **Write-As-You-Go:** Agents accumulate findings in memory instead of writing each document to disk IMMEDIATELY — context will snowball and degrade quality
- ⚠️ **State File Updates:** Agents forget to update state file after each step — MUST update for resumability
- ⚠️ **Validation Checklist:** Agents skip running the comprehensive checklist — MUST validate against `checklist.md` before completion
- ⚠️ **Context Purging:** Agents keep detailed findings in context after writing — MUST purge to summaries only (1-2 sentences per section)

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS use the documentation-requirements.csv for project type detection
- ALWAYS write documents to disk IMMEDIATELY — do not accumulate in memory
- ALWAYS update state file after each step for resumability
- ALWAYS purge detailed findings from context after writing (keep summaries only)
- Documentation must be COMPREHENSIVE — cover architecture, patterns, and conventions

## What's Next

After documenting a project, the typical next steps are:
- **Generate Project Context (GPC)** — create the lean AI agent reference file
- **Assess Project (AP)** — if formal BMAD planning is needed
- Use the generated docs to onboard new developers or AI agents
