---
title: 'Plan Confirmation Model & Franchisee Plan Settings'
slug: 'plan-confirmation-and-settings'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['React 18.3', 'TypeScript 5.6', 'Tailwind CSS 3.4', 'shadcn/ui (Radix)', 'Wouter 3.3', 'TanStack Query v5', 'Lucide React', 'Express 5', 'Drizzle ORM 0.39', 'PostgreSQL']
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: Plan Confirmation Model & Franchisee Plan Settings

**Created:** 2026-02-23

## Overview

### Problem Statement

Two related gaps prevent franchisees from communicating their plan readiness and franchise journey status:

1. **Completeness tracking measures the wrong thing.** The plan progress bars track "fields customized" (source !== brand_default), penalizing franchisees who accept correct brand defaults. A franchisee whose royalty, ad fund, and other brand-set numbers are already correct shows 0% progress. The document preview DRAFT watermark persists even when the plan is genuinely ready. The right metric is "fields the franchisee has reviewed and committed to" — regardless of whether they changed the value.

2. **No franchisee UI for plan settings.** The `pipelineStage`, `targetMarket`, and `targetOpenQuarter` database columns exist but have no franchisee-facing UI. The franchisor Pipeline Dashboard reads `pipelineStage` but every franchisee is stuck at "Planning" because there's no input mechanism. Franchisees have no way to communicate milestones (financing approved, site found, on track to open) or provide location details.

### Solution

**Feature A — Field Confirmation Model:** Add a `confirmed` boolean to `FinancialFieldValue`. Completeness is driven by confirmed fields, not edited fields. Confirmation and editing are always separate explicit actions. A pulsing lock icon nudges users to confirm after editing. Forms view supports per-field confirmation. Reports view supports section-level batch confirmation (v1). Royalty and marketing % (almost always brand defaults) serve as a built-in tutorial for the confirmation pattern.

**Feature B — Plan Settings:** Add a "My Status" section to the existing Plan Settings workspace view exposing: pipeline stage (dropdown), target opening date (month/year precision), market area (text), location address (new DB field), and financing status (new DB field). Market and address are connected — market is known early, specific address comes later. Add a dashboard plan card CTA ("Update") that navigates franchisees to Plan Settings for discoverability.

### Scope

**In Scope:**
- `confirmed` field on `FinancialFieldValue` interface and Zod schema (default `false`)
- Migration strategy for existing data (`confirmed: false` for all existing fields)
- Updated completeness engine: `isConfirmed()` replaces `isEdited()` as the driver
- Forms view: per-field confirm/lock action with pulsing lock icon nudge after editing
- Reports view: section-level batch confirmation accessible from progress bar (v1)
- Progress bar UI reframed: "fields confirmed" instead of "fields customized"
- Document preview DRAFT watermark driven by confirmed-field completeness
- Plan Settings UI in workspace settings: pipeline stage dropdown, target opening date (month/year), market area (text), location address (new column), financing status (new column or JSONB)
- New DB columns for location address and financing status
- Dashboard plan card CTA: "Update" button with tooltip "Need to update the status or details of your plan?" linking to Plan Settings
- Royalty/marketing % confirmation as built-in tutorial flow for teaching the lock-in pattern
- Schema additions and `db:push` for new columns

**Out of Scope:**
- Inline cell-level lock toggles on individual cells in Reports view (future enhancement)
- Auto-inference of pipeline stage from data patterns
- Franchisor-side changes to Pipeline Dashboard (already reads `pipelineStage`)
- Changes to the financial engine or calculation logic
- Changes to the What-If Scenario system
- Notifications or alerts when pipeline stage changes

## Context for Development

### Codebase Patterns

{codebase_patterns — to be filled in Step 2}

### Files to Reference

| File | Purpose |
| ---- | ------- |

{files_table — to be filled in Step 2}

### Technical Decisions

- Confirmation and editing are always separate explicit actions — editing does NOT auto-confirm
- A pulsing lock icon after editing provides a subtle nudge to confirm
- Target opening date uses month/year precision (not just quarter) — existing `targetOpenQuarter` column may need replacement or renaming
- Market area and location address are connected but separate fields — market is known early, address comes later
- Section-level batch confirmation in Reports (v1) — inline cell locks deferred
- Brand default fields that haven't been touched start as `confirmed: false`

## Acceptance Criteria

{acceptance_criteria — to be filled in Step 3}

## Implementation Guidance

### Architecture Patterns to Follow

{architecture_patterns — to be filled in Step 3}

### Anti-Patterns and Constraints

{anti_patterns — to be filled in Step 3}

### File Change Summary

{file_change_summary — to be filled in Step 3}

### Dependencies

{dependencies — to be filled in Step 3}

### Testing Guidance

{testing_guidance — to be filled in Step 3}

### Notes

{notes — to be filled in Step 3}
