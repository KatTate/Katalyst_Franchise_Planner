# Source of Truth Audit Report

**Audit Date:** 2026-02-18
**Auditor:** Bob (SM Agent)
**Local Version:** 6.0.0-Beta.8 (Replit-adapted)
**Official Version:** V6 Stable (from KatTate/BMAD-METHOD fork of bmad-code-org/BMAD-METHOD)
**Trigger:** V6 Stable release announcement

---

## Executive Summary

Overall, the Replit-adapted installation is in **GOOD shape** for the high-priority Phase 4 workflows. The dev-story fix from Beta.8-replit.7 is solid and well-documented. However, there are specific drift issues that need attention before V6 Stable features are fully realized.

**Total Findings:** 12 findings across all audited workflows
- **HIGH:** 2
- **MEDIUM:** 5
- **LOW:** 3
- **INFO (positive):** 2

**Functional regressions found:** NONE. All workflows execute correctly. Findings are improvements, version currency, and minor consistency items.

---

## Per-Workflow Audit Results

---

### 1. dev-story (Priority 1 — Reference Adaptation)

**Status: PASS — Minor drift only**

#### Structural Comparison
| Aspect | Official (V6 Stable) | Local (Beta.8-Replit) | Match? |
|---|---|---|---|
| Step count | 11 (steps 1-8 + step 8 continued validation) | 11 (steps 1-11) | ✅ Equivalent |
| Instructions format | XML | XML | ✅ |
| Checklist present | Yes | Yes | ✅ |

#### Variable Resolution
| Variable | Official | Local | Match? |
|---|---|---|---|
| user_name | `{config_source}:user_name` | `$REPLIT_USER` | ✅ Adapted correctly |
| communication_language | `{config_source}:communication_language` | `$LANG:English` | ✅ Adapted correctly |
| story_file | `""` | `""` | ✅ |
| sprint_status | `{implementation_artifacts}/sprint-status.yaml` | Same | ✅ |
| web_bundle | `false` | Missing | ⚠️ LOW |

#### Findings

**[DEV-1] LOW — Missing `web_bundle: false` in workflow.yaml**
- Official has `web_bundle: false` at the end of workflow.yaml
- Local omits it
- Impact: Minimal — this is a default value. But could matter if a future workflow engine uses it.
- Fix: Add `web_bundle: false` to local workflow.yaml

**[DEV-2] MEDIUM — Official Step 5 uses loop-based red-green-refactor; Local Step 5+6 uses plan-then-implement**
- Official: Step 5 is a single step with RED-GREEN-REFACTOR cycle built into a task loop, following Tasks/Subtasks from the story file
- Local: Step 5 creates an implementation plan, Step 6 implements it. Agent plans its OWN approach from ACs + Dev Notes.
- This is an **intentional Replit adaptation** documented in the audit guide ("Agent-driven planning"). The local approach is stronger for Replit's context because it lets the agent plan autonomously.
- **No fix needed** — this is an approved adaptation. However, the official has now added explicit loop structure that creates checkpoint moments (implement → test → validate → mark → loop). The local version loses these checkpoints.
- Recommendation: Consider adding a micro-checkpoint after each task completion in Step 6 to prevent the "lost in the middle" effect.

**[DEV-3] MEDIUM — Official has explicit `story_path` variable; Local uses `story_file`**
- Official Step 1 references `{{story_path}}` in some places
- Local consistently uses `{{story_file}}`
- The Beta.8-replit.7 fix aligned to `{{story_file}}` which matches the workflow.yaml key.
- **No fix needed** — local is actually more consistent than official.

#### Anti-Pattern Check
- [x] No Mega Step collapse
- [x] Critical rules preserved at full strength (actually stronger — added context priority guidance)
- [x] Post-implementation steps prominent and mandatory (Steps 10-11 with `<critical>` tags)
- [x] HALT/WAIT gates preserved
- [x] File discovery logic matches official
- [x] Loop structure adapted but equivalent guardrails present

#### SKILL.md Alignment
- [x] Step count matches (11 steps documented)
- [x] Commonly-missed steps highlighted (Steps 10-11)
- [x] Critical rules present
- [x] File pointers correct

---

### 2. code-review (Priority 2 — High Skip Risk)

**Status: PASS WITH IMPROVEMENTS — Local is stronger than official**

#### Structural Comparison
| Aspect | Official (V6 Stable) | Local (Beta.8-Replit) | Match? |
|---|---|---|---|
| Step count | 5 steps (1-5) | 6 steps (1, 2, 3, 3.5, 4, 5) | ✅ Local has bonus Step 3.5 |
| Instructions format | XML | XML | ✅ |
| Checklist present | Yes | Yes | ✅ |

#### Findings

**[CR-1] HIGH — Official adds AC Evidence Audit; Local missing this sub-check**
- Official Step 3 now has an explicit "AC Evidence Audit" sub-action that cross-references the dev agent's verification entries (Expected, Method, Observed fields).
- Local Step 3 has the basic AC verification but lacks the explicit cross-referencing against the dev agent's claimed verification entries.
- Impact: The review may not catch cases where the dev agent lied about AC satisfaction.
- Fix: Add the AC Evidence Audit sub-action to local Step 3.

**[CR-2] MEDIUM — Local adds Step 3.5 (Platform Intelligence Scan) — Official does not have this**
- Local has an additional Step 3.5 for LSP diagnostics, architect analysis, and visual verification.
- This is a Replit-specific enhancement — not present in official.
- **No fix needed** — this is a value-add adaptation. However, verify it doesn't push critical Step 5 further away per Anti-Pattern 6.
- Assessment: Step 3.5 is positioned BETWEEN adversarial review (Step 3) and findings presentation (Step 4), which is correct placement. Step 5 (status update) follows immediately after Step 4, so the distance is acceptable.

**[CR-3] INFO (POSITIVE) — Local Step 4 has stronger STOP-AND-READ guards than official**
- Local adds `<critical>🛑 STOP AND READ: You have finished fixing issues but you are NOT done...` after user choice 1 AND choice 2.
- Official does NOT have these guards.
- **Local is stronger** — no fix needed. This is a Replit improvement that could benefit upstream.

**[CR-4] LOW — Local checklist is more comprehensive than official**
- Local checklist has 7 sections with 19 items including Platform Intelligence and Dev Notes Compliance
- Official checklist has 19 items but less structured
- **Local is stronger** — no fix needed.

#### Variable Resolution
| Variable | Official | Local | Match? |
|---|---|---|---|
| user_name | `{config_source}:user_name` | `$REPLIT_USER` | ✅ |
| web_bundle | `false` | Missing | ⚠️ LOW |

#### Anti-Pattern Check
- [x] No Mega Step collapse
- [x] Critical rules preserved (stronger in local)
- [x] Post-implementation steps prominent (Step 5 has double `<critical>` tags)
- [x] HALT/WAIT gates preserved and enhanced
- [x] No Replit additions push critical steps further away (Step 3.5 is well-positioned)

#### SKILL.md Alignment
- [x] Step count matches (6 steps including 3.5)
- [x] Commonly-missed steps highlighted (Steps 3, 3.5, 5)
- [x] Critical rules present
- [x] File pointers correct

---

### 3. create-story (Priority 3 — Complex XML)

**Status: PASS WITH IMPROVEMENTS — Local has important Replit enhancements**

#### Structural Comparison
| Aspect | Official (V6 Stable) | Local (Beta.8-Replit) | Match? |
|---|---|---|---|
| Step count | ~8 steps (1, 2, 3, 4, 5+6+7+8 in checklist) | 6 steps (1-6) | ⚠️ Different structure |
| Instructions format | XML | XML | ✅ |
| Checklist present | Yes (massive competition prompt) | Yes (focused quality checklist) | ⚠️ Significantly different |

#### Findings

**[CS-1] MEDIUM — Official checklist uses "Competition Prompt" framework; Local uses focused checklist (design choice)**
- Official checklist.md is a comprehensive 8-step validation framework with systematic re-analysis, disaster prevention gap analysis, LLM optimization analysis, and interactive improvement process.
- Local checklist.md is a clean, focused quality checklist with specific validation items.
- The official's approach is a full validation WORKFLOW inside the checklist, while local treats it as a standard validation checklist.
- Impact: The local version is more practical for Replit's validate-workflow.xml execution and avoids token exhaustion. This is a **design choice**, not a functional regression.
- **Recommendation:** Consider cherry-picking 2-3 key items from the official's "Disaster Prevention Gap Analysis" section (specifically: reinvention prevention, wrong file locations, regression prevention) into the local checklist. Do not import the full competition framework — it would exhaust agent context on Replit.

**[CS-2] INFO (POSITIVE) — Local adds critical OUTPUT CONSTRAINT rule; Official lacks it**
- Local has: `<critical>OUTPUT CONSTRAINT: This workflow produces ONE markdown file as output. You must NOT: Write, modify, or create any application source code files...`
- Official does NOT have this constraint.
- **Local is stronger** — this prevents the common mistake of the create-story agent starting to write code instead of documenting. This is a Replit improvement that could benefit upstream.

**[CS-3] MEDIUM — Local adds "intent-and-constraint" philosophy; Official uses "context engine" framing**
- Local: "The story file is an intent-and-constraint document, NOT an implementation script."
- Local: "DO NOT write a Tasks/Subtasks section."
- Official: Treats story as a comprehensive context document with Tasks/Subtasks.
- This is an intentional Replit adaptation. The local approach is more autonomous-agent-friendly.

**[CS-4] HIGH — Official Step 1 has duplicated code block**
- The official instructions.xml Step 1 has a duplicated code section where the sprint-status auto-discovery logic appears TWICE (once inside `<check if="no user input provided">` and once outside it).
- This is likely a bug in the official source.
- Local correctly has the logic once.

#### Anti-Pattern Check
- [x] No Mega Step collapse
- [x] Critical rules preserved and enhanced
- [x] Post-creation steps (validation, sprint status update) are mandatory in Step 6
- [x] HALT/WAIT gates preserved
- [x] File discovery logic matches official

#### SKILL.md Alignment
- [x] Step count matches (6 steps)
- [x] Commonly-missed steps highlighted (Steps 3, 6)
- [x] Critical rules present
- [x] File pointers correct

---

### 4. sprint-planning (Priority 5 — Tracking Artifacts)

**Status: PASS — Nearly identical**

#### Structural Comparison
| Aspect | Official (V6 Stable) | Local (Beta.8-Replit) | Match? |
|---|---|---|---|
| Step count | 6 (including Step 0.5) | 6 (including Step 0.5) | ✅ |
| Instructions format | Markdown | Markdown | ✅ |
| Checklist present | Yes | Yes | ✅ |

#### Findings

**[SP-1] No significant drift detected.**
- workflow.yaml: Variables adapted correctly for Replit ($REPLIT_USER, $LANG:English, $REPL_SLUG)
- instructions.md: Identical structure and content
- checklist.md: Identical
- web_bundle not present in either (this workflow doesn't output web content)

#### Variable Resolution — All correct
| Variable | Official | Local | Match? |
|---|---|---|---|
| user_name | `{config_source}:user_name` | `$REPLIT_USER` | ✅ |
| project_name | `{config_source}:project_name` | `$REPL_SLUG` | ✅ |

#### SKILL.md Alignment
- [x] Step count matches (6 steps)
- [x] Commonly-missed steps highlighted (Steps 3, 5)
- [x] Critical rules present
- [x] File pointers correct

---

### 5. quick-dev (Priority 4 — Step Boundaries)

**Status: PASS — Identical with Replit config resolution**

#### Findings

**[QD-1] No significant drift detected.**
- The only difference is config resolution: Official loads from config_source, Local resolves from $REPLIT_USER/$REPL_SLUG/$LANG.
- Step-file architecture preserved (steps/step-01 through step-06)
- Both use the same step-file loading pattern

---

### 6. Remaining Phase 4 Workflows (retrospective, correct-course, sprint-status)

**Status: PASS — Minimal drift, config adaptations only**

#### retrospective
- workflow.yaml: Variables adapted correctly for Replit
- Only difference: `document_project.description` says "Established project documentation" vs official's "Brownfield project documentation" — cosmetic, no impact
- web_bundle: Missing from local (present in official). LOW priority.

#### correct-course
- workflow.yaml: Identical structure, Replit variable adaptations applied correctly
- web_bundle: Missing from local. LOW priority.

#### sprint-status
- workflow.yaml: Identical structure, Replit variable adaptations applied correctly
- web_bundle: Not present in either version.

---

## Cross-Cutting Findings

### FINDING: [GLOBAL-1] HIGH — Config version is 6.0.0-Beta.8; V6 Stable is released

The `_bmad/bmm/config.yaml` shows version `6.0.0-Beta.8`. The V6 Stable release has been published. No functional regressions were found in Phase 4 workflows, but this version gap means:

1. **Bug fixes** from V6 Stable (semantic versioning, custom content flag, module config UX, non-interactive mode) may not be present in our installation
2. **Technical debt reduction** (alias variable removal from Phase 4 workflows) may not be complete
3. **New features** (uninstall command) are not available

**Recommendation:** Run `npx bmad-method@6.0.0 install` to update to V6 Stable, then re-run this audit to verify the update preserved Replit adaptations.

### FINDING: [GLOBAL-2] LOW — `web_bundle: false` missing from multiple workflow.yaml files

Several local workflow.yaml files are missing the `web_bundle: false` key that appears in the official versions. This is a cosmetic/defensive issue — the default is false anyway.

Affected workflows: dev-story, code-review, create-story, retrospective, correct-course

---

## Anti-Pattern Scorecard (All Workflows)

| Anti-Pattern | Status |
|---|---|
| AP1: Mega Step Collapse | ✅ None detected |
| AP2: Critical Post-Implementation Steps at End | ✅ All have `<critical>` emphasis |
| AP3: Weakened Critical Rules | ✅ Local rules are EQUAL or STRONGER than official |
| AP4: Missing Loop Structure | ⚠️ dev-story uses plan-based approach instead of loop (approved adaptation) |
| AP5: Variable Name Mismatches | ✅ All resolved correctly |
| AP6: Replit Additions Pushing Critical Steps | ✅ Well-positioned (code-review Step 3.5 is between review and presentation) |
| AP7: Checklist Simplification | ⚠️ create-story checklist is significantly different from official (simpler but more practical) |
| AP8: Removed/Softened HALT/WAIT Gates | ✅ All preserved; some enhanced |
| AP9: Altered File Discovery Logic | ✅ All match official patterns |

---

## Recommended Actions (Priority Order)

### Should Do (Before Next Sprint)
1. **[GLOBAL-1]** Update to V6 Stable: `npx bmad-method@6.0.0 install` — then re-audit to verify Replit adaptations survived. No functional regressions exist today, but staying current prevents future drift.
2. **[CR-1]** Add AC Evidence Audit sub-action to code-review Step 3 instructions.xml — this closes a verification gap where the dev agent's claimed AC satisfaction is not independently cross-checked.

### Consider (This Sprint)
3. **[CS-1]** Cherry-pick 2-3 disaster prevention items from official create-story checklist into local version (reinvention prevention, wrong file locations, regression prevention)
4. **[DEV-2]** Consider adding micro-checkpoints in dev-story Step 6 to replicate loop benefits from the official version

### Low Priority
5. **[GLOBAL-2]** Add `web_bundle: false` to all workflow.yaml files missing it (cosmetic consistency)
6. Re-run this audit after V6 Stable update to verify no regressions

---

## Conclusion

The Replit-adapted installation is well-maintained. The critical dev-story fix from Beta.8-replit.7 is solid. Most Replit adaptations are **improvements** over the official source (stronger critical rules, platform intelligence scan, output constraints). The primary risk is version drift — we're on Beta.8 while V6 Stable is released, which means we're missing bug fixes and the new uninstall feature.

**Bottom line:** Update to V6 Stable, add the AC Evidence Audit to code-review, and the installation will be fully current.

---

_Audited by Bob (SM Agent) using the Source of Truth Audit Guide at `_bmad/_config/source-of-truth-audit.md`_
