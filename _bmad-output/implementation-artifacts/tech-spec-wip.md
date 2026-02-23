---
title: 'Demo Data Seed Script — All Brands, Personas, and Plan Statuses'
slug: 'demo-data-seed-script'
created: '2026-02-23'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack: ['TypeScript 5.6', 'PostgreSQL (Neon)', 'Drizzle ORM 0.39', 'node-postgres (pg)', 'bcrypt', 'tsx']
files_to_modify: ['script/seed-demo-data.ts']
code_patterns: ['buildPlanFinancialInputs', 'buildPlanStartupCosts', 'direct drizzle db queries', 'pg.Pool from DATABASE_URL', 'bcrypt.hash(password, 12)', 'updateFieldValue for user modifications']
test_patterns: ['idempotent re-run verification']
---

# Tech-Spec: Demo Data Seed Script — All Brands, Personas, and Plan Statuses

**Created:** 2026-02-23

## Overview

### Problem Statement

The application has no demo data loaded. For a convincing demo, the platform needs all four reference brands (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) configured with realistic financial parameters and startup cost templates, plus franchisee users for each brand representing all three persona types (Sam/Story, Chris/Normal, Maria/Expert). Each franchisee should have multiple plans spanning all plan statuses (`draft`, `in_progress`, `completed`) and pipeline stages (`planning`, `site_evaluation`, `financing`, `construction`, `open`) to populate the franchisor pipeline dashboard and demonstrate the full platform experience.

### Solution

Create a standalone TypeScript seed script (`script/seed-demo-data.ts`) that:
1. Creates all 4 brands with complete brand parameters and startup cost templates derived from reference spreadsheet data
2. Creates 4-5 franchisees per brand with memorable persona names and varied persona tiers
3. Creates 1 franchisor user per brand for pipeline dashboard demonstration
4. Creates multiple plans per franchisee with realistic financial inputs, user-modified values for variety, location-based plan names, and staggered timestamps
5. Is idempotent — safe to re-run, skipping existing data based on unique identifiers
6. Logs a summary table of all created/skipped records at completion

### Scope

**In Scope:**
- 4 brands: PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix with complete brand parameters and startup cost templates
- 4-5 franchisees per brand with persona tier distribution (planning_assistant, forms, quick_entry) and memorable character names
- 1 franchisor user per brand for pipeline dashboard demos
- Multiple plans per franchisee (2-3 each) covering all statuses (draft, in_progress, completed) and pipeline stages (planning, site_evaluation, financing, construction, open)
- Realistic financial inputs seeded via `buildPlanFinancialInputs()` with user-modified values on some plans for variety
- Startup costs seeded via `buildPlanStartupCosts()`
- Location-based plan names (e.g., "Main Street Location", "Downtown Flagship")
- Plan metadata: `targetMarket`, `locationAddress`, `financingStatus`, `quickStartCompleted` varied by plan status
- Staggered `updatedAt` timestamps for stalled plan detection demo
- Idempotent execution (skip existing, don't duplicate) with plan check by userId + name combo
- Summary table output at script completion
- Standalone script executable via `npx tsx script/seed-demo-data.ts`

**Out of Scope:**
- Account manager assignments / brand account manager records
- Data sharing consents / pipeline acknowledgments
- What-if scenarios on plans
- Demo mode users (is_demo flag — separate system feature, already implemented)
- Invitation records
- Any UI changes

## Context for Development

### Codebase Patterns

**Database Access Pattern:**
- The script will NOT use the storage interface (`IStorage`) because that requires the Express server context
- Instead, use direct Drizzle ORM queries via `server/db.ts` pattern: import `pg.Pool` with `DATABASE_URL`, create drizzle instance with `drizzle(pool, { schema })`
- All table references imported from `@shared/schema`

**Brand Parameters:**
- `BrandParameters` type from `shared/schema.ts` — currency as dollars (raw numbers), percentages as decimals (0.05 = 5%)
- Contains: `revenue` (monthly_auv, growth rates, starting AUV %), `operating_costs` (cogs_pct, labor_pct, rent_monthly, utilities_monthly, insurance_monthly, marketing_pct, royalty_pct, ad_fund_pct, other_monthly), `financing` (loan_amount, interest_rate, loan_term_months, down_payment_pct), `startup_capital` (working_capital_months, depreciation_years)
- Each parameter value is `{ value: number, label: string, description: string }`

**Startup Cost Templates:**
- `StartupCostTemplate` = array of `StartupCostItem` objects
- Each item: `{ id, name, default_amount (dollars), capex_classification, item7_range_low, item7_range_high, sort_order }`
- `capex_classification`: `"capex"` | `"non_capex"` | `"working_capital"`

**Plan Financial Inputs:**
- Created via `buildPlanFinancialInputs(brandParams)` from `shared/plan-initialization.ts`
- Handles dollar→cents conversion automatically
- Returns `PlanFinancialInputs` with wrapped `FinancialFieldValue` metadata per field

**Plan Startup Costs:**
- Created via `buildPlanStartupCosts(template)` from `shared/plan-initialization.ts`
- Handles dollar→cents conversion automatically

**User Schema:**
- `users` table: `email` (unique), `role` ('franchisee' | 'franchisor' | 'katalyst_admin'), `brandId`, `displayName`, `passwordHash`, `onboardingCompleted`, `preferredTier` ('planning_assistant' | 'forms' | 'quick_entry'), `isDemo` (false for seed data)
- Password hashing: `bcrypt.hash(password, 12)` — salt rounds = 12, matching `server/routes/invitations.ts`

**Plan Schema:**
- `plans` table: `userId`, `brandId`, `name`, `status` ('draft' | 'in_progress' | 'completed'), `pipelineStage` ('planning' | 'site_evaluation' | 'financing' | 'construction' | 'open'), `financialInputs` (JSONB), `startupCosts` (JSONB), `quickStartCompleted`, `targetMarket`, `targetOpenQuarter`, `locationAddress`, `financingStatus`, `updatedAt`

**Idempotency:**
- Check brand existence via `brands.slug` (unique column)
- Check user existence via `users.email` (unique column)
- If brand exists, skip brand creation but use existing brand ID for downstream records
- If user exists, skip user creation but use existing user ID for plan creation
- Plan check via `userId + name` combo — skip if plan with same name exists for that user

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/schema.ts` | Brand, User, Plan table definitions, BrandParameters type, StartupCostItem type |
| `shared/plan-initialization.ts` | `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `updateFieldValue()` |
| `shared/financial-engine.ts` | `PlanFinancialInputs`, `FinancialFieldValue`, `StartupCostLineItem` types |
| `server/db.ts` | Database connection pattern (pg.Pool + drizzle) |
| `server/storage.ts` | `createDemoPlan()` pattern at line 566 — reference for how plans are seeded |
| `server/routes/invitations.ts` | `bcrypt.hash(password, 12)` — password hashing pattern |
| `_bmad-output/planning-artifacts/prd.md` lines 57-123 | Reference brand parameter values for all 4 brands |
| `script/build.ts` | Pattern for standalone TypeScript scripts |

### Technical Decisions

1. **Direct Drizzle queries** — Script creates its own `pg.Pool` and drizzle instance (same pattern as `server/db.ts`). Does NOT import from `server/db.ts` to avoid Express server dependencies.
2. **Idempotency** — Check by unique keys (slug, email, userId+planName) before insert. Skip existing records. Log what was created vs. skipped.
3. **Brand parameter values** — Sourced from PRD spreadsheet analysis table (lines 57-123). Values stored as dollars and decimal percentages per `BrandParameters` type convention.
4. **Memorable franchisee names** — Persona-inspired names: Sam (first-timer), Chris (scaling operator), Maria (portfolio operator), plus additional personas like "Alex" and "Jordan" for variety. Plan names are location-based ("Main Street Location", "Downtown Flagship", "Mall Kiosk Concept").
5. **Password** — All demo users get `bcrypt.hash("demo123", 12)` for easy demo login.
6. **Plan variety** — Each franchisee gets 2-3 plans with different statuses, pipeline stages, and some user-modified financial values (e.g., Chris adjusting COGS to 23%, Maria dropping ad fund to 0%).
7. **Franchisor users** — One franchisor per brand (e.g., "Marcus" for Tint World, "Denise" for Jeremiah's per PRD) to enable pipeline dashboard demonstration.
8. **No `is_demo` flag** — These are "real" seed users, not system demo accounts. `is_demo = false` (default).
9. **Staggered timestamps** — `updatedAt` values spread across recent weeks: some plans updated today, some 1 week ago, some 3 weeks ago. This makes the stalled plan detection on the pipeline dashboard actually functional during demos.
10. **Plan metadata completeness** — Completed plans: `quickStartCompleted: true`, `financingStatus: 'funded'` or `'approved'`, `locationAddress` populated. Draft plans: `quickStartCompleted: false`, `financingStatus: null`. In-progress plans: mixed values.
11. **Summary log** — Script prints a formatted summary table at completion: brands created/skipped, users created/skipped, plans created/skipped, with IDs.

### Party Mode Insights (2026-02-23)

- **John (PM):** Franchisee and plan names must tell a demo story — memorable characters + location-based plan names
- **Winston (Architect):** Plans need user-modified financial values for pipeline variety; script should log summary table with IDs
- **Quinn (QA):** Plan idempotency via userId+name; stagger updatedAt for stalled detection; vary quickStartCompleted and financingStatus by plan status
