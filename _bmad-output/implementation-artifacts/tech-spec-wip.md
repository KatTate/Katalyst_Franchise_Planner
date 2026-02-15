---
title: 'Dev Role Switcher — One-Click Dev Login by Role'
slug: 'dev-role-switcher'
created: '2026-02-15'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['React', 'Express', 'PostgreSQL', 'Passport.js', 'Drizzle ORM']
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: Dev Role Switcher — One-Click Dev Login by Role

**Created:** 2026-02-15

## Overview

### Problem Statement

During development, there's no quick way to log in as a franchisee or franchisor user. The only dev login creates a katalyst_admin, and testing other roles requires multiple steps (admin login → navigate to brand → enter demo mode). There's no franchisor dev login path at all.

### Solution

Add role-specific dev login buttons directly on the login page (Franchisee, Franchisor, and the existing Admin). Each creates/reuses a synthetic dev user for that role, tied to a brand. Auto-picks the first available brand by default but allows selecting a specific brand from a dropdown.

### Scope

**In Scope:**
- Dev login buttons on the login page for Franchisee and Franchisor roles (alongside existing Admin)
- Backend endpoints to create/reuse synthetic dev users per role + brand
- Brand selector dropdown (auto-picks first brand, overridable)
- Only available when Google OAuth is not configured (same guard as current dev login)

**Out of Scope:**
- Dev toolbar/role-switcher panel
- Changes to the existing Demo Mode or Impersonation systems
- Any production auth changes
- Franchisor-specific pages/features (just the login-as mechanism)

## Context for Development

### Codebase Patterns

- Dev mode guard: `!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET`
- Existing dev login at `POST /api/auth/dev-login` creates/upserts `dev@katgroupinc.com` as katalyst_admin
- Demo mode already creates synthetic users via `storage.createDemoUser()` — similar pattern to follow
- Session user shape: `{ id, email, role, brandId, displayName, profileImageUrl, onboardingCompleted, preferredTier }`

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `server/routes/auth.ts` | Current dev-login endpoint, auth routes |
| `client/src/pages/login.tsx` | Login page UI with dev login button |
| `server/middleware/auth.ts` | Auth middleware, role checking |
| `server/storage.ts` | Storage interface, user CRUD |
| `shared/schema.ts` | User schema, roles |

### Technical Decisions

- Reuse the same dev mode guard pattern (no Google OAuth configured)
- Create synthetic dev users similar to demo mode pattern
- Brand-scoped: franchisee and franchisor dev users are tied to a brand

## Acceptance Criteria

(To be filled in Step 3)

## Implementation Guidance

### Architecture Patterns to Follow

(To be filled in Step 3)

### Anti-Patterns and Constraints

(To be filled in Step 3)

### File Change Summary

(To be filled in Step 3)

### Dependencies

(To be filled in Step 3)

### Testing Guidance

(To be filled in Step 3)

### Notes

(To be filled in Step 3)
