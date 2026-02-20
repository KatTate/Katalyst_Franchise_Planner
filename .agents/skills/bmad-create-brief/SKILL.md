---
name: bmad-create-brief
description: >
  BMAD Method: Guided session to define your product idea, users, and MVP scope.
  Use when user says "create brief", "CB", "product brief", "project brief",
  or wants to nail down their product idea. Phase 1 Analysis workflow.
---

# BMAD Create Product Brief Workflow

This skill activates the BMAD Create Product Brief workflow. It guides a
collaborative step-by-step discovery process to create a comprehensive
product brief as a creative Business Analyst working with the user as peers.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md`

The workflow uses step-file architecture with 7 step files (6 sequential steps plus a continuation handler).

## Workflow Steps (7 Step Files, 6 Sequential Steps)

1. **Step 1: Initialization** (`steps/step-01-init.md`) — Detect continuation state, discover input documents (brainstorming, research, project docs, project context) using smart discovery with sharded-folder logic, create output document from template, report setup to user. Auto-proceeds to Step 2 after setup.
2. **Step 1B: Continuation** (`steps/step-01b-continue.md`) — Resume workflow from where it left off. Analyze frontmatter `stepsCompleted` and `lastStep`, reload context documents from `inputDocuments`, present progress report, route to correct next step. Only loaded if existing workflow document is detected.
3. **Step 2: Product Vision Discovery** (`steps/step-02-vision.md`) — Collaborative discovery of core problem, current solutions analysis, solution vision, unique differentiators. Generates Executive Summary and Core Vision sections. Presents [A] Advanced Elicitation / [P] Party Mode / [C] Continue menu.
4. **Step 3: Target Users Discovery** (`steps/step-03-users.md`) — Define primary and secondary user segments with rich personas, map user journeys (discovery → onboarding → core usage → success moment → long-term). Presents A/P/C menu.
5. **Step 4: Success Metrics Definition** (`steps/step-04-metrics.md`) — Define user success metrics, business objectives, and KPIs. Connect metrics to strategy, avoid vanity metrics. Presents A/P/C menu.
6. **Step 5: MVP Scope Definition** (`steps/step-05-scope.md`) — Define MVP core features, out-of-scope boundaries, MVP success criteria, and future vision. Balance ambition with realism. Presents A/P/C menu.
7. **Step 6: Completion** (`steps/step-06-complete.md`) — Announce completion, perform document quality check (completeness + consistency validation), suggest next steps (PRD, UX Design, research), congratulate user.

## Commonly Missed Steps

- ⚠️ **Step 1 — Input Document Discovery**: Agents skip discovering brainstorming reports, research documents, project context files. These provide critical context for the entire workflow. The step requires confirming discoveries with the user before proceeding.
- ⚠️ **Step 4 — Success Metrics**: Agents tend to accept vague metrics ("users are happy") instead of pushing for specific, measurable outcomes ("users complete [key action] within [timeframe]"). The step explicitly requires guiding from vague to specific.
- ⚠️ **Step 5 — Out of Scope Boundaries**: Agents skip explicitly defining what's NOT in the MVP, which leads to scope creep in later planning phases.
- ⚠️ **Step 6 — Document Quality Check**: Agents skip the completeness and consistency validation, jumping straight to congratulations without verifying all sections align with the core problem statement.
- ⚠️ **A/P/C Menu at Steps 2-5**: Agents sometimes auto-proceed without presenting the Advanced Elicitation / Party Mode / Continue menu, denying the user the option to dive deeper.

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (6 sequential steps; if Step 1b continuation is triggered, add it as a task dynamically). Each task should include the step number and name (e.g., "Step 1: Initialization — Detect continuation, discover inputs, create output document"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- NEVER generate content without user input — you are a FACILITATOR
- ALWAYS read each step file completely before taking action
- ALWAYS follow step-file architecture: load one step at a time, never look ahead
- ALWAYS update frontmatter `stepsCompleted` before loading next step
- ALWAYS present A/P/C menu after content generation in steps 2-5 — NEVER skip it
- ALWAYS halt at menus and wait for user input before proceeding
- NEVER load multiple step files simultaneously
- NEVER create mental todo lists from future steps
- This is a PARTNERSHIP — collaborative dialogue, not command-response

## What's Next

After creating a product brief, the typical next steps are:
- **Create PRD (CP)** — full product requirements document
- Optional: **Research (MR/DR/TR)** — if more information is needed
- Recommend starting a **new chat session** for the PRD workflow
