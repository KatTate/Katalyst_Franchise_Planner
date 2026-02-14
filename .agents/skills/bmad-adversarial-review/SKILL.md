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

The task handles:
- Content identification (diff, spec, story, doc, or any artifact)
- Adversarial analysis with extreme skepticism
- Finding at least ten issues to fix or improve
- Presenting findings as a prioritized Markdown list

## Critical Rules

- ALWAYS assume problems exist — look for what's missing, not just what's wrong
- ALWAYS find at least ten issues
- Use a precise, professional tone — no profanity or personal attacks
- Be skeptical of EVERYTHING
- If content to review is empty, ask for clarification and abort

## What's Next

After adversarial review, the typical next steps depend on what was reviewed:
- If reviewing a PRD: **Edit PRD (EP)** — fix the identified issues
- If reviewing architecture: **Create Architecture (CA)** — revise decisions
- If reviewing code: **Dev Story (DS)** — fix the code issues found
- Any artifact: address findings, then re-review if needed
