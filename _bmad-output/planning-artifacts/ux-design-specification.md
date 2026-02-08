---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-workspace-2026-02-08.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - attached_assets/THEME_VALUES_(1)_1770580912929.md
  - attached_assets/DesignTheme_1770580912930.tsx
  - attached_assets/PostNet_-_Business_Plan_1770511701987.xlsx
  - attached_assets/Pasted-Persona-A-First-Time-Franchisee-Sam-The-New-Owner-Snaps_1770523428988.txt
date: 2026-02-08
author: User
project_name: Katalyst Growth Planner
---

# UX Design Specification — Katalyst Growth Planner

**Author:** User
**Date:** 2026-02-08

---

## Executive Summary

### Project Vision

The Katalyst Growth Planner is a franchise location planning platform that transforms the overwhelming process of opening a new franchise location into a guided, empowering journey. It serves three stakeholders from a single data layer (the "throuple problem"): the franchisee as primary user and plan author, the franchisor as pipeline visibility buyer, and Katalyst as operational intelligence beneficiary.

The UX must accomplish something unusual: make a complex financial planning tool feel approachable to a first-time business owner while simultaneously satisfying a 27-location veteran who wants speed and no hand-holding. Three experience tiers (Story Mode, Normal Mode, Expert Mode) solve this by presenting three fundamentally different interaction paradigms that all write to the same underlying financial input state.

### White-Label Theming Strategy

**Approach: Branded Shell with Prominent Katalyst Identity**

The platform uses a "branded shell" approach that leans more toward Katalyst visibility than a pure white-label:

- **Katalyst owns:** Design system foundation (Montserrat/Roboto typography, spacing scale, component patterns, color governance, interaction patterns, data visualization style). The structural "feel" of the product is unmistakably Katalyst across all brand deployments.
- **Brand owns:** Primary accent color (replaces Katalyst Green in interactive elements), logo in the header, brand name in contextual copy (e.g., "PostNet benchmarks"), startup cost template categories.
- **Shared space:** Login/onboarding carries the brand identity prominently with a clear "Powered by Katalyst" mark. The sidebar, footer, and "about" sections maintain Katalyst branding. Katalyst's design system personality (rounded cards, 2px borders, the "Gurple" info pattern, segmented controls, warm neutrals) is constant — a multi-unit franchisee working across brands will immediately recognize "this is a Katalyst tool" even though it's branded for PostNet vs. Jeremiah's.
- **Strategic rationale:** Multi-unit franchisees who cross brand boundaries are the organic evangelism channel. The UX must be similar enough across brand deployments that they recognize the platform, while different enough (brand accent, logo, brand-specific copy) that the franchisor feels ownership.

### Target Users

**Persona A: Sam (First-Time Franchisee) — Story Mode**
- Age 30-45, former corporate manager, purchased first franchise unit
- Excited but anxious, overwhelmed by FDD and financial complexity
- Needs structure, education at every step, confidence to walk into a bank
- Tech-competent but new to franchising mechanics
- Will use the product with their Katalyst account manager in guided sessions

**Persona B: Maria (Portfolio Operator) — Expert Mode**
- Age 40-60, owns 7+ locations, financially sophisticated
- Pragmatic, speed-focused, intolerant of wasted time
- Expects spreadsheet-level input speed and portfolio-level visibility
- Will rip through a plan in 15 minutes, doesn't want tooltips or education

**Persona C: Chris (Scaling Operator) — Normal Mode**
- Age 30-50, has 1-3 locations, learning to systematize
- Ambitious and stretched, confident but nervous about replication
- Needs the ability to compare against prior location actuals
- Wants education available on demand, not forced

**Secondary:** Katalyst account managers (brand setup, client guidance), franchisor development teams (pipeline dashboards), Katalyst admins (cross-brand intelligence).

### Key Design Challenges

1. **Three interaction paradigms, one engine** — Story Mode (AI conversation + live dashboard), Normal Mode (section-based forms), Expert Mode (spreadsheet grid) must feel like coherent products sharing a design language, not three different apps bolted together. The transition between modes should feel like changing a "view" on the same data, not switching products.

2. **Financial complexity without intimidation** — The tool produces lender-grade financial packages (P&L, cash flow, balance sheet, break-even). Sam needs to feel empowered by this, not overwhelmed. Progressive disclosure is essential: summary for confidence, detail for due diligence, education for understanding.

3. **Per-field metadata density** — Every financial input carries brand defaults, Item 7 ranges, source attribution, reset capability, and tier-dependent explanations. This is a lot of information to present without visual overload, especially in Normal/Expert modes where many fields are visible simultaneously.

4. **Split-screen responsive stacking** — Story Mode's core UX is a split screen: AI conversation on the left, live financial dashboard on the right. This must stack/tab below 1024px without losing the connection between conversation and live-updating numbers.

5. **White-label theming with Katalyst identity** — The brand accent color system must be implemented via CSS custom properties so the entire product re-themes dynamically per brand, while the Katalyst design system (component shapes, typography, spacing, interaction patterns) remains constant.

6. **Auto-save trust signals** — Multi-session planning over weeks/months requires absolute confidence that work is never lost. The save state must be visible, unambiguous, and ever-present without being distracting.

### Design Opportunities

1. **The "Confidence Pack" emotional arc** — Sam's journey from anxious kitchen-table confusion to walking into a bank feeling prepared is a designable emotional arc. The UX can deliberately move from warm, supportive onboarding to increasingly professional-looking outputs, mirroring Sam's growing confidence.

2. **AI conversation as natural data collection** — Story Mode's conversational interface lets Sam describe their situation in natural language while the system extracts structured financial inputs behind the scenes. This is a fundamentally better data collection UX than forms for first-time users — they tell their story, and the plan materializes.

3. **Estimated vs. actual as engagement hook** — Post-opening, franchisees update estimates with actuals. This turns a one-time planning tool into a living operational dashboard and creates the return engagement that proves product value (60%+ target).

4. **Katalyst design system as competitive moat** — The consistent design language across brand deployments (warm neutrals, the "Gurple" info pattern, Montserrat headers, rounded 2px-bordered cards) becomes recognizable. When Maria opens a Tint World instance after using Ubreakifix, the immediate familiarity says "I know this tool, I trust this tool."
