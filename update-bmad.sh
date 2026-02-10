#!/bin/bash
#
# BMad Method -- Replit Update Script
#
# Downloads the latest BMad toolkit from GitHub and updates the _bmad/ folder
# while preserving your project-specific configuration.
#
# Usage: bash update-bmad.sh
#
# Source: https://github.com/KatTate/Bmad-for-Replit
#

set -e

GITHUB_REPO="KatTate/Bmad-for-Replit"
GITHUB_URL="https://github.com/$GITHUB_REPO/archive/refs/heads/main.zip"
TEMP_DIR="/tmp/bmad-update-$$"
EXTRACTED_DIR="$TEMP_DIR/Bmad-for-Replit-main"

echo ""
echo "=========================================="
echo " BMad Method -- Update"
echo "=========================================="
echo ""

# --- Step 1: Check current installation ---
if [ ! -d "_bmad" ]; then
  echo "ERROR: _bmad/ directory not found."
  echo "BMad doesn't appear to be installed in this project."
  echo "Use install-bmad.sh for a fresh installation instead."
  exit 1
fi

CURRENT_VERSION="unknown"
if [ -f "_bmad/_config/version.txt" ]; then
  CURRENT_VERSION=$(cat _bmad/_config/version.txt | tr -d '[:space:]')
fi

echo "[1/7] Current version: $CURRENT_VERSION"

# --- Step 2: Back up user configuration ---
echo "[2/7] Backing up your configuration..."

BACKUP_DIR="/tmp/bmad-config-backup-$$"
mkdir -p "$BACKUP_DIR"

if [ -f "_bmad/bmm/config.yaml" ]; then
  cp "_bmad/bmm/config.yaml" "$BACKUP_DIR/bmm-config.yaml"
  echo "       Saved BMAD config (skill level, output paths)"
fi

# --- Step 3: Download latest from GitHub ---
echo "[3/7] Downloading latest version from GitHub..."

mkdir -p "$TEMP_DIR"

if ! curl -sL -o "$TEMP_DIR/bmad-latest.zip" "$GITHUB_URL"; then
  echo "ERROR: Failed to download from GitHub."
  echo "Check your internet connection and that the repo is accessible:"
  echo "  $GITHUB_URL"
  rm -rf "$TEMP_DIR" "$BACKUP_DIR"
  exit 1
fi

if ! unzip -q "$TEMP_DIR/bmad-latest.zip" -d "$TEMP_DIR"; then
  echo "ERROR: Failed to unzip the download."
  echo "The downloaded file may be corrupted or the repo may be private."
  rm -rf "$TEMP_DIR" "$BACKUP_DIR"
  exit 1
fi

if [ ! -d "$EXTRACTED_DIR/_bmad" ]; then
  echo "ERROR: Downloaded archive doesn't contain _bmad/ directory."
  echo "The repository structure may have changed."
  rm -rf "$TEMP_DIR" "$BACKUP_DIR"
  exit 1
fi

NEW_VERSION="unknown"
if [ -f "$EXTRACTED_DIR/_bmad/_config/version.txt" ]; then
  NEW_VERSION=$(cat "$EXTRACTED_DIR/_bmad/_config/version.txt" | tr -d '[:space:]')
fi

echo "       Latest version: $NEW_VERSION"

# --- Step 4: Replace _bmad/ folder ---
echo "[4/7] Updating _bmad/ toolkit..."

rm -rf "_bmad"
cp -r "$EXTRACTED_DIR/_bmad" "_bmad"

echo "       Toolkit files replaced"

# --- Step 5: Restore user configuration ---
echo "[5/7] Restoring your configuration..."

if [ -f "$BACKUP_DIR/bmm-config.yaml" ]; then
  cp "$BACKUP_DIR/bmm-config.yaml" "_bmad/bmm/config.yaml"
  echo "       Restored BMAD config"
fi

# --- Step 6: Update support files ---
echo "[6/7] Updating support files..."

if [ -f "$EXTRACTED_DIR/update-bmad.sh" ]; then
  cp "$EXTRACTED_DIR/update-bmad.sh" "update-bmad.sh"
  echo "       Updated update script"
fi

if [ -f "$EXTRACTED_DIR/install-bmad.sh" ]; then
  cp "$EXTRACTED_DIR/install-bmad.sh" "install-bmad.sh"
  echo "       Updated install script"
fi

if [ -f "$EXTRACTED_DIR/verify-bmad.sh" ]; then
  cp "$EXTRACTED_DIR/verify-bmad.sh" "verify-bmad.sh"
  echo "       Updated verify script"
fi

if [ -f "_bmad/README.md" ]; then
  cp "_bmad/README.md" "BMAD-README.md"
  echo "       Updated BMAD-README.md"
fi

# --- Step 7: Re-inline routing table into replit.md ---
BMAD_MARKER_START="<!-- BMAD-METHOD-START -->"
BMAD_MARKER_END="<!-- BMAD-METHOD-END -->"

if [ -f "replit.md" ] && [ -f "_bmad/replit-routing.md" ]; then

  # Detect project type (needed for both paths)
  local_project_type="greenfield"
  for indicator in "requirements.txt" "Cargo.toml" "go.mod" "Gemfile" "pyproject.toml" "pom.xml" "build.gradle" "composer.json" "mix.exs"; do
    if [ -f "$indicator" ]; then
      local_project_type="brownfield"
      break
    fi
  done
  if [ -f "package.json" ] && grep -q '"dependencies"' package.json 2>/dev/null; then
    local_project_type="brownfield"
  fi

  # Extract current project state values if they exist
  CURRENT_PHASE=$(grep -oP '(?<=\*\*Current Phase:\*\* ).*' replit.md 2>/dev/null || echo "not started")
  COMPLETED_ARTIFACTS=$(grep -oP '(?<=\*\*Completed Artifacts:\*\* ).*' replit.md 2>/dev/null || echo "none yet")

  if grep -q "$BMAD_MARKER_START" replit.md 2>/dev/null; then
    # --- Path A: Markers exist — replace BMAD section in-place ---
    echo "[7/7] Re-inlining routing table into replit.md..."

    # Extract content before BMAD marker
    sed -n "1,/$BMAD_MARKER_START/{ /$BMAD_MARKER_START/!p }" replit.md > replit.md.tmp
    # Remove trailing blank lines from preserved content
    sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' replit.md.tmp 2>/dev/null || true

    # Extract content after BMAD end marker (user's own sections)
    AFTER_CONTENT=""
    if grep -q "$BMAD_MARKER_END" replit.md 2>/dev/null; then
      AFTER_CONTENT=$(sed -n "/$BMAD_MARKER_END/,\${ /$BMAD_MARKER_END/!p }" replit.md)
    fi
  else
    # --- Path B: No markers (pre-marker install) — put BMAD section first, old content after ---
    echo "[7/7] Adding marked BMAD section to replit.md (upgrading from pre-marker format)..."
    echo "       Your existing replit.md content will be preserved after the BMAD section."
    echo "       You may want to review and clean up any old routing tables or config blocks."

    # Start fresh — BMAD section goes first, old content goes after the end marker
    echo -n "" > replit.md.tmp

    # Save old content to append after the BMAD section
    AFTER_CONTENT=$(cat replit.md)
  fi

  # Generate fresh BMAD section with inlined routing
  {
    echo ""
    echo ""
    echo "$BMAD_MARKER_START"
    echo "# BMad Method v${NEW_VERSION} -- Agent Configuration"
    echo ""
    echo "## IMPORTANT: How You Must Operate in This Project"
    echo ""
    echo "This is a **BMad Method** project. You MUST follow these rules in every conversation:"
    echo ""
    echo '1. **Check every user message against the routing tables below.** Trigger phrases are not exact-match-only -- use intent matching. If the user'\''s message contains or implies a trigger phrase, activate that route. Example: "should we do sprint planning for Epic 2?" contains the intent "sprint planning" and MUST activate the SP workflow with the Scrum Master persona.'
    echo '2. **When a route matches, load the referenced file and follow it.** Do not answer the question in your own words. Load the workflow or agent file and execute it.'
    echo '3. **For workflows:** First load `_bmad/core/tasks/workflow.xml` (the execution engine), then load the matched workflow file. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.'
    echo "4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu."
    echo '5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.'
    echo '6. **If no route matches,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow.'
    echo '7. **If unsure whether a route matches,** ask: "Would you like me to run the [workflow name] workflow for that?"'
    echo ""
    # Inline full routing table from source file
    sed -n '/^## Agent Routing/,$p' "_bmad/replit-routing.md"
    echo ""
    echo "## Project State"
    echo ""
    echo "- **Current Phase:** $CURRENT_PHASE"
    echo "- **Project Type:** $local_project_type"
    echo "- **Completed Artifacts:** $COMPLETED_ARTIFACTS"
    echo ""
    echo "## BMad File Structure"
    echo ""
    echo '```'
    echo '_bmad/                    # BMad Method toolkit'
    echo '├── core/                 # Core engine (workflow executor, help, brainstorming)'
    echo '│   ├── agents/           # BMad Master agent'
    echo '│   ├── tasks/            # Help, workflow engine, editorial tasks'
    echo '│   └── workflows/        # Brainstorming, party mode, elicitation'
    echo '├── bmm/                  # BMad Methodology Module'
    echo '│   ├── agents/           # 9 specialist agent personas'
    echo '│   ├── workflows/        # All phase workflows (analysis -> implementation)'
    echo '│   ├── data/             # Templates and context files'
    echo '│   └── teams/            # Team configurations for party mode'
    echo '├── _config/              # Manifests, help catalog, customization'
    echo '├── _memory/              # Agent memory (tech writer standards)'
    echo '└── replit-routing.md     # Routing source (auto-inlined into replit.md on install)'
    echo ''
    echo '_bmad-output/             # Generated artifacts go here'
    echo '├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs'
    echo '└── implementation-artifacts/  # Sprint plans, stories, reviews'
    echo '```'
    echo ""
    echo "## BMad Configuration"
    echo ""
    echo '- **BMAD config:** `_bmad/bmm/config.yaml` (skill level, output paths — BMAD-specific settings only)'
    echo '- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)'
    echo '- **Platform values:** User name, project name, and language are resolved automatically from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)'
    echo ""
    echo '**IMPORTANT:** Do NOT embed the contents of BMad config files (config.yaml, etc.) into this replit.md. Only reference them by file path above. Read them from disk when needed.'
    echo "$BMAD_MARKER_END"
  } >> replit.md.tmp

  # Append preserved content after the BMAD section
  if [ -n "$AFTER_CONTENT" ]; then
    echo "$AFTER_CONTENT" >> replit.md.tmp
  fi

  mv replit.md.tmp replit.md
  echo "       Routing table updated in replit.md"
else
  echo "[7/7] Skipping replit.md routing update (preconditions not met)"
fi

# --- Cleanup ---
rm -rf "$TEMP_DIR" "$BACKUP_DIR"

echo ""
echo "=========================================="
echo " Update complete!"
echo "=========================================="
echo ""
echo "  Updated: $CURRENT_VERSION -> $NEW_VERSION"
echo ""
echo "  Your project configuration has been preserved."
echo "  Your planning artifacts in _bmad-output/ are untouched."
echo "  Routing table has been re-inlined into replit.md."
echo ""
echo "  Start a NEW CHAT to pick up the changes."
echo ""
echo "=========================================="
echo ""
