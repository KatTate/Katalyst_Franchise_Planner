# BMad Source of Truth Audit Guide

## Purpose

This document directs an agent to compare the official BMAD GitHub source against the Replit-adapted version installed locally. The goal is to detect places where Replit adaptations have watered down, collapsed, or broken the official workflow structure — leading to agents skipping steps, losing track of later steps, or missing critical updates.

## When to Use This Guide

- After a BMAD update from GitHub that may have introduced new steps or structural changes
- When agents are consistently skipping steps in any workflow
- When a workflow feels "off" compared to the official BMAD behavior
- Periodically (every few sprints) as a maintenance audit
- Before a major project milestone where workflow reliability matters

---

## Source Locations

### Official BMAD GitHub (Source of Truth)

**Repository:** `https://github.com/KatTate/BMAD-METHOD` (fork of `bmad-code-org/BMAD-METHOD`)

**Raw file access pattern:**
```
https://raw.githubusercontent.com/KatTate/BMAD-METHOD/main/src/{path}
```

**Source workflow root:** `src/bmm/workflows/`

**Source core tasks:** `src/core/tasks/`

**Source agents:** `src/bmm/agents/`

### Local Replit Installation

**Installed workflow root:** `_bmad/bmm/workflows/`

**Installed core tasks:** `_bmad/core/tasks/`

**Installed agents:** `_bmad/bmm/agents/`

**Replit Skills:** `.agents/skills/bmad-*/SKILL.md`

### Path Mapping (GitHub Source → Local)

| GitHub Source Path | Local Installed Path |
|---|---|
| `src/bmm/workflows/{phase}/{name}/` | `_bmad/bmm/workflows/{phase}/{name}/` |
| `src/core/tasks/` | `_bmad/core/tasks/` |
| `src/bmm/agents/` | `_bmad/bmm/agents/` |
| (no equivalent) | `.agents/skills/bmad-*/SKILL.md` |

---

## Workflow Inventory

### Phase 4 — Implementation (Highest Risk for Step-Skipping)

These workflows drive active code generation. They are the most likely to suffer from Replit adaptations that collapse steps, because the agent spends significant context on implementation work and can lose track of later housekeeping steps.

| Workflow | Local Path | Key Files |
|---|---|---|
| dev-story | `4-implementation/dev-story/` | `workflow.yaml`, `instructions.xml`, `checklist.md` |
| code-review | `4-implementation/code-review/` | `workflow.yaml`, `instructions.xml`, `checklist.md` |
| create-story | `4-implementation/create-story/` | `workflow.yaml`, `instructions.xml`, `checklist.md`, `template.md` |
| sprint-planning | `4-implementation/sprint-planning/` | `workflow.yaml`, `instructions.md`, `checklist.md` |
| retrospective | `4-implementation/retrospective/` | `workflow.yaml`, `instructions.md` |
| correct-course | `4-implementation/correct-course/` | `workflow.yaml`, `instructions.md`, `checklist.md` |
| sprint-status | `4-implementation/sprint-status/` | `workflow.yaml`, `instructions.md` |

### Phase 0 — Assessment

| Workflow | Local Path | Key Files |
|---|---|---|
| assess-project | `0-assess/` | Check for workflow/step files |

### Phase 1 — Analysis

| Workflow | Local Path | Key Files |
|---|---|---|
| create-product-brief | `1-analysis/create-product-brief/` | `workflow.md`, `steps/step-01` through `step-06` |
| market-research | `1-analysis/research/` | `workflow-market-research.md`, `market-steps/` |
| domain-research | `1-analysis/research/` | `workflow-domain-research.md`, `domain-steps/` |
| technical-research | `1-analysis/research/` | `workflow-technical-research.md`, `technical-steps/` |

### Phase 2 — Planning

| Workflow | Local Path | Key Files |
|---|---|---|
| create-prd | `2-plan-workflows/create-prd/` | `workflow.yaml`, step files in `steps-c/` |
| create-ux-design | `2-plan-workflows/create-ux-design/` | Check for workflow/step files |
| edit-prd | `2-plan-workflows/edit-prd/` | Check for workflow/step files |
| validate-prd | `2-plan-workflows/validate-prd/` | Check for workflow/step files |

### Phase 3 — Solutioning

| Workflow | Local Path | Key Files |
|---|---|---|
| create-architecture | `3-solutioning/create-architecture/` | Check for workflow/step files |
| create-epics-and-stories | `3-solutioning/create-epics-and-stories/` | `workflow.md`, step files |
| check-implementation-readiness | `3-solutioning/check-implementation-readiness/` | Check for workflow/step files |

### Core Workflows (Workflow Engine Level)

These live in `_bmad/core/workflows/` and are invoked by other workflows:

| Workflow | Local Path | Key Files |
|---|---|---|
| brainstorming | `_bmad/core/workflows/brainstorming/` | Check for workflow files |
| advanced-elicitation | `_bmad/core/workflows/advanced-elicitation/` | Check for workflow files |
| party-mode | `_bmad/core/workflows/party-mode/` | `workflow.md` |

**Note:** Verify this inventory against the actual contents of `_bmad/bmm/workflows/` and `_bmad/core/workflows/` at the start of each audit cycle, since BMAD updates may add or remove workflows.

### Cross-Cutting Workflows

| Workflow | Local Path | Key Files |
|---|---|---|
| quick-dev | `bmad-quick-flow/quick-dev/` | `workflow.md`, `steps/step-01` through `step-06` |
| quick-spec | `bmad-quick-flow/quick-spec/` | `workflow.md`, `steps/step-01` through `step-04` |
| document-project | `document-project/` | `workflow.yaml`, `instructions.md`, `checklist.md` |
| generate-project-context | `generate-project-context/` | `workflow.md`, `steps/` |
| qa-automate | `qa/automate/` | `workflow.yaml`, `instructions.md`, `checklist.md` |

---

## Audit Process

### Step 1: Fetch Official Source

For each workflow being audited, fetch all key files from GitHub:

```
https://raw.githubusercontent.com/KatTate/BMAD-METHOD/main/src/bmm/workflows/{phase}/{name}/instructions.xml
https://raw.githubusercontent.com/KatTate/BMAD-METHOD/main/src/bmm/workflows/{phase}/{name}/workflow.yaml
https://raw.githubusercontent.com/KatTate/BMAD-METHOD/main/src/bmm/workflows/{phase}/{name}/checklist.md
```

For step-based workflows, also fetch each step file:
```
https://raw.githubusercontent.com/KatTate/BMAD-METHOD/main/src/bmm/workflows/{phase}/{name}/steps/step-{NN}-{name}.md
```

Also read the corresponding local files for side-by-side comparison.

### Step 2: Structural Comparison

Compare the **step count and step boundaries** between official and local:

1. **Count the steps** in each version. If the local version has fewer steps, investigate what was merged.
2. **Map each official step** to its local equivalent. Identify any that were:
   - Collapsed (multiple official steps merged into one local step)
   - Removed entirely
   - Reordered
3. **Check step sizes.** Any single step that contains implementation AND documentation/tracking work is a red flag.

### Step 3: Anti-Pattern Detection

Look for these specific anti-patterns that cause agents to skip steps:

#### Anti-Pattern 1: "Mega Step" Collapse
**What it looks like:** A single step that contains planning, implementation, testing, AND documentation updates.
**Why it breaks:** The agent gets deep into implementation, consuming significant context and attention. By the time the large step is complete, subsequent steps have fallen off the agent's radar.
**The fix:** Split back into bounded steps where each step has one clear goal.

#### Anti-Pattern 2: Critical Post-Implementation Steps at the End
**What it looks like:** Story doc updates, sprint status updates, and completion communication are in the last 1-2 steps with no extra emphasis.
**Why it breaks:** These are "housekeeping" steps that the agent deprioritizes after the more engaging implementation work.
**The fix:** Add `<critical>` tags that explicitly say these steps are MANDATORY, call them out in the SKILL.md as "commonly missed," and include them in the checklist as required items.

#### Anti-Pattern 3: Weakened Critical Rules
**What it looks like:** The official version has forceful, repeated rules like "Execute ALL steps in exact order; do NOT skip steps" and "NEVER mark a task complete unless ALL conditions are met — NO LYING OR CHEATING." The local version uses milder language or omits these rules.
**Why it breaks:** LLM agents respond to the strength and repetition of instructions. Weaker language gives them permission to optimize/skip.
**The fix:** Preserve the official critical rules verbatim, or make them even stronger with Replit-specific reinforcement.

#### Anti-Pattern 4: Missing Loop Structure
**What it looks like:** The official version has an explicit loop (implement → test → validate → mark complete → loop back for next task). The local version removes the loop and makes it "do everything, then verify."
**Why it breaks:** Loops create natural checkpoint moments where the agent re-orients. Without them, the agent treats everything after implementation as optional.
**The fix:** Restore the loop structure, or at minimum create strong "checkpoint" steps between implementation and documentation.

#### Anti-Pattern 5: Variable Name Mismatches
**What it looks like:** `instructions.xml` references `{{story_path}}` but `workflow.yaml` defines `story_file`. Or instructions reference variables that don't exist in the workflow config.
**Why it breaks:** The workflow engine treats unknown variables as needing user input, which interrupts the flow and can cause the agent to go off-script.
**The fix:** Grep all `{{variable}}` and `{variable}` references in instructions and verify each exists in `workflow.yaml` or is derived at runtime.

#### Anti-Pattern 6: Replit-Specific Additions That Push Critical Steps Further Away
**What it looks like:** Adding Replit-specific verification steps (LSP, git status, screenshots) between implementation and the critical update steps.
**Why it breaks:** More content between "I'm done coding" and "now update the tracking docs" means more opportunity for the agent to lose the thread.
**The fix:** Position Replit-specific steps carefully — after verification but before the critical update steps, and mark the update steps as MANDATORY with extra emphasis.

#### Anti-Pattern 7: Checklist Simplification
**What it looks like:** The official checklist has detailed sections (Context Validation, Implementation, Testing, Documentation, Final Status). The local version condenses these into fewer, less specific items.
**Why it breaks:** The checklist is the last line of defense. If it doesn't explicitly check for story doc updates and sprint status updates, the agent won't catch the omission.
**The fix:** Restore the comprehensive checklist structure. Add Replit-specific sections (Platform Verification) as additions, not replacements.

#### Anti-Pattern 8: Removed or Softened HALT/WAIT Gates
**What it looks like:** The official version has explicit `HALT` conditions (e.g., "HALT if no story to work on," "HALT: Additional dependencies need user approval") and `<ask>` tags that force user interaction at decision points. The local version removes or softens these into suggestions.
**Why it breaks:** HALT/WAIT points serve as structural anchors that force the agent to pause and re-orient. Without them, the agent steamrolls through decisions that should involve the user and loses track of where it is in the workflow.
**The fix:** Preserve all official HALT conditions verbatim. Preserve `<ask>` tags and WAIT points. Only add new ones — never remove them.

#### Anti-Pattern 9: Altered File Discovery Logic
**What it looks like:** The official version has specific logic for how to discover stories (read sprint-status.yaml top-to-bottom, find first "ready-for-dev" story, match key patterns). The local version simplifies this or changes the ordering.
**Why it breaks:** Discovery logic determines which story gets loaded and how the workflow orients itself. Changing it can cause the wrong story to be loaded, or the agent to skip the discovery step entirely and proceed without proper context.
**The fix:** Preserve the official discovery logic exactly. Replit adaptations should only affect what happens AFTER discovery (how the agent plans and implements), not how it finds and loads the story.

### Step 4: SKILL.md Alignment Check

For each workflow's corresponding SKILL.md (in `.agents/skills/bmad-{name}/SKILL.md`):

1. **Step count matches.** If the instructions have 11 steps, the SKILL.md should say "11 steps."
2. **Commonly-missed steps are highlighted.** The SKILL.md should call out which steps agents tend to skip.
3. **Critical rules are present.** The SKILL.md should reinforce (not replace) the critical rules from instructions.
4. **File pointers are correct.** The SKILL.md should point to the right workflow.yaml path.

### Step 5: Variable Consistency Check

Run this verification for each workflow:

1. List all `{{double-brace}}` variable references in the instructions file.
2. List all `{single-brace}` variable references in the instructions file.
3. Verify each exists in `workflow.yaml` as either:
   - A direct key (e.g., `story_file: ""`)
   - A config-resolved key (e.g., `user_skill_level: "{config_source}:user_skill_level"`)
   - A runtime-derived value (e.g., `story_key` extracted from filename)
   - A system variable (e.g., `{project-root}`, `{installed_path}`)

---

## Replit Adaptation Principles

When adapting official BMAD workflows for Replit, follow these principles:

### What TO Adapt

- **Platform task management:** Replit has native task management — use it instead of writing task lists into story files. The official `Tasks/Subtasks` checkbox approach can be replaced with platform task tracking.
- **Agent-driven planning:** On Replit, the agent can plan its own implementation approach from ACs and dev notes, rather than following pre-written task checklists.
- **Platform-specific verification:** Add LSP diagnostics, git status checks, and screenshot verification as Replit-specific steps.
- **Environment variables:** Replace `{config_source}:user_name` with `$REPLIT_USER` and similar platform-provided values.
- **Fresh chat guidance:** Add tips about starting workflows in fresh chats since Replit context management benefits from this.

### What NOT to Adapt

- **Step count and boundaries.** Never collapse multiple steps into one. Each step should have one clear goal.
- **Critical rules.** Preserve the strength and repetition of critical rules from the official version. Make them stronger if anything.
- **Post-implementation steps.** Never simplify or merge the documentation/tracking/completion steps. These are the most commonly skipped.
- **Loop structures.** If the official version has a loop (implement → test → validate → mark → repeat), preserve or explicitly replace it.
- **Checklist comprehensiveness.** Only add to the checklist — never remove sections. The checklist is the last line of defense against skipped steps.
- **Step ordering guarantees.** Never reorder steps in a way that puts critical tracking steps earlier in the workflow where they'd be incomplete, or later where they'd be forgotten.
- **HALT/WAIT points.** These are invariant. Never remove, soften, or relocate official HALT conditions or `<ask>` tags. They serve as structural anchors. Only add new ones.
- **File discovery logic.** The logic for finding and loading stories, sprint status, and other artifacts must match the official version exactly. Replit adaptations should only affect what happens AFTER discovery, not how discovery works.

---

## Audit Checklist (Per Workflow)

Use this checklist when auditing any individual workflow:

- [ ] Official source fetched and compared
- [ ] Step count matches or intentional differences documented
- [ ] No "Mega Step" anti-pattern (implementation + documentation in one step)
- [ ] Critical rules preserved at full strength
- [ ] Post-implementation steps (doc updates, status updates) are prominent and mandatory
- [ ] Variable references all resolve to defined keys
- [ ] SKILL.md matches the current step count and structure
- [ ] SKILL.md highlights commonly-missed steps
- [ ] Checklist covers all official sections plus Replit additions
- [ ] No Replit additions push critical steps further from implementation
- [ ] Loop structures preserved or explicitly replaced with equivalent guardrails
- [ ] HALT/WAIT gates preserved from official version — none removed or softened
- [ ] File discovery logic matches official version

---

## Known Issues and Historical Fixes

### dev-story (Fixed: Beta.8-replit.7)

**Problem:** Original Replit adaptation collapsed 10+ official steps into 6, creating a massive "Plan and implement" step 3. Agents consistently skipped steps 5 (update story/sprint) and 6 (communicate completion).

**Root cause:** Step 3 consumed so much agent attention during implementation that later steps fell off its radar. No loop structure to create checkpoint moments. Critical rules were weaker than the official version.

**Fix:** Restored to 11 bounded steps preserving Replit adaptations. Added `<critical>` emphasis on steps 10-11. SKILL.md now lists all 11 steps and flags steps 10-11 as commonly missed.

**Lesson:** Never merge implementation work with documentation/tracking work into a single step. The agent will always prioritize the implementation and forget the rest.

### Variable mismatch: story_path vs story_file (Fixed: Beta.8-replit.7)

**Problem:** `instructions.xml` referenced `{{story_path}}` but `workflow.yaml` defined `story_file`.

**Fix:** Aligned to `{{story_file}}` throughout.

**Lesson:** Always run a variable consistency check after modifying instructions.

---

## Priority Audit Order

When doing a full audit, prioritize workflows in this order (highest risk of step-skipping first):

1. **dev-story** — Already fixed. Use as reference for what a good adaptation looks like.
2. **code-review** — Similar structure to dev-story, high risk of skipping final status updates.
3. **create-story** — Complex XML instructions with template output. Risk of skipping validation.
4. **quick-dev** — Step-based implementation workflow. Verify step boundaries are preserved.
5. **sprint-planning** — Creates tracking artifacts. Important that all sections are generated.
6. **create-epics-and-stories** — Large document generation. Lower skip risk but worth checking.
7. **All remaining workflows** — Lower risk but should be periodically verified.
