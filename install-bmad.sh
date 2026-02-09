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

echo "[1/6] Found _bmad/ toolkit directory"

# ─── Step 2: Create output directories ─────────────────────────────────────
mkdir -p _bmad-output/planning-artifacts
mkdir -p _bmad-output/implementation-artifacts
echo "[2/6] Created _bmad-output/ directories"

# ─── Step 3: Detect project type ───────────────────────────────────────────
IS_BROWNFIELD=false
STRONG_INDICATORS=0
WEAK_INDICATORS=0

has_real_content() {
  local file="$1"
  local lines
  lines=$(wc -l < "$file" 2>/dev/null || echo "0")
  [ "$lines" -gt 5 ]
}

dir_has_code() {
  local dir="$1"
  local count
  count=$(find "$dir" -maxdepth 2 -type f \( -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.rb" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.php" -o -name "*.cpp" -o -name "*.c" -o -name "*.cs" -o -name "*.swift" -o -name "*.vue" -o -name "*.svelte" -o -name "*.jsx" -o -name "*.tsx" \) 2>/dev/null | head -3 | wc -l)
  [ "$count" -gt 0 ]
}

for indicator in "requirements.txt" "Cargo.toml" "go.mod" "Gemfile" "pyproject.toml" "pom.xml" "build.gradle" "composer.json" "mix.exs"; do
  if [ -f "$indicator" ] && has_real_content "$indicator"; then
    STRONG_INDICATORS=$((STRONG_INDICATORS + 1))
  fi
done

if [ -f "package.json" ] && has_real_content "package.json"; then
  if grep -q '"dependencies"' package.json 2>/dev/null; then
    STRONG_INDICATORS=$((STRONG_INDICATORS + 1))
  else
    WEAK_INDICATORS=$((WEAK_INDICATORS + 1))
  fi
fi

for dir in "src" "app" "lib" "server" "client" "api" "pages" "components"; do
  if [ -d "$dir" ] && dir_has_code "$dir"; then
    STRONG_INDICATORS=$((STRONG_INDICATORS + 1))
  elif [ -d "$dir" ]; then
    WEAK_INDICATORS=$((WEAK_INDICATORS + 1))
  fi
done

if [ "$STRONG_INDICATORS" -gt 0 ]; then
  IS_BROWNFIELD=true
  echo "[3/6] Detected BROWNFIELD project ($STRONG_INDICATORS strong indicators found)"
elif [ "$WEAK_INDICATORS" -gt 1 ]; then
  IS_BROWNFIELD=true
  echo "[3/6] Detected BROWNFIELD project (multiple project indicators found)"
  echo "       NOTE: If this is actually a new project, tell the agent"
  echo "       \"this is a greenfield project\" and it will adjust."
else
  echo "[3/6] Detected GREENFIELD project (no existing project code found)"
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

When the user's message matches a BMAD trigger phrase, agent name, or workflow code below:

1. **Match the request** to an agent or workflow using the trigger phrases in the tables below
2. **Load the matched file** and follow its instructions
3. **For workflows:** Execute using `_bmad/core/tasks/workflow.xml` as the execution engine
4. **For agents:** Adopt the persona and present the agent's menu
5. **For "what's next?" or "help":** Execute `_bmad/core/tasks/help.md`

BMAD_SECTION_START

  # Inline the full routing table directly from the source file
  if [ -f "_bmad/replit-routing.md" ]; then
    # Skip the title line and intro paragraph, include from "## Agent Routing" onward
    sed -n '/^## Agent Routing/,$p' "_bmad/replit-routing.md"
    echo ""
  else
    # Fallback: abbreviated tables if routing file is missing
    cat << 'ROUTING_FALLBACK'
### Agent Routing

| Trigger Phrases | Agent | File |
|---|---|---|
| "act as analyst", "Mary" | Business Analyst | `_bmad/bmm/agents/analyst.md` |
| "act as PM", "John" | Product Manager | `_bmad/bmm/agents/pm.md` |
| "act as architect", "Winston" | Architect | `_bmad/bmm/agents/architect.md` |
| "act as UX designer", "Sally" | UX Designer | `_bmad/bmm/agents/ux-designer.md` |
| "act as dev", "Amelia" | Developer | `_bmad/bmm/agents/dev.md` |
| "act as QA", "Quinn" | QA Engineer | `_bmad/bmm/agents/qa.md` |
| "act as SM", "Bob" | Scrum Master | `_bmad/bmm/agents/sm.md` |
| "act as tech writer", "Paige" | Technical Writer | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "quick flow", "Barry" | Quick Flow Solo Dev | `_bmad/bmm/agents/quick-flow-solo-dev.md` |
| "start BMad", "BMad master" | BMad Master | `_bmad/core/agents/bmad-master.md` |

> Full routing table not found at `_bmad/replit-routing.md`. Re-run install to regenerate.

ROUTING_FALLBACK
  fi

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
└── replit-routing.md     # Routing source (auto-inlined into replit.md on install)

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **BMAD config:** `_bmad/bmm/config.yaml` (skill level, output paths — BMAD-specific settings only)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)
- **Platform values:** User name, project name, and language are resolved automatically from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)

**IMPORTANT:** Do NOT embed the contents of BMad config files (config.yaml, etc.) into this replit.md. Only reference them by file path above. Read them from disk when needed.
<!-- BMAD-METHOD-END -->
BMAD_SECTION_END
}

if [ -f "replit.md" ]; then
  # Check if BMAD is already installed
  if grep -q "$BMAD_MARKER" replit.md 2>/dev/null; then
    echo "[4/6] Updating existing BMAD section in replit.md..."

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
    echo "[4/6] Appending BMAD section to existing replit.md..."

    # Preserve existing content and append BMAD section
    echo "" >> replit.md
    echo "" >> replit.md
    echo "---" >> replit.md
    echo "" >> replit.md
    generate_bmad_section >> replit.md
    echo "         Preserved all existing content, added BMAD section at the end"
  fi

else
  echo "[4/6] Creating new replit.md..."
  generate_bmad_section > replit.md
  echo "         Created fresh replit.md with BMAD configuration"
fi

# ─── Step 5: Copy update script ──────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$SCRIPT_DIR/update-bmad.sh" ]; then
  cp "$SCRIPT_DIR/update-bmad.sh" ./update-bmad.sh 2>/dev/null || true
  echo "[5/6] Copied update script (run 'bash update-bmad.sh' for future updates)"
else
  echo "[5/6] Update script not found — you can download it from the BMad repo"
fi

# ─── Step 6: Copy README ──────────────────────────────────────────────────
if [ -f "_bmad/README.md" ]; then
  cp "_bmad/README.md" "BMAD-README.md"
  echo "[6/6] Copied BMAD-README.md (complete guide to using BMad in Replit)"
else
  echo "[6/6] README not found in toolkit — skipping"
fi

# ─── Summary ──────────────────────────────────────────────────────────────

echo ""
echo "Installation complete!"
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
