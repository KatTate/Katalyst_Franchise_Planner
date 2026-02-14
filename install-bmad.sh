#!/bin/bash
#
# BMad Method v6.0.0-Beta.8 — Replit Install Script
#
# Installs the BMad Method toolkit into a Replit project.
# Safe to run on existing projects — preserves existing replit.md content.
#
# Usage: bash install-bmad.sh
#

set -e

BMAD_VERSION="6.0.0-Beta.8"
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

echo "[1/7] Found _bmad/ toolkit directory"

# ─── Step 2: Create output directories ─────────────────────────────────────
mkdir -p _bmad-output/planning-artifacts
mkdir -p _bmad-output/implementation-artifacts
echo "[2/7] Created _bmad-output/ directories"

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
  echo "[3/7] Detected BROWNFIELD project ($STRONG_INDICATORS strong indicators found)"
elif [ "$WEAK_INDICATORS" -gt 1 ]; then
  IS_BROWNFIELD=true
  echo "[3/7] Detected BROWNFIELD project (multiple project indicators found)"
  echo "       NOTE: If this is actually a new project, tell the agent"
  echo "       \"this is a greenfield project\" and it will adjust."
else
  echo "[3/7] Detected GREENFIELD project (no existing project code found)"
fi

# ─── Step 4: Install Skills ───────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_INSTALLED=0

RESOLVED_SCRIPT_DIR="$(cd "$SCRIPT_DIR" && pwd -P)"
RESOLVED_CWD="$(pwd -P)"

if [ "$RESOLVED_SCRIPT_DIR" = "$RESOLVED_CWD" ] && [ -d ".agents/skills/bmad-core" ]; then
  SKILLS_INSTALLED=$(ls -1d .agents/skills/bmad-*/ 2>/dev/null | wc -l)
  echo "[4/7] Found $SKILLS_INSTALLED BMAD skills already in place (same directory)"
elif [ -d "$SCRIPT_DIR/.agents/skills" ]; then
  mkdir -p .agents/skills
  for skill_dir in "$SCRIPT_DIR"/.agents/skills/bmad-*/; do
    if [ -d "$skill_dir" ]; then
      skill_name=$(basename "$skill_dir")
      rm -rf ".agents/skills/$skill_name"
      cp -r "$skill_dir" ".agents/skills/$skill_name"
      SKILLS_INSTALLED=$((SKILLS_INSTALLED + 1))
    fi
  done
  echo "[4/7] Installed $SKILLS_INSTALLED BMAD skills to .agents/skills/"
elif [ -d ".agents/skills/bmad-core" ]; then
  SKILLS_INSTALLED=$(ls -1d .agents/skills/bmad-*/ 2>/dev/null | wc -l)
  echo "[4/7] Found $SKILLS_INSTALLED existing BMAD skills (already in place)"
else
  echo "[4/7] WARNING: No BMAD skills found to install!"
  echo "       Skills should be in .agents/skills/bmad-*/ alongside this script"
  echo "       or already present in the target directory."
  echo ""
  echo "       *** BMAD uses skills-only activation. Without skills, workflows ***"
  echo "       *** will NOT activate from user commands. Re-download from the  ***"
  echo "       *** BMad repo to get the complete package with skills included. ***"
fi

# ─── Step 5: Handle replit.md ──────────────────────────────────────────────

generate_bmad_protected_section() {
  cat << 'BMAD_PROTECTED'
<!-- PROTECTION NOTE FOR REPLIT AGENT: The content between BMAD-METHOD-START and BMAD-METHOD-END markers is part of the BMad Method framework and MUST NOT be modified, overwritten, or removed during any replit.md updates. When updating this file, only modify the "Project Documentation" section AFTER the BMAD-METHOD-END marker. Always preserve both sections intact. -->

<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-Beta.8 — Agent Configuration

## IMPORTANT: How You Must Operate in This Project

This is a **BMad Method** project. BMAD workflows are activated through **Replit Agent Skills** installed in `.agents/skills/bmad-*/`. You MUST follow these rules in every conversation:

1. **BMAD skills handle workflow activation.** When a user's message matches a BMAD skill trigger (e.g., "create PRD", "code review", "party mode"), the skill will activate and provide instructions for loading the correct workflow files. Follow those instructions exactly.
2. **When a skill activates, load the referenced files and follow them.** Do not answer in your own words. Load the workflow or agent file specified in the skill and execute it.
3. **For workflows:** The skill will instruct you to either load `_bmad/core/tasks/workflow.xml` (the execution engine) with a workflow YAML config, or load a workflow markdown file directly. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.
4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu.
5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.
6. **If no skill activates,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow. Say "help" or "BH" anytime for guidance.
7. **If unsure whether a BMAD workflow applies,** ask: "Would you like me to run the [workflow name] workflow for that?"

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
└── _memory/              # Agent memory (tech writer standards)

.agents/skills/bmad-*/    # Replit Agent Skills (workflow activation)

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
BMAD_PROTECTED
}

generate_project_docs_section() {
  local project_type="greenfield"
  if [ "$IS_BROWNFIELD" = true ]; then
    project_type="brownfield"
  fi

  cat << BMAD_PROJECT_DOCS

## Project Documentation

> This section is safe for the Replit agent to update. Add project-specific information below.

### Project State

- **Current Phase:** not started
- **Project Type:** $project_type
- **Completed Artifacts:** none yet

BMAD_PROJECT_DOCS
}

if [ -f "replit.md" ]; then
  if grep -q "$BMAD_MARKER" replit.md 2>/dev/null; then
    echo "[5/7] Updating existing BMAD section in replit.md..."

    # Extract content BEFORE the BMAD start marker (e.g., nothing, or user preamble)
    # But skip any old protection notes that are outside the markers
    sed -n "1,/$BMAD_MARKER/{ /$BMAD_MARKER/!p }" replit.md > replit.md.before
    # Remove lines that are just the protection note (avoid duplication)
    grep -v "PROTECTION NOTE FOR REPLIT AGENT" replit.md.before > replit.md.tmp 2>/dev/null || echo -n "" > replit.md.tmp
    rm -f replit.md.before

    sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' replit.md.tmp 2>/dev/null || true

    # Write the protected BMAD section
    generate_bmad_protected_section >> replit.md.tmp

    # Preserve content after the end marker (user's Project Documentation)
    if grep -q "$BMAD_MARKER_END" replit.md 2>/dev/null; then
      AFTER_CONTENT=$(sed -n "/$BMAD_MARKER_END/,\${ /$BMAD_MARKER_END/!p }" replit.md)
      if [ -n "$AFTER_CONTENT" ]; then
        echo "$AFTER_CONTENT" >> replit.md.tmp
      else
        generate_project_docs_section >> replit.md.tmp
      fi
    else
      generate_project_docs_section >> replit.md.tmp
    fi

    mv replit.md.tmp replit.md
    echo "         Preserved existing project content, updated BMAD section"

  else
    echo "[5/7] Appending BMAD section to existing replit.md..."

    echo "" >> replit.md
    echo "" >> replit.md
    echo "---" >> replit.md
    echo "" >> replit.md
    generate_bmad_protected_section >> replit.md
    generate_project_docs_section >> replit.md
    echo "         Preserved all existing content, added BMAD section at the end"
  fi

else
  echo "[5/7] Creating new replit.md..."
  generate_bmad_protected_section > replit.md
  generate_project_docs_section >> replit.md
  echo "         Created fresh replit.md with BMAD configuration"
fi

# ─── Step 6: Copy update script ──────────────────────────────────────────
if [ -f "$SCRIPT_DIR/update-bmad.sh" ]; then
  cp "$SCRIPT_DIR/update-bmad.sh" ./update-bmad.sh 2>/dev/null || true
  echo "[6/7] Copied update script (run 'bash update-bmad.sh' for future updates)"
else
  echo "[6/7] Update script not found — you can download it from the BMad repo"
fi

# ─── Step 7: Copy README ──────────────────────────────────────────────────
if [ -f "_bmad/README.md" ]; then
  cp "_bmad/README.md" "BMAD-README.md"
  echo "[7/7] Copied BMAD-README.md (complete guide to using BMad in Replit)"
else
  echo "[7/7] README not found in toolkit — skipping"
fi

# ─── Summary ──────────────────────────────────────────────────────────────

echo ""
echo "Installation complete!"
echo ""
echo "=========================================="
echo " BMad Method installed successfully!"
echo "=========================================="
echo ""

if [ "$SKILLS_INSTALLED" -gt 0 ]; then
  echo "  Skills: $SKILLS_INSTALLED BMAD skills installed"
  echo "  Activation: Skills handle all workflow discovery"
else
  echo "  Skills: NOT INSTALLED — workflows will not activate!"
  echo "  Re-download from the BMad repo for the complete package."
fi

echo ""

if [ "$IS_BROWNFIELD" = true ]; then
  echo "  Project type: BROWNFIELD (existing project detected)"
  echo ""
  echo "  Your first step should be:"
  echo "    Say \"assess project\" or \"AP\""
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
echo "    \"what should I do next?\" or \"help\""
echo ""
echo "=========================================="
echo ""
