---
project_name: 'Katalyst Growth Planner'
user_name: 'User'
date: '2026-02-19'
sections_completed: ['technology_stack', 'language_rules']
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
