---
project_name: 'Katalyst Growth Planner'
user_name: 'User'
date: '2026-02-19'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality', 'dev_workflow']
existing_patterns_found: 12
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core:**
- TypeScript 5.6.3 — strict mode, ESM (`"type": "module"`), bundler module resolution
- React 18.3 + Vite 7.3 — JSX auto-transform (no explicit React import)
- Express 5.0.1
- PostgreSQL (Neon-backed via Replit)
- Drizzle ORM 0.39.3 + drizzle-zod 0.7.0
- Tailwind CSS 3.4.17 + shadcn/ui (Radix primitives)

**Key Dependencies:**
- Wouter 3.3.5 (routing)
- TanStack React Query 5.60.5 (server state) — **v5 object-form only**: `useQuery({ queryKey })`, no array shorthand
- React Hook Form 7.55 + @hookform/resolvers (forms)
- Zod 3.24.2 (validation)
- Passport 0.7.0 + Google OAuth + Local strategy (auth)
- express-session + connect-pg-simple (sessions)
- Recharts 2.15 (charts), Framer Motion 11.13 (animation)
- React Resizable Panels 2.1 (split-screen layouts)
- Lucide React (icons), React Icons (brand logos)
- Vitest + Playwright (testing)

**Version Constraints:**
- TanStack Query v5 — object-form only for `useQuery`, `useMutation`, etc.
- Express 5 — different API surface from Express 4 (route params, error handling)
- Drizzle array columns: must use `text().array()` method, not `array(text())` wrapper

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript strict mode** — all strict checks active, `noEmit: true` (type-checking only)
- **ESM throughout** — `import`/`export` only, no `require()`
- **Path aliases:** `@/*` → `client/src/*`, `@shared/*` → `shared/*`, `@assets` → `attached_assets/`
- **`shared/` boundary rule:** Code in `shared/` runs in both Node.js and browser — no server-only APIs (fs, crypto), no DOM APIs
- **Currency: cents as integers** (15000 = $150.00). **Percentages: decimals** (0.065 = 6.5%). Never mix.
- **Two financial input interfaces:** `PlanFinancialInputs` (wrapped with `FinancialFieldValue` metadata, for persistence/UI) vs. `FinancialInputs` (raw numbers with 5-year tuples, for engine computation). Never pass wrapped inputs directly to engine — unwrapping transformation is required.
- **JSONB type safety:** `.$type<T>()` on Drizzle JSONB columns is a compile-time assertion only. Runtime validation must happen at API boundaries using matching Zod schemas (e.g., `planFinancialInputsSchema`).
- **`getEffectiveUser(req)`** — always use this in routes, never `req.user` directly, because impersonation swaps identity.
- **QueryKey convention:** Use array segments `['/api/plans', planId]` for hierarchical keys. The default fetcher joins them with `/`. Never use template literals in queryKey — it breaks cache invalidation.
- **Mutations:** Use `apiRequest(method, url, data)` from `@/lib/queryClient`. Always invalidate relevant queryKey arrays after success.
- **Storage interface returns `undefined`** for not-found — routes must handle with explicit checks and 404 responses.
- **Frontend env vars:** `import.meta.env.VITE_*` only, never `process.env` on client.

### Framework-Specific Rules

**Backend Architecture:**
- **Three-tier separation:** Routes (validation + auth + delegation) → Services (business logic orchestration) → Storage (data access). Business logic belongs in `server/services/`, never in route handlers.
- **API response envelope:** Plan-related endpoints wrap responses in `{ data: T }`. Client hooks extract via `.data?.data`.
- **Auth middleware stack:** `requireAuth` checks authentication. `requireRole()` checks **real** user role (not effective user). `getEffectiveUser(req)` resolves acting identity (demo > impersonated > real). These are distinct concerns — don't conflate.
- **Impersonation chain:** demo user > impersonated user > req.user. 60-minute timeout on impersonation. Cached per-request on `req._effectiveUser`.
- **Optimistic concurrency:** Plan updates send `_expectedUpdatedAt` for conflict detection. Server returns 409 on stale writes.

**Frontend Architecture:**
- **Query key factories:** Use existing factory functions (`planKey(id)`, `planOutputsKey(id)`) — don't construct keys inline. When adding new queries, create a factory function following the same pattern.
- **Auto-save pipeline:** Plan modifications go through `usePlanAutoSave.queueSave()` — never call `updatePlan` directly. It handles debounce (2s), optimistic updates, conflict detection (409), and retry (3x with backoff).
- **Field editing:** `useFieldEditing` hook handles all value conversion (cents ↔ display dollars, decimal ↔ display percent). Uses `updateFieldValue()` from `@shared/plan-initialization` to stamp `source` and `lastModifiedAt`. Don't build parallel edit logic.
- **`staleTime: Infinity`** on queries — data never auto-refetches. All freshness is managed via explicit `invalidateQueries` after mutations.
- **Shadcn Sidebar** — always use `@/components/ui/sidebar` primitives. Never reimplement custom sidebars.
- **Wouter routing** — `Link` or `useLocation` for navigation. `ProtectedRoute` for auth-required pages, `AdminRoute` for admin-only pages.

### Testing Rules

**Test Infrastructure:**
- **Vitest** for unit/integration tests. **Playwright** for E2E browser tests. No React component tests (deliberate — UI is tested via Playwright).
- Vitest scope: `shared/**/*.test.ts`, `server/**/*.test.ts`, `client/src/lib/**/*.test.ts`. Don't add test files outside these paths.
- `globals: false` — always `import { describe, it, expect, vi, beforeEach } from "vitest"` explicitly.
- Playwright config: `e2e/` directory, `.spec.ts` suffix, baseURL `http://localhost:5000`.

**Route Test Pattern (mock-based):**
- `vi.mock('../storage')` and `vi.mock('../services/...')` at file top, **before** imports of mocked modules.
- Build isolated Express app via `createApp(user)` pattern — injects fake user via middleware, mounts router under test.
- Use `supertest` for HTTP assertions: `request(app).get('/api/plans').expect(200)`.
- Use `createMockUser()` from `test-helpers.ts` for user factories. Use local helper factories like `makeFieldValue()` for domain objects.

**Financial Engine Tests:**
- Pure deterministic tests — engine runs once at describe scope, assertions check individual outputs.
- Reference data from known-good spreadsheet (PostNet). Any engine changes must validate against reference values.
- All currency in cents, all percentages as decimals in test fixtures.

**E2E Test Pattern (Playwright):**
- Authenticate via `request.post("/api/auth/dev-login")` in `beforeEach`.
- Create test data (brands, plans) via API calls with unique names using `Date.now()` for isolation.
- Navigate with `page.goto()`, assert with `data-testid` selectors.
- **Every interactive or meaningful display element must have a `data-testid`** — this is a project-wide requirement, not just a test concern.

### Code Quality & Style Rules

**Currency Conversion Boundary (Critical):**
- `BrandParameters` = dollars (raw numbers). Everything else (plan inputs, engine, display) = cents (integers).
- Conversion in `plan-initialization.ts`: `dollarsToCents()` uses `Math.round(dollars * 100)`. Always use `Math.round()` to avoid floating-point drift.
- Display formatting via `formatCents()` from `@/lib/format-currency.ts`. Parsing via `parseDollarsToCents()`. Never rewrite these.

**Utility Reuse:**
- Currency: `@/lib/format-currency.ts` (`formatCents`, `parseDollarsToCents`)
- Field display/parse: `@/lib/field-metadata.ts` (`formatFieldValue`, `parseFieldInput`, `FIELD_METADATA`)
- Guardian indicators: `@/lib/guardian-engine.ts`
- Plan initialization/unwrapping: `@shared/plan-initialization.ts` (`buildPlanFinancialInputs`, `unwrapForEngine`, `updateFieldValue`, `resetFieldToDefault`)
- Structured logging: `server/services/structured-logger.ts` (`logStructured` — JSON to stderr)

**File Organization:**
- kebab-case for most files. PascalCase only for React context files (`DemoModeContext.tsx`).
- Consistent naming across layers: route (`plans.ts`) → hook (`use-plan.ts`) → key factory (`planKey()`) → service (`financial-service.ts`).
- DB columns: snake_case in SQL, camelCase in TypeScript (Drizzle auto-maps).

**Context Provider Pattern:**
- `createContext<T>` with typed interface and defaults → `Provider` with `useState` + `useCallback` → `useXxx()` consumer hook. Follow `WorkspaceViewContext.tsx` as template.

**Documentation:**
- Self-documenting naming preferred. Minimal comments.
- Module-level docstrings: purpose, conventions, currency/percentage rules.
- JSDoc on exported interfaces and key functions only. No comments on obvious code.
- Section separators: `// ─── Section Name ──────────` in larger files.
- Test names reference requirements: `"Determinism (FR9, NFR15)"`.

**`data-testid` Convention:**
- Interactive elements: `{action}-{target}` (e.g., `button-dev-login`, `mode-switcher-forms`)
- Display elements: `{type}-{description}` (e.g., `planning-workspace`, `text-username`)
- Dynamic lists: append unique ID (`card-product-${id}`)

### Development Workflow Rules

**Server Architecture:**
- Single port (5000) serves both API and frontend. No separate frontend server.
- Dev: Vite middleware on Express (`server/vite.ts`). Prod: `serveStatic` serves built assets.
- `server/index.ts` — app bootstrap only. **NEVER register routes here.**
- `server/vite.ts`, `vite.config.ts`, `drizzle.config.ts` — **NEVER modify.**

**Route Registration Pattern:**
1. Create router file in `server/routes/` (kebab-case, matching resource name).
2. Import in `server/routes.ts`.
3. Mount with `app.use("/api/<resource>", router)`.
- All routes are under `/api/`. Never register routes directly in `server/index.ts`.

**Schema Change Workflow (strict order):**
1. Define tables in `shared/schema.ts` with insert schemas + types.
2. Update `IStorage` interface in `server/storage.ts`.
3. Implement in `DatabaseStorage` class in `server/storage.ts`.
4. Run `npm run db:push` to sync schema.
- Never put raw SQL in routes. Always go through the storage interface.

**Auth & Identity:**
- `getEffectiveUser(req)` — **always use this**, never read `req.user` directly. Priority: demo user → impersonated user → authenticated user. Cached per-request.
- Dev mode: when `GOOGLE_CLIENT_ID` is unset, `POST /api/auth/dev-login` is available.
- Sessions: PostgreSQL-backed (`connect-pg-simple`, auto-creates table). Sessions store both auth AND operational state (`impersonating_user_id`, `demo_mode_user_id`, `demo_mode_brand_id`).

**Environment Variables:**
- Server: `process.env.*` (DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).
- Client: `import.meta.env.VITE_*` — must have `VITE_` prefix or Vite won't expose it.
- `SESSION_SECRET` defaults to `'dev-secret-change-me'` in development.

**Build Pipeline:**
- `script/build.ts`: esbuild bundles server to `dist/index.cjs`. Uses allowlist pattern — listed deps are bundled for cold-start performance, others stay external.
- When adding a new server dependency that should be bundled, add to allowlist in `script/build.ts`.
