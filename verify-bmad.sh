#!/bin/bash
echo "=== BMad Method v6.0.0-Beta.7 — Replit Verification ==="
echo ""

echo "1. Checking .cursor directory removed..."
if [ -d ".cursor" ]; then echo "  FAIL: .cursor still exists"; else echo "  OK: .cursor removed"; fi

echo "2. Checking replit.md exists..."
if [ -f "replit.md" ]; then echo "  OK: replit.md exists ($(wc -l < replit.md) lines)"; else echo "  FAIL: replit.md missing"; fi

echo "3. Checking routing table exists..."
if [ -f "_bmad/replit-routing.md" ]; then echo "  OK: replit-routing.md exists"; else echo "  FAIL: replit-routing.md missing"; fi

echo "4. Checking manifest IDE setting..."
IDE=$(grep -A1 "^ides:" _bmad/_config/manifest.yaml | tail -1 | tr -d ' -')
if [ "$IDE" = "replit" ]; then echo "  OK: IDE set to replit"; else echo "  FAIL: IDE is '$IDE'"; fi

echo "5. Checking for remaining slash command references in agents..."
SLASH_COUNT=$(grep -rn '/bmad-help' _bmad/core/agents/ _bmad/bmm/agents/ 2>/dev/null | wc -l)
if [ "$SLASH_COUNT" -eq 0 ]; then echo "  OK: No /bmad-help references in agent files"; else echo "  WARN: $SLASH_COUNT references found"; fi

echo "6. Checking agent files exist..."
AGENTS=("_bmad/core/agents/bmad-master.md" "_bmad/bmm/agents/analyst.md" "_bmad/bmm/agents/architect.md" "_bmad/bmm/agents/dev.md" "_bmad/bmm/agents/pm.md" "_bmad/bmm/agents/qa.md" "_bmad/bmm/agents/quick-flow-solo-dev.md" "_bmad/bmm/agents/sm.md" "_bmad/bmm/agents/tech-writer/tech-writer.md" "_bmad/bmm/agents/ux-designer.md")
MISSING=0
for agent in "${AGENTS[@]}"; do
  if [ ! -f "$agent" ]; then echo "  FAIL: Missing $agent"; MISSING=$((MISSING+1)); fi
done
if [ "$MISSING" -eq 0 ]; then echo "  OK: All 10 agent files present"; fi

echo "7. Checking output directories..."
if [ -d "_bmad-output/planning-artifacts" ] && [ -d "_bmad-output/implementation-artifacts" ]; then
  echo "  OK: Output directories exist"
else
  echo "  WARN: Output directories missing"
fi

echo "8. Checking help.md updated..."
if grep -q "say \*\*'create PRD'\*\*" _bmad/core/tasks/help.md 2>/dev/null; then
  echo "  OK: help.md uses natural language display rules"
else
  echo "  WARN: help.md may still have slash command display rules"
fi

echo ""
echo "=== Verification Complete ==="
echo "The BMad Method toolkit is ready. Start a new chat and say:"
echo '  "start BMad" — to initialize and get oriented'
echo '  "what should I do next?" — for guidance'
echo '  "act as PM" — to work on product requirements'
