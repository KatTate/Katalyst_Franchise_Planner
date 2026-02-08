# Step 2: BMAD Entry Point Assessment

## MANDATORY EXECUTION RULES (READ FIRST):

- Use the scan findings from Step 1 — do NOT re-scan
- PRESENT your recommendations clearly and let the user decide
- This step determines WHERE in the BMAD workflow the user should start
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS:

- Analyze scan findings to determine project maturity
- Map existing work to BMAD phases
- Recommend the optimal starting point
- FORBIDDEN to load next step until user approves the recommended path

## YOUR TASK:

Based on the brownfield scan, determine which BMAD phases the project has effectively already completed and where the user should enter the BMAD workflow.

## ASSESSMENT CRITERIA:

### Phase Mapping

Map existing project state to BMAD phases:

**Phase 1 — Analysis (Brainstorm, Research, Brief):**
- Does the project have a clear purpose and scope? → Analysis may be done
- Is the problem space well-understood? → Research may be done
- Are there existing requirements or specs? → Brief may be done

**Phase 2 — Planning (PRD, UX Design):**
- Are there formal requirements documented? → PRD may be done
- Is there a designed user interface? → UX may be done
- Are user flows defined? → Planning may be done

**Phase 3 — Solutioning (Architecture, Epics/Stories):**
- Is the architecture clearly established in the code? → Architecture may be done
- Is the work broken into clear features/modules? → Epics may be done
- Are there obvious next development tasks? → Stories may be extractable

**Phase 4 — Implementation (Sprint, Dev, Review):**
- Is active development the primary need? → Enter implementation directly
- Does the code need refactoring or new features? → Sprint planning may be needed
- Is quality assurance the gap? → QA workflow may be the entry point

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

- Phase mapping is honest and evidence-based
- Recommended path matches the project's actual needs
- User has clear options with explained trade-offs
- Alternative paths are mentioned for awareness
- User selects a path or provides custom direction

## FAILURE MODES:

- Recommending full BMAD flow when quick additions would suffice
- Skipping Generate Project Context when it's clearly needed
- Not explaining why a particular entry point is recommended
- Forcing a path without giving the user choice

## NEXT STEP:

After user selects a path, load `./step-03-integrate.md` to set up the chosen BMAD workflow path.

Remember: Do NOT proceed to step-03 until the user has explicitly chosen a path!
