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

The workflow uses micro-file architecture and handles:
- Configuration loading from `_bmad/bmm/config.yaml`
- Step-by-step context gathering
- Template from the workflow directory
- Focus on unobvious details that LLMs need reminding about
- Output: lean project-context.md optimized for context efficiency

## Critical Rules

- NEVER skip steps or optimize the sequence
- NEVER auto-proceed past WAIT points — stop and wait for user input
- ALWAYS read each step file completely before taking action
- Focus on UNOBVIOUS details — things LLMs commonly get wrong
- Keep the output LEAN — every word must earn its place in the context window

## What's Next

After generating project context, the file is used automatically by:
- **Dev Story (DS)** — loads project context before implementation
- **Quick Dev (QD)** — loads project context before implementation
