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

## Workflow Steps (3 Steps + Mode Variant)

1. **Step 1: Agent Loading & Initialization** — Load agent manifest CSV, extract complete agent data, build roster with merged personalities, present party activation, mode selection
2. **Step 2: Discussion Orchestration** — Two variants based on mode selection:
   - **Classic Mode** (`step-02-discussion-orchestration.md`): Single-agent role-play — orchestrator voices all personas in one response
   - **Sub-Agent Mode** (`step-02-subagent-orchestration.md`): Each persona runs as independent sub-agent with separate reasoning
3. **Step 3: Graceful Exit** — Agent farewells in character, session highlight summary, workflow completion

## Commonly Missed Steps

- ⚠️ **Step 1 Mode Selection:** Agents skip offering Classic vs Sub-Agent mode choice — MUST present mode selection and HALT
- ⚠️ **Step 2 Agent Selection:** Agents use the same agents every round — MUST rotate agent participation for diverse perspectives
- ⚠️ **Step 2 Direct Questions:** Agents continue responding after an agent asks the user a direct question — MUST HALT immediately and wait for user response
- ⚠️ **Step 2 Character Consistency:** Agents break character or use generic voices — MUST use each agent's documented communicationStyle from manifest
- ⚠️ **Step 3 Graceful Exit:** Agents exit abruptly — MUST generate in-character farewells and session summary

## Critical Rules

- NEVER skip the mode selection step — let the user choose Classic or Sub-Agent mode
- ALWAYS maintain each agent's unique personality and communication style
- ALWAYS select 2-3 most relevant agents per topic based on expertise
- ALWAYS rotate agent participation for diverse perspectives
- ALWAYS halt and wait when an agent asks the user a direct question
- ALWAYS end response round after a direct question to user — do not continue
- NEVER break character for any agent during the discussion
- NEVER exit without graceful agent farewells (Step 3)
- Exit triggers: "*exit", "goodbye", "end party", "quit"

## When to Use

Party Mode is effective for:
- Getting multiple expert perspectives on a design decision
- Reviewing documents with diverse viewpoints
- Troubleshooting complex problems collaboratively
- Validating workflow outputs from different angles
