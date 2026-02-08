#!/bin/bash
#
# BMad Method v6.0.0-Beta.7 — Replit Install Script
#
# Installs the BMad Method toolkit into a Replit project.
# Safe to run on existing projects — preserves existing replit.md content.
#
# Usage: bash install-bmad.sh
#

set -e

BMAD_VERSION="6.0.0-Beta.7"
BMAD_MARKER="<!-- BMAD-METHOD-START -->"
BMAD_MARKER_END="<!-- BMAD-METHOD-END -->"

echo ""
echo "=========================================="
echo " BMad Method $BMAD_VERSION — Replit Installer"
echo "=========================================="
echo ""

# ─── Step 1: Verify _bmad/ exists ──────────────────────────────────────────
if [ ! -d "_bmad" ]; then
  echo "ERROR: _bmad/ directory not found in the current directory."
  echo "Make sure you've copied the _bmad/ folder into your project root first."
  echo ""
  echo "Expected structure:"
  echo "  your-project/"
  echo "    _bmad/          <-- copy this folder here"
  echo "    install-bmad.sh <-- run this script"
  echo "    (your existing files...)"
  exit 1
fi

echo "[1/5] Found _bmad/ toolkit directory"

# ─── Step 2: Create output directories ─────────────────────────────────────
mkdir -p _bmad-output/planning-artifacts
mkdir -p _bmad-output/implementation-artifacts
echo "[2/5] Created _bmad-output/ directories"

# ─── Step 3: Detect project type ───────────────────────────────────────────
IS_BROWNFIELD=false
EXISTING_FILES=0

# Check for common indicators of an existing project
for indicator in "package.json" "requirements.txt" "Cargo.toml" "go.mod" "Gemfile" "pyproject.toml" "pom.xml" "build.gradle" "composer.json" "mix.exs"; do
  if [ -f "$indicator" ]; then
    EXISTING_FILES=$((EXISTING_FILES + 1))
  fi
done

# Check for source directories
for dir in "src" "app" "lib" "server" "client" "api" "pages" "components"; do
  if [ -d "$dir" ]; then
    EXISTING_FILES=$((EXISTING_FILES + 1))
  fi
done

if [ "$EXISTING_FILES" -gt 0 ]; then
  IS_BROWNFIELD=true
  echo "[3/5] Detected BROWNFIELD project ($EXISTING_FILES existing indicators found)"
else
  echo "[3/5] Detected GREENFIELD project (no existing project files found)"
fi

# ─── Step 4: Handle replit.md ──────────────────────────────────────────────

# Generate the BMAD section content
generate_bmad_section() {
  local project_type="greenfield"
  if [ "$IS_BROWNFIELD" = true ]; then
    project_type="brownfield"
  fi

  cat << 'BMAD_SECTION_START'
<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-Beta.7 — Agent Configuration

## Overview

This project uses the **BMad Method** — an AI-driven agile development framework. It provides structured agent personas and workflows that guide projects from idea through implementation.

**How to use:** Just speak naturally. Say things like "act as the PM", "create a PRD", "what should I do next?", or use any 2-letter code (BP, CP, CA, etc.).

## Routing

When the user's message matches a BMAD trigger phrase, agent name, or workflow code:

1. **Read the routing table:** `_bmad/replit-routing.md`
2. **Match the request** to an agent or workflow using the trigger phrases listed there
3. **Load the matched file** and follow its instructions
4. **For workflows:** Execute using `_bmad/core/tasks/workflow.xml` as the execution engine
5. **For agents:** Adopt the persona and present the agent's menu
6. **For "what's next?" or "help":** Execute `_bmad/core/tasks/help.md`

## Quick Reference — Agents

| Say | Agent | Role |
|---|---|---|
| "act as analyst" or "Mary" | Business Analyst | Brainstorming, research, briefs |
| "act as PM" or "John" | Product Manager | PRDs, epics, stories |
| "act as architect" or "Winston" | Architect | Technical architecture |
| "act as UX designer" or "Sally" | UX Designer | User experience design |
| "act as dev" or "Amelia" | Developer | Story implementation |
| "act as QA" or "Quinn" | QA Engineer | Testing and quality |
| "act as SM" or "Bob" | Scrum Master | Sprint planning and management |
| "act as tech writer" or "Paige" | Technical Writer | Documentation |
| "quick flow" or "Barry" | Quick Flow Solo Dev | Fast builds, simple projects |
| "start BMad" | BMad Master | Initialize and get oriented |

## Quick Reference — Key Workflows

| Say | Code | What It Does |
|---|---|---|
| "assess brownfield" | AB | Scan existing project, find best BMAD entry point |
| "brainstorm" | BP | Generate and explore ideas |
| "create brief" | CB | Nail down the product idea |
| "create PRD" | CP | Product requirements document |
| "create architecture" | CA | Technical architecture |
| "create epics" | CE | Break work into epics and stories |
| "sprint planning" | SP | Plan the implementation sprint |
| "dev story" | DS | Implement a story |
| "code review" | CR | Review implemented code |
| "what's next?" | BH | Get guidance on next steps |
| "quick spec" | QS | Fast technical spec (simple projects) |
| "quick dev" | QD | Fast implementation (simple projects) |

BMAD_SECTION_START

  # Project state section with dynamic project type
  echo "## Project State"
  echo ""
  echo "- **Current Phase:** not started"
  echo "- **Project Type:** $project_type"
  echo "- **Completed Artifacts:** none yet"
  echo ""

  cat << 'BMAD_SECTION_END'
## BMad File Structure

```
_bmad/                    # BMad Method toolkit
├── core/                 # Core engine (workflow executor, help, brainstorming)
│   ├── agents/           # BMad Master agent
│   ├── tasks/            # Help, workflow engine, editorial tasks
│   └── workflows/        # Brainstorming, party mode, elicitation
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 9 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis → implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Trigger phrase → file routing table

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **User config:** `_bmad/core/config.yaml` (user name, language)
- **Project config:** `_bmad/bmm/config.yaml` (project name, skill level, output paths)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)
<!-- BMAD-METHOD-END -->
BMAD_SECTION_END
}

if [ -f "replit.md" ]; then
  # Check if BMAD is already installed
  if grep -q "$BMAD_MARKER" replit.md 2>/dev/null; then
    echo "[4/5] Updating existing BMAD section in replit.md..."

    # Remove old BMAD section and replace with new one
    # Create temp file with content before BMAD marker
    sed -n "1,/$BMAD_MARKER/{ /$BMAD_MARKER/!p }" replit.md > replit.md.tmp

    # Remove any blank lines at the end of the preserved content
    sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' replit.md.tmp 2>/dev/null || true

    # Add separator and new BMAD section
    echo "" >> replit.md.tmp
    echo "" >> replit.md.tmp
    generate_bmad_section >> replit.md.tmp

    # Check if there's content after the end marker and preserve it
    if grep -q "$BMAD_MARKER_END" replit.md 2>/dev/null; then
      AFTER_CONTENT=$(sed -n "/$BMAD_MARKER_END/,\${ /$BMAD_MARKER_END/!p }" replit.md)
      if [ -n "$AFTER_CONTENT" ]; then
        echo "" >> replit.md.tmp
        echo "$AFTER_CONTENT" >> replit.md.tmp
      fi
    fi

    mv replit.md.tmp replit.md
    echo "         Preserved existing project content, updated BMAD section"

  else
    echo "[4/5] Appending BMAD section to existing replit.md..."

    # Preserve existing content and append BMAD section
    echo "" >> replit.md
    echo "" >> replit.md
    echo "---" >> replit.md
    echo "" >> replit.md
    generate_bmad_section >> replit.md
    echo "         Preserved all existing content, added BMAD section at the end"
  fi

else
  echo "[4/5] Creating new replit.md..."
  generate_bmad_section > replit.md
  echo "         Created fresh replit.md with BMAD configuration"
fi

# ─── Step 5: Summary ──────────────────────────────────────────────────────

echo "[5/5] Installation complete!"
echo ""
echo "=========================================="
echo " BMad Method installed successfully!"
echo "=========================================="
echo ""

if [ "$IS_BROWNFIELD" = true ]; then
  echo "  Project type: BROWNFIELD (existing project detected)"
  echo ""
  echo "  Your first step should be:"
  echo "    Say \"assess brownfield\" or \"AB\""
  echo "    This will scan your project and find the best"
  echo "    entry point into the BMad planning workflow."
else
  echo "  Project type: GREENFIELD (fresh project)"
  echo ""
  echo "  Your first step should be:"
  echo "    Say \"start BMad\" to initialize and get oriented"
  echo "    Or say \"brainstorm\" to start generating ideas"
fi

echo ""
echo "  Anytime you need help, just say:"
echo "    \"what should I do next?\""
echo ""
echo "=========================================="
echo ""
