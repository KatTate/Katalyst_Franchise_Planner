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

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS use the documentation-requirements.csv for project type detection
- Documentation must be COMPREHENSIVE — cover architecture, patterns, and conventions

## What's Next

After documenting a project, the typical next steps are:
- **Generate Project Context (GPC)** — create the lean AI agent reference file
- **Assess Project (AP)** — if formal BMAD planning is needed
- Use the generated docs to onboard new developers or AI agents
