# Established Project Assessment: Katalyst Growth Planner

**Date:** 2026-02-19
**Assessed by:** BMad Method v6.0.0-Beta.8

---

## Replit Environment

| Resource | Status | Details |
|---|---|---|
| Server/Workflow | Active | Express + Vite dev server via `npm run dev` on port 5000 |
| Database | Provisioned (secrets exist) | PostgreSQL with 7 tables: brands, users, invitations, plans, brand_account_managers, brand_validation_runs, impersonation_audit_logs |
| Environment Variables | Configured | ADMIN_EMAIL, SESSION_SECRET, DATABASE_URL, PG* vars. Google OAuth secrets not present. |
| Deployment | Not deployed | No deployment configuration detected |

## Technology Stack

### Languages & Runtimes

| Technology | Version | Role |
|---|---|---|
| TypeScript | 5.6.3 | Primary language (frontend + backend + shared) |
| Node.js | — | Runtime |

### Frameworks & Libraries

| Package | Version | Purpose |
|---|---|---|
| React | 18.3.1 | Frontend UI |
| Express | 5.0.1 | Backend API server |
| Drizzle ORM | 0.39.3 | Database ORM |
| Passport.js | 0.7.0 | Authentication (Google OAuth + Local) |
| TanStack React Query | 5.60.5 | Data fetching/caching |
| TanStack React Table | 8.21.3 | Table/grid component (Quick Entry) |
| Shadcn/ui (Radix) | Multiple | UI component library |
| Tailwind CSS | 3.4.17 | Styling |
| Recharts | 2.15.2 | Charts/visualizations |
| wouter | 3.3.5 | Client-side routing |
| Zod | 3.24.2 | Schema validation |
| Vite | 7.3.0 | Build tool / dev server |

### Development Tools

| Tool | Configuration | Notes |
|---|---|---|
| Vitest | 4.0.18 | Unit testing |
| Playwright | 1.58.2 | E2E testing (20 spec files) |
| drizzle-kit | 0.31.8 | Database migrations |
| tsx | 4.20.5 | TypeScript execution |

## Project Structure

```
workspace/
├── client/
│   ├── src/
│   │   ├── App.tsx                    # Router, layout, auth guards
│   │   ├── components/
│   │   │   ├── ui/                    # 40+ Shadcn primitives
│   │   │   ├── planning/             # ~15 planning workspace components
│   │   │   │   └── statements/        # ~15 financial statement tab components
│   │   │   ├── brand/                 # 5 brand admin components
│   │   │   └── shared/                # 6 shared components
│   │   ├── contexts/                  # Impersonation, DemoMode, WorkspaceView
│   │   ├── hooks/                     # 8 custom hooks (auth, plan, brand-theme, etc.)
│   │   ├── lib/                       # Utilities (queryClient, field-metadata, engines)
│   │   └── pages/                     # 9 page components
│   └── public/
├── server/
│   ├── routes/                        # 9 route modules
│   ├── services/                      # financial-service, brand-validation, logger
│   ├── middleware/                     # auth, rbac
│   ├── auth.ts                        # Passport strategies
│   ├── storage.ts                     # Database access layer
│   └── routes.ts                      # Route registration + session setup
├── shared/
│   ├── schema.ts                      # Drizzle schema + Zod validators
│   ├── financial-engine.ts            # Pure TS financial computation engine
│   ├── plan-initialization.ts         # Plan setup logic
│   └── help-content/                  # Glossary and field help data
├── e2e/                               # 20 Playwright test files
└── _bmad-output/                      # BMAD artifacts
    ├── planning-artifacts/            # Brief, PRD, Architecture, UX Spec, Epics
    └── implementation-artifacts/      # 40+ story docs, sprint status, retrospectives
```

## Architecture Patterns

### Code Organization
- Clear frontend/backend/shared separation
- Modular route handlers in `server/routes/`
- Feature-organized frontend components (planning/, brand/, shared/)
- Shared financial engine and schema between client and server

### Data Flow
- REST API (`/api/*` endpoints)
- TanStack React Query for client-side data fetching/caching
- JSONB columns for financial inputs, startup costs, projections
- Auto-save mechanism for plan data

### Authentication
- Dual auth: Google OAuth for Katalyst admins (@katgroupinc.com), local password for franchisees
- PostgreSQL-backed sessions (connect-pg-simple, 24h expiry)
- Invitation-based account creation for franchisees

### API Patterns
- RESTful with 9 route modules
- Zod validation at API boundaries
- Role-based middleware (requireAuth, requireRole, scopeToUser)

## Current State Assessment

### Working Features
- User confirmed: product vision is correct, direction is intact
- Authentication system (Google OAuth + local + invitations)
- Brand configuration and management
- Financial engine core computations
- Basic planning workspace structure
- Admin support tools (impersonation, demo mode)

### Partial / In-Progress Features
- Epic 5: Financial Statement Views (stories 5.1–5.10, most done/review but user reports issues)
- Quick Entry mode (built but user reports UI concerns)
- Planning workspace UI (user reports duplicate/incomplete UI from rogue agents)

### Known Issues
- **User reported:** Some features are broken, half-finished, or wrong
- **User reported:** Execution went "squirrely" due to rogue agents producing incomplete or duplicate UI
- **User reported:** Good quality code but leading to wrong UI experience and incorrect financial outputs
- **User reported:** Needs cleanup before building new features on top
- 2 LSP errors in shared/schema.ts (circular type inference, minor)
- Story 5.5 code review: 3 HIGH findings documented but not fixed

### Code Quality Signals

| Signal | Assessment | Evidence |
|---|---|---|
| Tests | Moderate coverage | 20 e2e test files, unit tests for financial engine and services |
| Error Handling | Consistent | Zod validation, try/catch patterns, error middleware |
| Documentation | Extensive BMAD artifacts | PRD (94KB), Architecture (112KB), UX Spec (79KB), Epics (130KB) |
| Consistency | Good code patterns | TypeScript throughout, consistent module structure |

## Assumption Validation (User Confirmed)

| Assumption | Agent's Initial Assessment | User's Response |
|---|---|---|
| What this project is | Franchise financial planning tool | Confirmed — "That's what it intends to be" |
| Features are complete/working | ~30+ stories appear implemented | "Some of them are broken, half finished, and wrong" |
| Project direction | Full-featured planning platform | "Still the vision, but execution got squirrely due to rogue agents and incomplete or duplicate UI" |
| What's missing | Epics 6-12 in backlog | "Urgently need those finished, but don't want to build on top of current stuff that isn't right" |
| Code quality matches experience | Solid code quality | "Good quality code that's leading to the wrong UI experience or not producing the right financial outputs isn't the goal" |
| Why using BMad now | — | "Figure how to get some stuff cleaned up so that we can get moving forward quickly. Rogue agents don't build remotely close to what I want or need them to." |

## BMAD Phase Mapping

*(Populated in Step 2)*

## Recommended Path

*(Populated in Step 2)*

## Notes & Caveats

- Database secrets exist but database was not provisioned during this assessment session
- Google OAuth credentials not present in env vars — Google login won't work without them
- User's primary concern is UI/UX correctness and financial output accuracy, not code quality per se
- The extensive BMAD documentation (PRD, Architecture, UX Spec) exists but execution diverged from it — this is the core problem
