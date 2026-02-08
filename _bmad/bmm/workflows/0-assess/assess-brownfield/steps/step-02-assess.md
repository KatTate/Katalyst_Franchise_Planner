# Step 2: BMAD Entry Point Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

- Use the scan findings from Step 1 AND the user's validated answers — do NOT re-scan
- The user's answers from Step 1 assumption validation OVERRIDE your scan conclusions
- PRESENT your recommendations clearly and let the user decide
- This step determines WHERE in the BMAD workflow the user should start
- DO NOT assume phases are "done" just because code exists — code can be incomplete, broken, or wrong
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS:

- Analyze scan findings AND user's validated answers to determine project maturity
- Map existing work to BMAD phases — using a skeptical lens
- Recommend the optimal starting point based on what the USER said, not just what the code looks like
- FORBIDDEN to load next step until user approves the recommended path

## YOUR TASK:

Based on the brownfield scan AND the user's validated answers from Step 1, determine which BMAD phases the project has effectively already completed and where the user should enter the BMAD workflow.

## ASSESSMENT CRITERIA:

### Phase Mapping

Map existing project state to BMAD phases. BE SKEPTICAL — having code is NOT the same as having completed a phase properly. Use these critical questions:

**Phase 1 — Analysis (Brainstorm, Research, Brief):**
- Does the project have a clear, DOCUMENTED purpose and scope? Or is it just code that grew organically?
- Did the user confirm in Step 1 that the project IS what it appears to be?
- Is there an actual brief or requirements document, or is the "brief" just inferred from the code?
- SKEPTICAL DEFAULT: Unless the user confirmed the direction is clear and intentional, Analysis is NOT done

**Phase 2 — Planning (PRD, UX Design):**
- Are there formal requirements documented ANYWHERE — not just implied by what was built?
- Did the user say the features are complete and working as intended?
- Is the UI deliberately designed, or did it just happen through iterative coding?
- SKEPTICAL DEFAULT: Unless there are actual planning documents OR the user confirmed the app does what they want, Planning is NOT done

**Phase 3 — Solutioning (Architecture, Epics/Stories):**
- Is the architecture a deliberate choice, or did it just emerge from whatever framework was picked?
- Is the code organized in a way that supports future development, or is it fragile?
- Can new features be added without major refactoring?
- SKEPTICAL DEFAULT: Having code in folders does NOT mean architecture is done. Unless the code is well-structured AND extensible, Solutioning is NOT done

**Phase 4 — Implementation (Sprint, Dev, Review):**
- Did the user say the existing features actually work correctly?
- Is there test coverage? Error handling? Edge case handling?
- SKEPTICAL DEFAULT: Code existing does NOT mean implementation is done. Only mark as done if features are verified working by the user

### Recommended Entry Points

Based on the assessment, recommend ONE of these paths:

**Path A: "Just needs implementation"**
- Project is well-structured with clear architecture
- The gap is building specific new features or fixing issues
- Recommendation: Generate Project Context (GPC) → Sprint Planning (SP) → Dev Story (DS)

**Path B: "Needs architecture documentation"**
- Project has code but no documented architecture decisions
- Recommendation: Generate Project Context (GPC) → Create Architecture (CA) → Create Epics (CE) → Sprint Planning (SP)

**Path C: "Needs full planning"**
- Project exists but direction is unclear or changing significantly
- Recommendation: Create Brief (CB) → Create PRD (CP) → Create Architecture (CA) → full BMAD flow

**Path D: "Quick additions"**
- Project is mature, user just needs to add specific features
- Recommendation: Quick Spec (QS) → Quick Dev (QD) — the fast-track path

**Path E: "Course correction"**
- Project has significant issues that need addressing before new work
- Recommendation: Correct Course (CC) → reassess after changes

### Present Assessment

"Based on my scan of {project_name}, here's my assessment:

**BMAD Phase Mapping:**
| Phase | Status | Evidence |
|---|---|---|
| Analysis | {{status}} | {{evidence}} |
| Planning | {{status}} | {{evidence}} |
| Solutioning | {{status}} | {{evidence}} |
| Implementation | {{status}} | {{evidence}} |

**Recommended Path: {{path_letter}} — "{{path_name}}"**

{{path_explanation}}

**Recommended First Steps:**
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

{{alternative_path_note}}

Which path would you like to take? Or would you like to discuss a different approach?

[A/B/C/D/E] Select a path
[X] Custom — tell me what you'd like to do"

## SUCCESS METRICS:

- Phase mapping is honest, skeptical, and evidence-based — incorporating the user's validated answers
- Phases are NOT marked as "done" unless user confirmed the work is complete and correct
- Recommended path matches the project's actual needs as stated by the user, not just inferred from code
- User has clear options with explained trade-offs
- Alternative paths are mentioned for awareness
- User selects a path or provides custom direction

## FAILURE MODES:

- Marking phases as complete just because code exists (THE MOST COMMON FAILURE)
- Ignoring the user's answers from the Step 1 assumption validation
- Assuming the project is further along than it actually is
- Recommending "just needs implementation" when the user hasn't confirmed the app works correctly
- Recommending full BMAD flow when quick additions would suffice
- Skipping Generate Project Context when it's clearly needed
- Not explaining why a particular entry point is recommended
- Forcing a path without giving the user choice

## NEXT STEP:

After user selects a path, load `./step-03-integrate.md` to set up the chosen BMAD workflow path.

Remember: Do NOT proceed to step-03 until the user has explicitly chosen a path!
