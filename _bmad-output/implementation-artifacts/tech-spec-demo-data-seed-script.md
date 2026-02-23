---
title: 'Demo Data Seed Script — All Brands, Personas, and Plan Statuses'
slug: 'demo-data-seed-script'
created: '2026-02-23'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['TypeScript 5.6', 'PostgreSQL (Neon)', 'Drizzle ORM 0.39', 'node-postgres (pg)', 'bcrypt', 'tsx']
files_to_modify: ['script/seed-demo-data.ts']
code_patterns: ['buildPlanFinancialInputs', 'buildPlanStartupCosts', 'direct drizzle db queries', 'pg.Pool from DATABASE_URL', 'bcrypt.hash(password, 12)', 'updateFieldValue for user modifications']
test_patterns: ['idempotent re-run verification', 'database record count assertions']
---

# Tech-Spec: Demo Data Seed Script — All Brands, Personas, and Plan Statuses

**Created:** 2026-02-23

## Overview

### Problem Statement

The application has no demo data loaded. For a convincing demo, the platform needs all four reference brands (PostNet, Jeremiah's Italian Ice, Tint World, Ubreakifix) configured with realistic financial parameters and startup cost templates, plus franchisee users for each brand representing all three persona types (Sam/Story, Chris/Normal, Maria/Expert). Each franchisee should have multiple plans spanning all plan statuses and pipeline stages to populate the franchisor pipeline dashboard and demonstrate the full platform experience.

### Solution

Create a standalone TypeScript seed script (`script/seed-demo-data.ts`) that:
1. Creates all 4 brands with complete brand parameters and startup cost templates derived from PRD reference data
2. Creates 4-5 franchisees per brand with memorable persona names and varied tiers
3. Creates 1 franchisor user per brand for pipeline dashboard demonstration
4. Creates multiple plans per franchisee with realistic financial inputs, user-modified values for variety, location-based plan names, and staggered timestamps
5. Is idempotent — safe to re-run, skipping existing data
6. Logs a summary table of all created/skipped records at completion

### Scope

**In Scope:**
- 4 brands with complete `brandParameters` and `startupCostTemplate` JSONB data
- 4-5 franchisees per brand (16-20 total) with varied `preferredTier` values
- 1 franchisor per brand (4 total)
- 2-3 plans per franchisee (32-60 total) covering all statuses and pipeline stages
- Realistic financial data via `buildPlanFinancialInputs()` with some user-modified values
- Startup costs via `buildPlanStartupCosts()`
- Staggered `updatedAt` timestamps for stalled plan detection
- Plan metadata: `targetMarket`, `locationAddress`, `financingStatus`, `quickStartCompleted`
- Idempotent execution with summary logging
- Standalone script: `npx tsx script/seed-demo-data.ts`

**Out of Scope:**
- Account manager assignments / brand_account_managers records
- Data sharing consents / plan acknowledgments
- What-if scenarios on plans
- Demo mode users (`is_demo: true` — separate system feature)
- Invitation records
- Any UI changes

## Context for Development

### Codebase Patterns

**Database Access Pattern:**
- Script creates its own `pg.Pool` + drizzle instance (same pattern as `server/db.ts`)
- Does NOT import from `server/db.ts` to avoid Express server coupling
- All table references imported from `shared/schema` (brands, users, plans)
- Uses `eq()` from `drizzle-orm` for WHERE clauses
- Uses `.returning()` on inserts to get created records with generated IDs

**Brand Parameters (BrandParameters type):**
- Currency as dollars (raw numbers), percentages as decimals (0.05 = 5%)
- Each parameter value is `{ value: number, label: string, description: string }`
- Nested structure: `revenue`, `operating_costs`, `financing`, `startup_capital`

**Plan Seeding (canonical pattern from `server/storage.ts` line 566):**
```typescript
const financialInputs = brand.brandParameters
  ? buildPlanFinancialInputs(brand.brandParameters)
  : null;
const startupCosts = brand.startupCostTemplate
  ? buildPlanStartupCosts(brand.startupCostTemplate)
  : null;
```

**Password Hashing (from `server/routes/invitations.ts` line 178):**
```typescript
const passwordHash = await bcrypt.hash(password, 12);
```

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/schema.ts` | `brands`, `users`, `plans` table definitions; `BrandParameters`, `StartupCostTemplate` types |
| `shared/plan-initialization.ts` | `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `updateFieldValue()` |
| `shared/financial-engine.ts` | `PlanFinancialInputs`, `FinancialFieldValue`, `StartupCostLineItem` types |
| `server/db.ts` | Database connection pattern (pg.Pool + drizzle) |
| `server/storage.ts` line 566 | `createDemoPlan()` — reference for plan seeding with brand defaults |
| `server/routes/invitations.ts` line 178 | `bcrypt.hash(password, 12)` — password hashing pattern |
| `_bmad-output/planning-artifacts/prd.md` lines 57-123 | Reference brand parameter values for all 4 brands |

### Technical Decisions

1. **Direct Drizzle queries** — Own `pg.Pool` + drizzle instance. No server dependency.
2. **Idempotency** — Check by unique keys (slug, email, userId+planName). Skip existing records. Log created vs. skipped.
3. **Brand parameter values** — From PRD spreadsheet analysis (lines 57-123). Dollars and decimal percentages per `BrandParameters` convention.
4. **Memorable names** — Persona-aligned: Sam (first-timer), Chris (scaling), Maria (portfolio), Alex, Jordan. Franchisors: Denise (Jeremiah's per PRD), Marcus (Tint World per PRD), etc.
5. **Demo password** — All users: `bcrypt.hash("demo123", 12)`.
6. **Plan variety** — Different statuses, stages, and some user-modified financials (Chris's COGS at 23%, Maria's ad fund at 0%).
7. **Staggered timestamps** — `updatedAt` spread: today, 3 days ago, 1 week ago, 2 weeks ago, 1 month ago.
8. **Plan metadata** — Completed: `quickStartCompleted: true`, `financingStatus: 'funded'/'approved'`, `locationAddress` filled. Draft: `quickStartCompleted: false`, `financingStatus: null`.
9. **`is_demo: false`** — Seed users are "real" accounts, not system demo accounts.

## Acceptance Criteria

### AC 1: Brand Creation
- **Given** the database has no brands, **when** the script runs, **then** exactly 4 brands are created: PostNet (slug: `postnet`), Jeremiah's Italian Ice (slug: `jeremiahs-italian-ice`), Tint World (slug: `tint-world`), Ubreakifix (slug: `ubreakifix`).
- Each brand has non-null `brandParameters` JSONB matching the `BrandParameters` type with values from the PRD reference data (PostNet: AUV $322,401, COGS 30%, royalty 5%, etc.).
- Each brand has a non-null `startupCostTemplate` JSONB array with at least 5 realistic line items including franchise fee, equipment, leasehold improvements, and working capital categories covering all three `capex_classification` values.

### AC 2: Brand Parameter Accuracy
- **Given** brands are created, **when** querying PostNet's brand parameters, **then** `revenue.monthly_auv.value` = 26867 (i.e., $322,401 / 12 rounded), `operating_costs.cogs_pct.value` = 0.30, `operating_costs.royalty_pct.value` = 0.05, `operating_costs.ad_fund_pct.value` = 0.02, `financing.interest_rate.value` = 0.105, `financing.loan_term_months.value` = 144.
- **Given** brands are created, **when** querying Jeremiah's brand parameters, **then** `revenue.monthly_auv.value` reflects $510,784 annual / 12, `operating_costs.cogs_pct.value` = 0.22, `operating_costs.royalty_pct.value` = 0.06, `operating_costs.ad_fund_pct.value` = 0.045.
- Parameter values for all 4 brands align with the PRD comparison table (lines 57-68).

### AC 3: Franchisee User Creation
- **Given** brands exist, **when** the script runs, **then** each brand has 4-5 franchisee users created with:
  - `role: 'franchisee'`
  - `brandId` referencing the correct brand
  - `isDemo: false`
  - `onboardingCompleted: true`
  - `passwordHash` set (bcrypt hash of "demo123")
  - `preferredTier` distributed across all three values: at least one `planning_assistant`, at least one `forms`, at least one `quick_entry` per brand
  - `displayName` set to a memorable persona name (not generic like "User 1")
  - `email` following pattern `{name}@{brand-slug}.demo.katalyst.io`

### AC 4: Franchisor User Creation
- **Given** brands exist, **when** the script runs, **then** each brand has exactly 1 franchisor user created with:
  - `role: 'franchisor'`
  - `brandId` referencing the correct brand
  - `isDemo: false`
  - `onboardingCompleted: true`
  - `passwordHash` set (bcrypt hash of "demo123")
  - `displayName` set to a memorable name
  - `email` following pattern `{name}@{brand-slug}.demo.katalyst.io`

### AC 5: Plan Creation — Status and Stage Coverage
- **Given** users exist, **when** the script runs, **then** across all plans for each brand:
  - At least one plan with `status: 'draft'`
  - At least one plan with `status: 'in_progress'`
  - At least one plan with `status: 'completed'`
  - At least one plan with each `pipelineStage`: `planning`, `site_evaluation`, `financing`, `construction`, `open`
  - Each franchisee has 2-3 plans

### AC 6: Plan Financial Data
- **Given** plans are created, **when** querying any non-draft plan, **then**:
  - `financialInputs` is non-null and is a valid `PlanFinancialInputs` structure (generated via `buildPlanFinancialInputs`)
  - `startupCosts` is non-null and is a valid array of `StartupCostLineItem` objects (generated via `buildPlanStartupCosts`)
  - At least 3 plans across the entire dataset have user-modified financial values (e.g., `source: 'user_entry'` on at least one field) to demonstrate that not all plans are identical brand defaults
- **Given** plans are created, **when** querying draft plans, **then** `financialInputs` may be null (representing a just-started plan) OR populated with brand defaults.

### AC 7: Plan Metadata Variety
- **Given** plans are created, **then**:
  - Plans with `status: 'completed'` have `quickStartCompleted: true` and `financingStatus` set to `'funded'` or `'approved'`
  - Plans with `status: 'draft'` have `quickStartCompleted: false`
  - At least 5 plans have `locationAddress` populated with realistic street addresses
  - At least 5 plans have `targetMarket` populated (e.g., "suburban residential", "downtown commercial")
  - Plan `name` values are location-based and memorable (e.g., "Main Street Location", "Downtown Flagship", "Mall Kiosk Concept")

### AC 8: Staggered Timestamps
- **Given** plans are created, **then** `updatedAt` values span at least 3 different time periods: some within the last 3 days, some 1-2 weeks ago, some 3-4 weeks ago. This ensures the pipeline dashboard's stalled plan detection produces varied results.

### AC 9: Idempotency
- **Given** the script has already been run once successfully, **when** the script is run again, **then**:
  - No duplicate brands, users, or plans are created
  - Existing records are not modified
  - The script completes without errors
  - The summary log shows all records as "skipped"

### AC 10: Summary Output
- **Given** the script completes (first run or re-run), **then** a formatted summary is printed to stdout showing:
  - Count of brands created vs. skipped
  - Count of users created vs. skipped (broken down by role)
  - Count of plans created vs. skipped
  - Total records affected

### AC 11: Script Execution
- **Given** the database is accessible via `DATABASE_URL`, **when** running `npx tsx script/seed-demo-data.ts`, **then** the script completes successfully within 30 seconds and exits with code 0.
- **Given** `DATABASE_URL` is not set, **when** running the script, **then** it exits with a clear error message.

## Implementation Guidance

### Architecture Patterns to Follow

- **Database connection:** Create a standalone `pg.Pool` + drizzle instance at the top of the script. Close the pool at the end (`pool.end()`). Follow exact pattern from `server/db.ts` but inline in the script file.
- **Data definitions as constants:** Define all brand parameters, startup cost templates, and franchisee definitions as typed constant objects at the top of the file. This makes the data easy to review and modify.
- **Seeding function structure:** Organize as `async function main()` calling sequential helpers: `seedBrands()` → `seedUsers(brandMap)` → `seedPlans(brandMap, userMap)`. Each returns a map of created/found record IDs.
- **Financial input seeding:** Use `buildPlanFinancialInputs(brandParams)` for base inputs, then apply modifications via `updateFieldValue()` for specific plans that should show user-edited values.
- **Startup cost seeding:** Use `buildPlanStartupCosts(template)` — one call per plan, since each generates fresh UUIDs for line item IDs.

### Anti-Patterns and Constraints

- **DO NOT import from `server/db.ts`** — it may pull in Express dependencies. Create own pool.
- **DO NOT import from `server/storage.ts`** — same reason. Use direct Drizzle queries.
- **DO NOT modify `package.json`** — bcrypt and pg are already installed.
- **DO NOT modify any existing files** — this is a new standalone script only.
- **DO NOT use `is_demo: true`** — that flag is reserved for system demo accounts (ST.3 feature).
- **DO NOT hardcode UUIDs for brand/user/plan IDs** — let the database generate them via `gen_random_uuid()`.
- **DO NOT set brand `primaryColor` or `logoUrl`** unless realistic values are available. Null is fine.
- **Currency in BrandParameters is DOLLARS** — do NOT convert to cents. `buildPlanFinancialInputs()` handles the conversion.
- **Percentages in BrandParameters are DECIMALS** — 5% = 0.05, not 5.

### File Change Summary

| Action | File | Description |
| ------ | ---- | ----------- |
| **CREATE** | `script/seed-demo-data.ts` | Standalone seed script with all brand data, user definitions, plan definitions, and idempotent seeding logic |

### Dependencies

- `pg` — already installed (database driver)
- `drizzle-orm` — already installed (ORM)
- `bcrypt` — already installed (password hashing)
- `tsx` — already available via `npx` (TypeScript execution)
- `shared/schema.ts` — table definitions and types (imported via path alias)
- `shared/plan-initialization.ts` — `buildPlanFinancialInputs()`, `buildPlanStartupCosts()`, `updateFieldValue()`

**No new packages needed.**

### Testing Guidance

**Primary verification: Run the script and inspect the database.**

1. **First run:** Execute `npx tsx script/seed-demo-data.ts`. Verify:
   - 4 brands in `brands` table with non-null `brand_parameters` and `startup_cost_template`
   - 20-24 users in `users` table (16-20 franchisees + 4 franchisors), all with `is_demo = false`
   - 32-60 plans in `plans` table with varied statuses and pipeline stages
   - Summary output matches database counts

2. **Idempotency run:** Execute the script again. Verify:
   - No new records created
   - No errors
   - Summary shows all "skipped"

3. **Login verification:** Start the app, attempt login with a seeded user email and password "demo123" via the invitation-based login flow (or dev-login if Google OAuth not configured).

4. **Pipeline dashboard verification:** Log in as a franchisor user and verify the pipeline dashboard shows franchisees with varied statuses, stages, and stalled indicators.

5. **Financial data verification:** Navigate to a seeded franchisee's plan and verify financial statements render with realistic numbers (not zeros or NaN).

### Notes

**High-Risk Items:**
- Brand parameter values must exactly match `BrandParameters` type structure. A missing `label` or `description` field on any parameter object will fail Zod validation when the app reads the data. Every parameter value needs `{ value, label, description }`.
- The PRD reference table only shows summary parameters. Some parameters (e.g., `utilities_monthly`, `insurance_monthly`, `other_monthly`) are not in the comparison table and need reasonable values derived from the `facilities_monthly` total or set to sensible defaults.
- `monthly_auv` in `BrandParameters` is the MONTHLY value, not annual. The PRD shows "Gross Sales / AUV" as $322,401 which is ANNUAL. Divide by 12 for the brand parameter.

**Known Limitations:**
- Seed data does not include data sharing consents, so the franchisor pipeline dashboard will show franchisee names and statuses but not financial details (consent-gated).
- No account manager assignments — the booking link feature won't be visible for seeded users.
- What-if scenarios are not seeded — the scenarios tab will be empty for all plans.

**Future Considerations:**
- A `--reset` flag could be added to wipe and re-create all seed data.
- Consent records could be seeded in a follow-up to fully demonstrate the pipeline financial view.
- The script could be extended to also create a `katalyst_admin` user if none exists.

### Party Mode Insights (2026-02-23)

- **John (PM):** Franchisee and plan names must tell a demo story — memorable characters + location-based plan names
- **Winston (Architect):** Plans need user-modified financial values for pipeline variety; script should log summary table with IDs
- **Quinn (QA):** Plan idempotency via userId+name; stagger updatedAt for stalled detection; vary quickStartCompleted and financingStatus by plan status
