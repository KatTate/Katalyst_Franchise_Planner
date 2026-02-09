# BMad Method for Replit

**Breakthrough Method of Agile AI Driven Development** — An AI-driven agile development framework with specialized agent personas and guided workflows that take your project from idea through implementation.

Based on the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) (v6.0.0-Beta.7), adapted for Replit Agent.

**100% free and open source.** No paywalls. No gated content.

---

## Why BMad?

Traditional AI tools do the thinking for you, producing average results. BMad agents act as expert collaborators who guide you through a structured process — bringing out your best thinking in partnership with the AI.

- **Intelligent Help**: Say "what's next?" at any time and BMad tells you exactly where you are and what to do
- **Scale-Adaptive**: Adjusts planning depth based on project complexity — a simple utility gets a different process than an enterprise platform
- **Structured Workflows**: Grounded in agile best practices across analysis, planning, architecture, and implementation
- **Specialized Agents**: 10 domain expert personas (PM, Architect, Developer, UX Designer, Scrum Master, and more)
- **Party Mode**: Bring multiple agent personas into one session to plan, troubleshoot, or discuss collaboratively
- **Complete Lifecycle**: From brainstorming to deployment, every step of the way

---

## Quick Start

BMad is already installed in this project. Just start talking naturally:

- **"start BMad"** — Get oriented, the BMad Master helps you figure out where to begin
- **"what's next?"** or **"help"** — At any time, find out what workflow to run next
- **"brainstorm"** — Start exploring ideas
- **"create brief"** — Nail down your product idea

> **Tip:** You can trigger any workflow by saying its name naturally or using its 2-letter code (listed below).

---

## Two Paths to Working Code

### Simple Path — Quick Flow

For bug fixes, small features, utilities, or projects with clear scope:

1. **"quick spec"** (QS) — Analyzes your needs and produces a tech spec with acceptance criteria
2. **"quick dev"** (QD) — Implements the spec
3. **"code review"** (CR) — Validates quality

Three steps from idea to working code.

### Full Planning Path — BMad Method

For products, platforms, complex features — structured planning then build:

1. **"create brief"** (CB) — Define the problem, users, and MVP scope
2. **"create PRD"** (CP) — Full requirements with personas, metrics, and risks
3. **"create architecture"** (CA) — Technical decisions and system design
4. **"create epics"** (CE) — Break work into prioritized stories
5. **"sprint planning"** (SP) — Plan the implementation order
6. **Repeat per story:** "create story" (CS) → "validate story" (VS) → "dev story" (DS) → "code review" (CR)

Every step tells you what's next. Optional phases (brainstorming, research, UX design) are available when you need them.

---

## Agents

BMad uses specialized agent personas. Each brings domain expertise to their part of the process. Activate any agent by saying their name or role.

| Say | Name | Role |
|---|---|---|
| "act as analyst" or "Mary" | Mary | Business Analyst — Brainstorming, research, product briefs |
| "act as PM" or "John" | John | Product Manager — PRDs, epics, stories |
| "act as architect" or "Winston" | Winston | Architect — Technical architecture and system design |
| "act as UX designer" or "Sally" | Sally | UX Designer — User experience and interface design |
| "act as dev" or "Amelia" | Amelia | Developer — Story implementation and coding |
| "act as QA" or "Quinn" | Quinn | QA Engineer — Testing and quality assurance |
| "act as SM" or "Bob" | Bob | Scrum Master — Sprint planning and management |
| "act as tech writer" or "Paige" | Paige | Technical Writer — Documentation and diagrams |
| "quick flow" or "Barry" | Barry | Quick Flow Solo Dev — Fast builds, simple projects |
| "start BMad" | BMad Master | Orientation — Helps you get started |

---

## Complete Workflow Reference

### Phase 0: Assessment (Brownfield Projects)

| Say | Code | What It Does | Output |
|---|---|---|---|
| "assess brownfield" | AB | Scan an existing project to understand its state and find the best BMad entry point | Assessment report |

### Phase 1: Analysis

| Say | Code | What It Does | Output |
|---|---|---|---|
| "brainstorm" | BP | Generate and explore ideas through guided brainstorming techniques | Brainstorming session |
| "market research" | MR | Competitive analysis, market landscape, customer needs, trends | Research document |
| "domain research" | DR | Industry deep dive, subject matter expertise, terminology | Research document |
| "technical research" | TR | Technical feasibility, architecture options, implementation approaches | Research document |
| "create brief" | CB | Guided session to nail down your product idea | Product Brief |

### Phase 2: Planning

| Say | Code | What It Does | Required? | Output |
|---|---|---|---|---|
| "create PRD" | CP | Full product requirements — features, personas, metrics, risks | Yes | PRD |
| "validate PRD" | VP | Review PRD for completeness, cohesion, and quality | No | Validation report |
| "edit PRD" | EP | Update or improve an existing PRD | No | Updated PRD |
| "create UX" | CU | User experience design — screens, flows, interactions | No (recommended if UI-heavy) | UX Design |

### Phase 3: Solutioning

| Say | Code | What It Does | Required? | Output |
|---|---|---|---|---|
| "create architecture" | CA | Technical decisions — stack, database, APIs, folder structure | Yes | Architecture doc |
| "create epics" | CE | Break work into epics (big chunks) and stories (small buildable units) | Yes | Epics & Stories |
| "check readiness" | IR | Cross-check that PRD, UX, Architecture, and Epics are all aligned | Yes | Readiness report |

### Phase 4: Implementation

| Say | Code | What It Does | Required? | Output |
|---|---|---|---|---|
| "sprint planning" | SP | Select stories and plan the build order | Yes | Sprint plan |
| "sprint status" | SS | Check where you are in the current sprint | No | Status summary |
| "create story" | CS | Prepare the next story with acceptance criteria and dev notes | Yes | Story document |
| "validate story" | VS | Verify the story is complete and ready for development | No | Validation report |
| "dev story" | DS | Implement the story — plan approach from ACs, build, test | Yes | Working code |
| "code review" | CR | Review implemented code against acceptance criteria | No | Review findings |
| "QA test" | QA | Generate automated API and end-to-end tests | No | Test suite |
| "retrospective" | ER | Review completed work, lessons learned, plan next steps | No | Retrospective |

### The Story Cycle

The implementation loop repeats for each story:

```
Create Story (CS) → Validate Story (VS) → Dev Story (DS) → Code Review (CR)
       ↑                                                          |
       |          (back to DS if fixes needed)                    |
       +──────────(next story or Retrospective when epic done)────+
```

### Anytime Workflows

These can be used at any point in the process:

| Say | Code | What It Does | Output |
|---|---|---|---|
| "quick spec" | QS | Fast tech spec with acceptance criteria (skip full planning) | Tech spec |
| "quick dev" | QD | Fast implementation from spec or direct instructions | Working code |
| "correct course" | CC | Navigate significant changes — pivot, update plans, adjust scope | Change proposal |
| "generate project context" | GPC | Scan codebase to create an AI-optimized project summary | Project context file |
| "document project" | DP | Analyze a project and produce useful documentation | Documentation |
| "party mode" | PM | Multi-agent discussion — multiple personas collaborate on a topic | Discussion outcomes |
| "adversarial review" | AR | Critical review of any document to find weaknesses | Review findings |
| "what's next?" / "help" | BH | Get guidance on what to do next based on current progress | Next steps |

### Tech Writer Tools (via Paige)

| Say | Code | What It Does | Output |
|---|---|---|---|
| "write document" | WD | Create any document following best practices | Document |
| "update standards" | US | Update documentation standards with your preferences | Updated standards |
| "mermaid" | MG | Create diagrams from descriptions | Mermaid diagram |
| "validate document" | VD | Review any document against quality standards | Validation report |
| "explain concept" | EC | Clear technical explanations of complex concepts | Explanation |

### Utility Tasks

| Say | Code | What It Does | Output |
|---|---|---|---|
| "index docs" | ID | Create lightweight index for quick document scanning | Index file |
| "shard document" | SD | Split large documents (500+ lines) into smaller files | Sharded files |
| "review prose" | — | Polish writing for clarity, tone, and communication | Prose review |
| "review structure" | — | Reorganize and simplify document structure | Structure review |

---

## How It Works in Replit

BMad in Replit uses **natural language triggers** instead of slash commands. You just talk normally:

- Say **"create a PRD"** or just **"CP"** — same result
- Say **"I need Winston"** or **"act as architect"** — loads the Architect persona
- Say **"what should I do next?"** — BMad Help figures out where you are and guides you

**Key differences from other IDE versions:**
- No slash commands needed — speak naturally or use 2-letter codes
- Replit Agent plans its own implementation approach from acceptance criteria (no pre-scripted task checklists)
- Code reviews use Replit's built-in review capabilities
- All artifacts are saved to `_bmad-output/` (planning and implementation subdirectories)

**Fresh chat recommendation:** For context-heavy workflows (creating PRDs, architecture, epics), starting a new chat session helps keep the AI focused. BMad Help (BH) will tell you when this is a good idea.

---

## Project Structure

```
_bmad/                    # BMad Method toolkit (managed by updates)
├── core/                 # Core engine (workflow executor, help, brainstorming)
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 10 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis → implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Trigger phrase → file routing table

_bmad-output/             # Your generated artifacts (preserved on update)
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

---

## Configuration

Two config files control BMad behavior:

- **`_bmad/core/config.yaml`** — Your name and preferred language
- **`_bmad/bmm/config.yaml`** — Project name, skill level, output paths

These are preserved when you update BMad.

---

## Installation

### Fresh Install (into a new or existing Replit project)

1. Copy the `_bmad/` folder and `install-bmad.sh` into your project root
2. Run: `bash install-bmad.sh`
3. The script auto-detects brownfield vs greenfield and safely merges with any existing `replit.md`
4. Start a new chat and say **"start BMad"** or **"what's next?"**

### Updating

Run the update script to pull the latest version:

```bash
bash update-bmad.sh
```

The update preserves:
- Your configuration files (`config.yaml`)
- Your planning artifacts (`_bmad-output/`)
- Your `replit.md` content

Start a new chat after updating to pick up changes.

---

## Community & Resources

- **Upstream Project:** [github.com/bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- **Documentation:** [docs.bmad-method.org](http://docs.bmad-method.org)
- **Discord:** [Join the community](https://discord.gg/gk8jAdXWmj)
- **YouTube:** [@BMadCode](https://www.youtube.com/@BMadCode)
- **GitHub Issues:** [Report bugs or request features](https://github.com/bmad-code-org/BMAD-METHOD/issues)

---

## License

MIT License — see the [upstream repository](https://github.com/bmad-code-org/BMAD-METHOD) for details.

**BMad** and **BMAD-METHOD** are trademarks of BMad Code, LLC.
