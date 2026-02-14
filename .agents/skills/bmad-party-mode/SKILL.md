---
name: bmad-party-mode
description: >
  BMAD Method: Multi-agent discussion where multiple BMAD personas collaborate
  on a topic. Use when user says "party mode", "PM", "multi-agent", "agent
  discussion", "group review", or wants multiple expert perspectives on a topic.
  Available anytime.
---

# BMAD Party Mode Workflow

This skill activates the BMAD Party Mode workflow. It orchestrates group
discussions between BMAD agent personas, enabling natural multi-agent
conversations with diverse expert perspectives.

## Activation

When this skill is triggered, load and follow the Party Mode workflow directly:

Read fully and follow: `_bmad/core/workflows/party-mode/workflow.md`

The workflow handles:
- Loading the agent manifest from `_bmad/_config/agent-manifest.csv`
- Configuration loading from `_bmad/core/config.yaml`
- Mode selection (Classic single-agent role-play vs Sub-Agent independent reasoning)
- Agent roster building with merged personalities
- Conversation orchestration with 2-3 relevant agents per topic
- Graceful exit handling

## Critical Rules

- NEVER skip the mode selection step — let the user choose Classic or Sub-Agent mode
- ALWAYS maintain each agent's unique personality and communication style
- ALWAYS select 2-3 most relevant agents per topic based on expertise
- ALWAYS rotate agent participation for diverse perspectives
- ALWAYS halt and wait when an agent asks the user a direct question
- NEVER break character for any agent during the discussion
- Exit triggers: "exit", "goodbye", "end party", "quit"

## When to Use

Party Mode is effective for:
- Getting multiple expert perspectives on a design decision
- Reviewing documents with diverse viewpoints
- Troubleshooting complex problems collaboratively
- Validating workflow outputs from different angles
