---
name: bmad-project-context
description: >
  BMAD Method: Generate a concise project-context.md with critical rules and
  patterns for AI agent consistency. Use when user says "generate project context",
  "GPC", "project context", "context file", or needs a reference file that
  ensures all AI agents follow the same implementation patterns.
  Phase 3 Solutioning workflow.
---

# BMAD Generate Project Context Workflow

This skill activates the BMAD Generate Project Context workflow. It creates
a concise, LLM-optimized project-context.md file capturing critical rules,
patterns, and guidelines that all AI agents must follow.

## Activation

When this skill is triggered, load and follow the workflow directly:

Read fully and follow: `_bmad/bmm/workflows/generate-project-context/workflow.md`

The workflow uses micro-file architecture with configuration loading from `_bmad/bmm/config.yaml`.
Template from the workflow directory. Output: lean project-context.md optimized for context efficiency.

## Workflow Steps (3 Total)

1. **Step 1: Context Discovery & Initialization** — Check for existing context, discover tech stack from project files, identify code patterns, extract critical implementation rules, initialize document
2. **Step 2: Context Rules Generation** — Collaboratively generate rules across 7 categories (tech stack, language rules, framework rules, testing, code quality, workflow, anti-patterns) with A/P/C menus per category
3. **Step 3: Context Completion & Finalization** — Review complete file, optimize for LLM context efficiency, finalize structure, add usage guidelines

## Commonly Missed Steps

- ⚠️ **Step 1 Existing Context Check:** Agents skip checking for existing `project-context.md` — MUST check FIRST before creating new
- ⚠️ **Step 2 Category Menus:** Agents auto-proceed past A/P/C menus — MUST present [A]/[P]/[C] after EACH category and HALT for user selection
- ⚠️ **Step 2 All Categories:** Agents skip later categories (workflow rules, anti-patterns) — MUST complete ALL 7 rule categories
- ⚠️ **Step 3 Optimization:** Agents skip LLM context optimization — MUST remove redundant/obvious information and keep content lean
- ⚠️ **User Collaboration:** Agents generate content without user input — MUST treat as collaborative discovery between technical peers

## Replit Task List Integration

**MANDATORY on activation:** Before beginning Step 1, create a Replit task list using the `write_task_list` tool with one task per workflow step listed above (3 steps). Each task should include the step number and name (e.g., "Step 1: Context Discovery & Initialization — Discover tech stack, identify patterns"). Mark the first task as `in_progress`. As you complete each step, immediately mark its task as `completed` (architect_reviewed: "not_applicable", reason: "BMAD workflow step — planning/facilitation, not code") and mark the next task as `in_progress`. This gives the user visible progress tracking throughout the workflow.

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- NEVER generate content without user input — you are a FACILITATOR
- ALWAYS read each step file completely before taking action
- ALWAYS present A/P/C menu after each rule category in Step 2
- ALWAYS complete ALL rule categories before proceeding to Step 3
- Focus on UNOBVIOUS details — things LLMs commonly get wrong
- Keep the output LEAN — every word must earn its place in the context window
- NEVER include time estimates — AI development speed has fundamentally changed

## What's Next

After generating project context, the file is used automatically by:
- **Dev Story (DS)** — loads project context before implementation
- **Quick Dev (QD)** — loads project context before implementation
