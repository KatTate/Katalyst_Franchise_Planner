#!/bin/bash
#
# BMad Method — Replit Update Script
#
# Downloads the latest BMad toolkit from GitHub and updates the _bmad/ folder
# and skills while preserving your project-specific configuration.
#
# Usage: bash update-bmad.sh
#
# Source: https://github.com/KatTate/Bmad-for-Replit
#

set -e

GITHUB_REPO="KatTate/Bmad-for-Replit"
GITHUB_RAW_URL="https://raw.githubusercontent.com/$GITHUB_REPO/main"
GITHUB_URL="https://github.com/$GITHUB_REPO/archive/refs/heads/main.tar.gz"
TEMP_DIR="/tmp/bmad-update-$$"
EXTRACTED_DIR="$TEMP_DIR/Bmad-for-Replit-main"

# --- Self-bootstrap: always run the latest update script from GitHub ---
# This ensures that even old/buggy local copies get replaced before running.
# The BMAD_BOOTSTRAPPED env var prevents infinite loops.
# Downloads to a temp file to avoid variable quoting issues with special chars.
if [ -z "$BMAD_BOOTSTRAPPED" ]; then
  if curl -sL -o "update-bmad.sh.tmp" "$GITHUB_RAW_URL/update-bmad.sh" 2>/dev/null; then
    if grep -q "BMad Method" "update-bmad.sh.tmp" 2>/dev/null; then
      mv "update-bmad.sh.tmp" "update-bmad.sh"
      BMAD_BOOTSTRAPPED=1 exec bash "update-bmad.sh"
    fi
    rm -f "update-bmad.sh.tmp"
  fi
fi

echo ""
echo "=========================================="
echo " BMad Method — Update"
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

echo "[1/8] Current version: $CURRENT_VERSION"

# --- Step 2: Back up user configuration ---
echo "[2/8] Backing up your configuration..."

BACKUP_DIR="/tmp/bmad-config-backup-$$"
mkdir -p "$BACKUP_DIR"

if [ -f "_bmad/bmm/config.yaml" ]; then
  cp "_bmad/bmm/config.yaml" "$BACKUP_DIR/bmm-config.yaml"
  echo "       Saved BMAD config (skill level, output paths)"
fi

# --- Step 3: Download latest from GitHub ---
echo "[3/8] Downloading latest version from GitHub..."

mkdir -p "$TEMP_DIR"

if ! curl -sL -o "$TEMP_DIR/bmad-latest.tar.gz" "$GITHUB_URL"; then
  echo "ERROR: Failed to download from GitHub."
  echo "Check your internet connection and that the repo is accessible:"
  echo "  $GITHUB_URL"
  rm -rf "$TEMP_DIR" "$BACKUP_DIR"
  exit 1
fi

if ! tar -xzf "$TEMP_DIR/bmad-latest.tar.gz" -C "$TEMP_DIR"; then
  echo "ERROR: Failed to extract the download."
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
echo "[4/8] Updating _bmad/ toolkit..."

rm -rf "_bmad"
cp -r "$EXTRACTED_DIR/_bmad" "_bmad"

echo "       Toolkit files replaced"

# --- Step 5: Restore user configuration ---
echo "[5/8] Restoring your configuration..."

if [ -f "$BACKUP_DIR/bmm-config.yaml" ]; then
  cp "$BACKUP_DIR/bmm-config.yaml" "_bmad/bmm/config.yaml"
  echo "       Restored BMAD config"
fi

# --- Step 6: Update skills ---
SKILLS_UPDATED=0

if [ -d "$EXTRACTED_DIR/.agents/skills" ]; then
  mkdir -p .agents/skills

  for skill_dir in "$EXTRACTED_DIR"/.agents/skills/bmad-*/; do
    if [ -d "$skill_dir" ]; then
      skill_name=$(basename "$skill_dir")
      rm -rf ".agents/skills/$skill_name"
      cp -r "$skill_dir" ".agents/skills/$skill_name"
      SKILLS_UPDATED=$((SKILLS_UPDATED + 1))
    fi
  done

  echo "[6/8] Updated $SKILLS_UPDATED BMAD skills"
else
  if [ -d ".agents/skills/bmad-core" ]; then
    echo "[6/8] No skills in update archive — existing skills preserved"
  else
    echo "[6/8] WARNING: No skills found in update or locally!"
    echo "       BMAD uses skills-only activation. Without skills, workflows"
    echo "       will NOT activate. Re-download from the BMad repo."
  fi
fi

# --- Step 7: Update support files ---
echo "[7/8] Updating support files..."

if [ -f "$EXTRACTED_DIR/update-bmad.sh" ]; then
  echo "       Update script (handled by bootstrap)"
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

# --- Step 8: Update replit.md BMAD awareness section ---
BMAD_MARKER_START="<!-- BMAD-METHOD-START -->"
BMAD_MARKER_END_TAG="<!-- BMAD-METHOD-END -->"

if [ -f "replit.md" ]; then

  CURRENT_PHASE=$(grep -oP '(?<=\*\*Current Phase:\*\* ).*' replit.md 2>/dev/null || echo "not started")
  COMPLETED_ARTIFACTS=$(grep -oP '(?<=\*\*Completed Artifacts:\*\* ).*' replit.md 2>/dev/null || echo "none yet")

  if grep -q "$BMAD_MARKER_START" replit.md 2>/dev/null; then
    echo "[8/8] Updating BMAD awareness section in replit.md..."

    # Extract pre-marker content, stripping old protection notes to avoid duplication
    sed -n "1,/$BMAD_MARKER_START/{ /$BMAD_MARKER_START/!p }" replit.md > replit.md.before
    grep -v "PROTECTION NOTE FOR REPLIT AGENT" replit.md.before > replit.md.tmp 2>/dev/null || echo -n "" > replit.md.tmp
    rm -f replit.md.before
    sed -i -e :a -e '/^\n*$/{$d;N;ba' -e '}' replit.md.tmp 2>/dev/null || true

    AFTER_CONTENT=""
    if grep -q "$BMAD_MARKER_END_TAG" replit.md 2>/dev/null; then
      AFTER_CONTENT=$(sed -n "/$BMAD_MARKER_END_TAG/,\${ /$BMAD_MARKER_END_TAG/!p }" replit.md)
    fi
  else
    echo "[8/8] Adding BMAD awareness section to replit.md (upgrading from pre-marker format)..."
    echo "       Your existing replit.md content will be preserved after the BMAD section."

    echo -n "" > replit.md.tmp
    AFTER_CONTENT=$(cat replit.md)
  fi

  {
    echo ""
    echo ""
    echo '<!-- PROTECTION NOTE FOR REPLIT AGENT: The content between BMAD-METHOD-START and BMAD-METHOD-END markers is part of the BMad Method framework and MUST NOT be modified, overwritten, or removed during any replit.md updates. When updating this file, only modify the "Project Documentation" section AFTER the BMAD-METHOD-END marker. Always preserve both sections intact. -->'
    echo ""
    echo "$BMAD_MARKER_START"
    echo "# BMad Method v${NEW_VERSION} — Agent Configuration"
    echo ""
    echo "## IMPORTANT: How You Must Operate in This Project"
    echo ""
    echo "This is a **BMad Method** project. BMAD workflows are activated through **Replit Agent Skills** installed in \`.agents/skills/bmad-*/\`. You MUST follow these rules in every conversation:"
    echo ""
    echo '1. **BMAD skills handle workflow activation.** When a user'\''s message matches a BMAD skill trigger (e.g., "create PRD", "code review", "party mode"), the skill will activate and provide instructions for loading the correct workflow files. Follow those instructions exactly.'
    echo '2. **When a skill activates, load the referenced files and follow them.** Do not answer in your own words. Load the workflow or agent file specified in the skill and execute it.'
    echo '3. **For workflows:** The skill will instruct you to either load `_bmad/core/tasks/workflow.xml` (the execution engine) with a workflow YAML config, or load a workflow markdown file directly. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.'
    echo "4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu."
    echo '5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.'
    echo '6. **If no skill activates,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow. Say "help" or "BH" anytime for guidance.'
    echo '7. **If unsure whether a BMAD workflow applies,** ask: "Would you like me to run the [workflow name] workflow for that?"'
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
    echo '│   ├── workflows/        # All phase workflows (analysis → implementation)'
    echo '│   ├── data/             # Templates and context files'
    echo '│   └── teams/            # Team configurations for party mode'
    echo '├── _config/              # Manifests, help catalog, customization'
    echo '└── _memory/              # Agent memory (tech writer standards)'
    echo ''
    echo '.agents/skills/bmad-*/    # Replit Agent Skills (workflow activation)'
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
    echo "$BMAD_MARKER_END_TAG"
  } >> replit.md.tmp

  if [ -n "$AFTER_CONTENT" ]; then
    echo "$AFTER_CONTENT" >> replit.md.tmp
  else
    {
      echo ""
      echo "## Project Documentation"
      echo ""
      echo "> This section is safe for the Replit agent to update. Add project-specific information below."
      echo ""
      echo "### Project State"
      echo ""
      echo "- **Current Phase:** $CURRENT_PHASE"
      echo "- **Project Type:** unknown"
      echo "- **Completed Artifacts:** $COMPLETED_ARTIFACTS"
      echo ""
    } >> replit.md.tmp
  fi

  mv replit.md.tmp replit.md
  echo "       BMAD awareness section updated in replit.md"
else
  echo "[8/8] No replit.md found — run install-bmad.sh to create one"
fi

# --- Summary ---
echo ""
echo "=========================================="
echo " Update complete!"
echo "=========================================="
echo ""
echo "  Updated: $CURRENT_VERSION -> $NEW_VERSION"
echo ""
echo "  Your project configuration has been preserved."
echo "  Your planning artifacts in _bmad-output/ are untouched."
if [ "$SKILLS_UPDATED" -gt 0 ]; then
  echo "  $SKILLS_UPDATED BMAD skills updated."
fi
echo "  BMAD awareness section updated in replit.md."
echo ""
echo "  Start a NEW CHAT to pick up the changes."
echo ""
echo "=========================================="
echo ""

# --- Cleanup ---
rm -rf "$TEMP_DIR" "$BACKUP_DIR"
