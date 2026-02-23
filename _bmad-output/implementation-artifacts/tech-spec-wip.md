---
title: 'Dashboard Enrichment — Completeness, Document Preview, and Empty State'
slug: 'dashboard-enrichment'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['React 18', 'TypeScript', 'TanStack Query v5', 'shadcn/ui', 'Express 5', 'PostgreSQL']
files_to_modify: ['client/src/pages/dashboard.tsx', 'server/routes/plans.ts']
code_patterns: ['TanStack Query v5 object-form', 'existing component reuse', 'data-testid convention']
test_patterns: ['Playwright E2E', 'data-testid selectors']
---

# Tech-Spec: Dashboard Enrichment — Completeness, Document Preview, and Empty State

**Created:** 2026-02-23

## Overview

### Problem Statement

The Dashboard is a bare plan list with no visual feedback on plan progress, no document preview, and generic empty-state copy. Returning users (especially Sam persona) have no "home base" showing how their plan is progressing or what their lender document looks like.

### Solution

Enrich the Dashboard by (1) adding completeness progress bars to every plan card using the existing `PlanCompletenessBar` component, (2) adding the existing `DocumentPreviewWidget` for each plan, and (3) updating the empty-state copy to warmer brand-voice language per the UX spec.

### Scope

**In Scope:**
- B.1: Plan completeness on every plan card (reuse existing `PlanCompletenessBar`)
- B.2: Document preview widget on Dashboard (reuse existing `DocumentPreviewWidget` as-is)
- B.3: Dashboard empty state copy update
- API enrichment: Dashboard needs full plan data (`financialInputs`, `startupCosts`) — currently only gets lightweight summaries

**Out of Scope:**
- New checkmark/BD visual style (sticking with existing progress bar style)
- Custom/slimmed-down document preview widget
- PDF generation functionality (button exists but shows "coming soon" toast)

## Context for Development

### Codebase Patterns

{codebase_patterns}

### Files to Reference

| File | Purpose |
| ---- | ------- |

{files_table}

### Technical Decisions

{technical_decisions}

## Acceptance Criteria

{acceptance_criteria}

## Implementation Guidance

### Architecture Patterns to Follow

{architecture_patterns}

### Anti-Patterns and Constraints

{anti_patterns}

### File Change Summary

{file_change_summary}

### Dependencies

{dependencies}

### Testing Guidance

{testing_guidance}

### Notes

{notes}
