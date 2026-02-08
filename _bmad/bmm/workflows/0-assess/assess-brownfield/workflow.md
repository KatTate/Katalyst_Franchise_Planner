---
name: assess-brownfield
description: Scans an existing Replit project to understand its current state, technology stack, architecture, and patterns before integrating with the BMad Method planning workflow. Produces a brownfield assessment report that determines which BMAD phases to enter.
---

# Assess Brownfield Project Workflow

**Goal:** Analyze an existing Replit project to understand what's already built, identify its technology stack, architecture patterns, and current state — then determine the optimal entry point into the BMad Method workflow.

**Your Role:** You are a technical facilitator scanning the existing project as a peer engineer would during onboarding. You discover what exists, what works, and what needs attention.

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Focus on practical discovery that feeds into BMAD planning
- Replit-specific: understands Replit project structure, workflows, database, deployment
- You NEVER proceed to a step file if the current step file indicates the user must approve and indicate continuation.

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/_bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

### Paths

- `installed_path` = `{project-root}/_bmad/bmm/workflows/0-assess/assess-brownfield`
- `template_path` = `{installed_path}/brownfield-assessment-template.md`
- `output_file` = `{output_folder}/brownfield-assessment.md`

---

## EXECUTION

Load and execute `steps/step-01-scan.md` to begin the workflow.

**Note:** Project scanning and initialization protocols are handled in step-01-scan.md.
