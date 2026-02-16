---
title: 'UI Navigation Alignment — Sidebar Restructure & Plan Layout'
slug: 'ui-navigation-alignment'
created: '2026-02-16'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: []
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: UI Navigation Alignment — Sidebar Restructure & Plan Layout

**Created:** 2026-02-16

## Overview

### Problem Statement

The current sidebar navigation and My Plan workspace layout diverge from the v3 UX financial statements spec (two-door architecture). The sidebar labels, section grouping, and item placement don't match the spec — missing destinations (Scenarios, Settings), misplaced elements (booking link in footer instead of Help section), and generic labels ("Plan" instead of the active plan name). The My Plan workspace uses a split-panel layout (InputPanel | DashboardPanel) that doesn't match the v3 spec's single-column form workspace with summary metrics at top.

### Solution

Restructure the sidebar to match the v3 UX spec's navigation model. Collapse the My Plan split-panel layout into a single-column view: summary metrics bar at top, collapsible form sections below. Add placeholder destinations for Scenarios and Settings. Move the booking link into a proper Help section group.

### Scope

**In Scope:**
- Sidebar restructure: section grouping (MY LOCATIONS, [Active Plan Name], HELP)
- Plan section label shows active plan name instead of generic "Plan"
- Add "Scenarios" sidebar item with placeholder page/view
- Add "Settings" sidebar item with placeholder page/view
- Move "Talk to [Manager Name]" from footer into a HELP section group
- My Plan layout: collapse split-panel into single-column (summary metrics bar at top, forms below)
- Summary metric cards move from DashboardPanel into the top of the My Plan forms view
- Dashboard charts (break-even, revenue vs expenses) remain accessible via Reports; removed from My Plan
- Label corrections throughout

**Out of Scope:**
- Mode-switcher code cleanup / ExperienceTier state removal (deferred)
- Impact Strip (Story 5.9)
- Guardian Bar (Story 5.8)
- Inline editing in Reports (Story 5.6)
- Actual Scenarios content (Story 5.7)
- Actual Settings content (future story)
- Glossary/Help content (Story 5.10)

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
