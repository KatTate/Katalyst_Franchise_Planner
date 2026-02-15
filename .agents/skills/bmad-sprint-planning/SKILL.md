---
name: bmad-sprint-planning
description: >
  BMAD Method: Generate and manage the sprint status tracking file for
  implementation. Use when user says "sprint planning", "SP", "plan the sprint",
  "create sprint plan", or needs to select stories and plan build order.
  Phase 4 Implementation workflow.
---

# BMAD Sprint Planning Workflow

This skill activates the BMAD Sprint Planning workflow. It extracts all epics
and stories from epic files and creates the sprint status tracking file that
drives the implementation lifecycle.

## Workflow Steps (6 Total)

1. **Parse epic files and extract all work items** — find all epic files, extract epic numbers, story IDs, convert to kebab-case keys
2. **Step 0.5: Discover and load project documents** — invoke discovery protocol, load all epics content (FULL_LOAD strategy)
3. **Build sprint status structure** — create epic entries, story entries, and retrospective entries in correct order
4. **Apply intelligent status detection** — check for existing story files, preserve advanced statuses, never downgrade status
5. **Generate sprint status file** — write complete YAML with dual metadata (comments + fields), ensure proper ordering
6. **⚠️ Validate and report** — verify every epic/story appears, check for orphans, validate YAML syntax, display summary

## Commonly Missed Steps

- **Step 3 (Intelligent status detection)**: Agents sometimes skip checking for
  existing story files that should upgrade status from "backlog" to "ready-for-dev".
  They also fail to preserve more advanced statuses when regenerating the file.
- **Step 5 (Validate and report)**: Agents skip validation after generation,
  missing orphaned entries, mismatched counts, or invalid YAML syntax. The
  validation checklist MUST be applied before reporting success.

## Activation

When this skill is triggered, execute the BMAD workflow by following these steps exactly:

### 1. Load the Workflow Engine

Read the BMAD workflow execution engine:
`_bmad/core/tasks/workflow.xml`

### 2. Load the Workflow Configuration

Pass this workflow configuration file to the engine:
`_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml`

### 3. Execute

Follow the workflow engine instructions precisely, processing the workflow YAML
through all 6 steps in order. The workflow engine handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Epic file discovery and loading (all epics)
- Sprint status template application
- Sprint status file creation at `implementation_artifacts/sprint-status.yaml`
- Checklist validation

## Critical Rules

- NEVER skip steps or optimize the sequence — execute ALL 6 steps in exact order
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS save output after completing EACH workflow step
- ALWAYS follow the instructions.md referenced in the workflow YAML
- ALWAYS apply the checklist.md validation before completing
- ALL epics must be loaded to build the complete status — use FULL_LOAD strategy
- NEVER downgrade a story's status — if existing sprint-status.yaml has a more advanced status, preserve it
- Metadata MUST appear TWICE — once as comments for documentation, once as YAML fields for parsing
- Story keys MUST follow kebab-case format: `{epic}-{story}-{title}` (e.g., `1-1-user-authentication`)

## What's Next

After sprint planning, the typical next step is:
- **Create Story (CS)** — prepare the first story for implementation
