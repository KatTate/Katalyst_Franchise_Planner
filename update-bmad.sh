#!/bin/bash
#
# BMad Method — Replit Update Script
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
echo " BMad Method — Update"
echo "=========================================="
echo ""

# ─── Step 1: Check current installation ──────────────────────────────────
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

echo "[1/6] Current version: $CURRENT_VERSION"

# ─── Step 2: Back up user configuration ──────────────────────────────────
echo "[2/6] Backing up your configuration..."

BACKUP_DIR="/tmp/bmad-config-backup-$$"
mkdir -p "$BACKUP_DIR"

if [ -f "_bmad/core/config.yaml" ]; then
  cp "_bmad/core/config.yaml" "$BACKUP_DIR/core-config.yaml"
  echo "       Saved core config (user name, language)"
fi

if [ -f "_bmad/bmm/config.yaml" ]; then
  cp "_bmad/bmm/config.yaml" "$BACKUP_DIR/bmm-config.yaml"
  echo "       Saved project config (project name, settings)"
fi

# ─── Step 3: Download latest from GitHub ─────────────────────────────────
echo "[3/6] Downloading latest version from GitHub..."

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

# ─── Step 4: Replace _bmad/ folder ───────────────────────────────────────
echo "[4/6] Updating _bmad/ toolkit..."

rm -rf "_bmad"
cp -r "$EXTRACTED_DIR/_bmad" "_bmad"

echo "       Toolkit files replaced"

# ─── Step 5: Restore user configuration ──────────────────────────────────
echo "[5/6] Restoring your configuration..."

if [ -f "$BACKUP_DIR/core-config.yaml" ]; then
  cp "$BACKUP_DIR/core-config.yaml" "_bmad/core/config.yaml"
  echo "       Restored core config"
fi

if [ -f "$BACKUP_DIR/bmm-config.yaml" ]; then
  cp "$BACKUP_DIR/bmm-config.yaml" "_bmad/bmm/config.yaml"
  echo "       Restored project config"
fi

# ─── Step 6: Update support files ────────────────────────────────────────
echo "[6/6] Updating support files..."

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

# ─── Cleanup ─────────────────────────────────────────────────────────────
rm -rf "$TEMP_DIR" "$BACKUP_DIR"

echo ""
echo "=========================================="
echo " Update complete!"
echo "=========================================="
echo ""
echo "  Updated: $CURRENT_VERSION → $NEW_VERSION"
echo ""
echo "  Your project configuration has been preserved."
echo "  Your planning artifacts in _bmad-output/ are untouched."
echo ""
echo "  Start a NEW CHAT to pick up the changes."
echo ""
echo "=========================================="
echo ""
