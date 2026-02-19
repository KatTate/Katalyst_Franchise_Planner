---
project_name: 'Katalyst Growth Planner'
user_name: 'User'
date: '2026-02-19'
sections_completed: ['technology_stack']
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
