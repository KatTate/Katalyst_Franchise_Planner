---
name: bmad-core
description: >
  BMAD Method orchestrator and help system. Activates when user says "start BMad",
  "what's next?", "help", "BH", "BMad master", "what should I do next?",
  "I'm stuck", or asks for orientation on which BMAD workflow to use next.
  Routes users to the correct BMAD workflow based on project state.
---

# BMAD Core — Orchestrator & Help

This skill handles two core functions: initial orientation ("start BMad") and
ongoing guidance ("what's next?" / "help").

## Start BMad / Orientation

When the user wants to get started or meet the BMad Master:

Read fully and follow: `_bmad/core/agents/bmad-master.md`

This loads the BMad Master persona who greets the user, explains the system,
and presents the main menu of available workflows and tasks.

## What's Next / Help

When the user asks "what's next?", "help", "BH", or "what should I do next?":

Read fully and follow: `_bmad/core/tasks/help.md`

This analyzes the current project state by:
- Loading the help catalog from `_bmad/_config/bmad-help.csv`
- Scanning for existing artifacts in `_bmad-output/`
- Determining which workflows have been completed
- Recommending the next workflow based on phase/sequence ordering

## Workflow Quick Reference

When the user mentions a specific workflow by name or code, guide them to say
the trigger phrase. All BMAD workflows have their own dedicated skills:

| Code | Say | Workflow |
|------|-----|----------|
| BP | "brainstorm" | Brainstorming session |
| MR | "market research" | Market research |
| DR | "domain research" | Domain research |
| TR | "technical research" | Technical research |
| CB | "create brief" | Product brief |
| CP | "create PRD" | Product requirements |
| VP | "validate PRD" | PRD validation |
| EP | "edit PRD" | PRD editing |
| CU | "create UX" | UX design |
| CA | "create architecture" | Architecture decisions |
| CE | "create epics" | Epics and stories |
| IR | "check readiness" | Implementation readiness |
| SP | "sprint planning" | Sprint planning |
| SS | "sprint status" | Sprint status |
| CS | "create story" | Story creation |
| DS | "dev story" | Story implementation |
| CR | "code review" | Code review |
| QA | "QA test" | Test automation |
| ER | "retrospective" | Epic retrospective |
| CC | "correct course" | Course correction |
| QS | "quick spec" | Quick tech spec |
| QD | "quick dev" | Quick implementation |
| PM | "party mode" | Multi-agent discussion |
| AR | "adversarial review" | Critical document review |
| GPC | "generate project context" | Project context scan |
| DP | "document project" | Project documentation |

## Critical Rules

- ALWAYS check the routing table before responding to any message
- When a route matches, load the referenced file — do not answer in your own words
- If unsure whether a route matches, ask: "Would you like me to run the [workflow] for that?"
- Recommend starting a new chat for context-heavy workflows (PRD, architecture, epics)
