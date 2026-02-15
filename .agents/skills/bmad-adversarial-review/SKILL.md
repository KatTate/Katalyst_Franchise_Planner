---
name: bmad-adversarial-review
description: >
  BMAD Method: Adversarial review of any document or artifact — cynical,
  skeptical analysis that finds problems. Use when user says "adversarial
  review", "AR", "critical review", "tear it apart", or wants a harsh
  quality review of any content. Anytime workflow.
---

# BMAD Adversarial Review Task

This skill runs the BMAD Adversarial Review task. It provides a cynical,
skeptical review of any document, spec, diff, or artifact, finding at
least ten issues.

## Activation

When this skill is triggered, load and execute the review task:

Read fully and follow: `_bmad/core/tasks/review-adversarial-general.xml`

The task accepts two inputs:
- **content** — the diff, spec, story, doc, or artifact to review
- **also_consider** (optional) — additional areas to keep in mind during review

## Task Steps (3 Steps)

1. **Step 1: Receive Content** — Load content from input or context, identify content type (diff, branch, uncommitted changes, document, etc.). If content is empty, ask for clarification and abort.
2. **Step 2: Adversarial Analysis** *(critical)* — Review with extreme skepticism assuming problems exist. Find at least ten issues to fix or improve.
3. **Step 3: Present Findings** — Output findings as a prioritized Markdown list (descriptions only).

## Commonly Missed Items

- ⚠️ **Content Type Identification:** Agents jump straight to analysis without identifying what type of content they're reviewing — MUST classify first (diff, spec, doc, etc.) as this shapes the review lens
- ⚠️ **Minimum Ten Issues:** Agents stop at 5-7 issues when they feel "done" — the task MANDATES at least ten findings. If fewer are found, re-analyze with deeper skepticism
- ⚠️ **Missing vs Wrong:** Agents focus only on what's wrong in the content — MUST also look for what's MISSING (gaps, omissions, unstated assumptions)
- ⚠️ **Zero Findings Halt:** If zero findings are produced, this is suspicious — MUST re-analyze or ask for guidance, never report "looks good"
- ⚠️ **Professional Tone:** Agents may adopt an overly harsh or casual tone — MUST be precise and professional with no profanity or personal attacks

## Critical Rules

- ALWAYS assume problems exist — look for what's missing, not just what's wrong
- ALWAYS find at least ten issues — fewer is a red flag to dig deeper
- HALT if zero findings — re-analyze or ask for guidance
- HALT if content is empty or unreadable — ask for clarification
- Use a precise, professional tone — no profanity or personal attacks
- Be skeptical of EVERYTHING — you are a cynical, jaded reviewer
- Execute ALL steps in exact order — do not skip or reorder

## What's Next

After adversarial review, the typical next steps depend on what was reviewed:
- If reviewing a PRD: **Edit PRD (EP)** — fix the identified issues
- If reviewing architecture: **Create Architecture (CA)** — revise decisions
- If reviewing code: **Dev Story (DS)** — fix the code issues found
- Any artifact: address findings, then re-review if needed
