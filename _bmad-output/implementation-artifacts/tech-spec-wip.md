---
title: 'Demo Data Seed Script — All Brands, Personas, and Plan Statuses'
slug: 'demo-data-seed-script'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['TypeScript', 'PostgreSQL', 'Drizzle ORM', 'tsx']
files_to_modify: ['script/seed-demo-data.ts']
code_patterns: ['buildPlanFinancialInputs', 'buildPlanStartupCosts', 'IStorage', 'DatabaseStorage']
test_patterns: []
---

# Tech-Spec: Demo Data Seed Script — All Brands, Personas, and Plan Statuses

**Created:** 2026-02-23

## Overview

### Problem Statement

The application has no demo data loaded. For a convincing demo, the platform needs all four reference brands (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) configured with realistic financial parameters and startup cost templates, plus franchisee users for each brand representing all three persona types (Sam/Story, Chris/Normal, Maria/Expert). Each franchisee should have multiple plans spanning all plan statuses (`draft`, `in_progress`, `completed`) and pipeline stages (`planning`, `site_evaluation`, `financing`, `construction`, `open`) to populate the franchisor pipeline dashboard and demonstrate the full platform experience.

### Solution

Create a standalone TypeScript seed script (`script/seed-demo-data.ts`) that:
1. Creates all 4 brands with complete brand parameters and startup cost templates derived from reference spreadsheet data
2. Creates 4-5 franchisees per brand with varied persona tiers (`planning_assistant`, `forms`, `quick_entry`)
3. Creates multiple plans per franchisee with realistic financial inputs (via `buildPlanFinancialInputs`) and varied statuses/pipeline stages
4. Is idempotent — safe to re-run, skipping existing data based on unique identifiers (brand slugs, user emails)

### Scope

**In Scope:**
- 4 brands: PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix
- Brand parameters (revenue, operating costs, financing, startup capital) from PRD reference data
- Startup cost templates per brand (realistic line items)
- 4-5 franchisees per brand representing all 3 persona tiers
- Multiple plans per franchisee covering all plan statuses and pipeline stages
- Realistic financial inputs seeded via `buildPlanFinancialInputs()`
- Startup costs seeded via `buildPlanStartupCosts()`
- Idempotent execution (skip existing, don't duplicate)
- Standalone script executable via `npx tsx script/seed-demo-data.ts`

**Out of Scope:**
- Franchisor users (admin-level users)
- Account manager assignments
- Data sharing consents / pipeline acknowledgments
- What-if scenarios on plans
- Demo mode users (is_demo flag — that's a separate system feature)
- Invitation records
- Any UI changes

## Context for Development

### Codebase Patterns

- Brand parameters follow `BrandParameters` type from `shared/schema.ts` — currency stored as dollars (raw numbers), percentages as decimals
- Plan financial inputs created via `buildPlanFinancialInputs(brandParams)` from `shared/plan-initialization.ts` — handles dollar→cents conversion
- Startup costs created via `buildPlanStartupCosts(template)` from `shared/plan-initialization.ts`
- Storage interface (`IStorage`) in `server/storage.ts` provides `createBrand`, `createUser`, `createPlan`, `updatePlan`
- Users have `preferredTier` field: `'planning_assistant'` | `'forms'` | `'quick_entry'`
- Plans have `status`: `'draft'` | `'in_progress'` | `'completed'` and `pipelineStage`: `'planning'` | `'site_evaluation'` | `'financing'` | `'construction'` | `'open'`
- Existing `script/build.ts` shows the pattern for standalone scripts

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/schema.ts` | Brand, User, Plan table definitions and types |
| `shared/plan-initialization.ts` | `buildPlanFinancialInputs()`, `buildPlanStartupCosts()` |
| `server/storage.ts` | `IStorage` interface, `DatabaseStorage` implementation |
| `_bmad-output/planning-artifacts/prd.md` | Reference brand parameter values (lines 57-123) |
| `script/build.ts` | Pattern for standalone scripts |

### Technical Decisions

- Script uses direct Drizzle ORM queries (not the storage interface) since it runs standalone outside the Express server
- Idempotency via slug/email uniqueness checks before insert
- Brand parameter values sourced from PRD spreadsheet analysis table
- Franchisee emails follow pattern: `{persona}-{number}@{brand-slug}.demo.katalyst.io`
- Password hashes use bcrypt with a known demo password ("demo123") for easy login during demos
