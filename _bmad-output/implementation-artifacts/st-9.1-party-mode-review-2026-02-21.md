# BMAD Party Mode Review — Story 9.1: LLM Integration & Conversation API

**Review Method:** BMAD Party Mode (Classic)
**Date:** 2026-02-21
**Agents Assembled:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev)
**Story File:** `_bmad-output/implementation-artifacts/9-1-llm-integration-conversation-api.md`
**Story Status:** ready-for-dev

---

## Overall Verdict: APPROVED FOR DEVELOPMENT

Story 9.1 is architecturally sound, well-scoped, and implementation-ready. The API-only boundary is cleanly enforced (no client routes), the SSE streaming pattern is appropriate for MVP, and all 8 acceptance criteria trace to PRD functional requirements and architecture decisions. All five agents approved the story with non-blocking recommendations.

---

## Agent Reviews

### 📋 John (PM) — Product Alignment

**Verdict: PASS**

WHY does this story exist? Because a franchisee sitting at their kitchen table at 10pm needs a conversational way to build their financial projections — and right now we've got zero LLM infrastructure. Story 9.1 lays the pipes. Let's verify those pipes connect to real user value.

FR/NFR traceability confirmed across all 8 acceptance criteria:

| AC | FR/NFR Coverage | Status |
|----|----------------|--------|
| AC-1 — POST endpoint streams SSE tokens, returns extracted values | FR50, FR51, NFR22 | Covered |
| AC-2 — GET endpoint retrieves conversation history | FR50, FR53 | Covered |
| AC-3 — System prompt includes brand parameters, Item 7 ranges, plan state, FTC framing | FR53 | Covered |
| AC-4 — Financial value extraction with confidence levels, range validation, auto-apply only high confidence | FR51, FR52, NFR23 | Covered |
| AC-5 — Conversation persistence and token tracking | FR50 (data retention) | Covered |
| AC-6 — Authorization and data isolation via requireAuth + getEffectiveUser | NFR9, NFR10 | Covered |
| AC-7 — Graceful degradation when LLM unavailable | FR54, NFR24 | Covered |
| AC-8 — Database schema for ai_conversations table | Architecture Decision 14 | Covered |

**Scope boundary with Stories 9.2/9.3:** Correctly excludes client-side UI (Story 9.2 handles the slide-in panel) and user confirmation of tentative values (Story 9.3). The anti-pattern "DO NOT add new URL routes to the React client" enforces this boundary cleanly.

**Business value:** This is the foundational infrastructure story for the entire AI Planning Advisor epic. Without it, Stories 9.2-9.5 have nothing to talk to. The three-tier confidence system (high/tentative/uncertain) is the critical differentiator — it builds franchisee trust by letting the AI suggest without overstepping.

**One concern I want to flag:** AC-4 says high-confidence values are "applied to the plan's financial_inputs" automatically. That's correct per the architecture, but it's a bold product decision — auto-writing values to someone's financial plan. The FTC framing in AC-3 and the `source: "ai_populated"` attribution mitigate this. I'm satisfied, but the dev should treat this code path with extra care.

---

### 🏗️ Winston (Architect) — Technical Design

**Verdict: PASS**

Architecture alignment confirmed across all critical technical patterns:

1. **SSE Streaming Pattern** — `POST /api/plans/:planId/conversation` returns `text/event-stream` with `{ type: "token", content }` events and a final `{ type: "done", fullResponse, extractedValues, updatedOutputs }` event. Matches Architecture Decision 7 exactly. The `X-Accel-Buffering: no` header in the gotchas section shows awareness of proxy buffering issues. Good.

2. **LLM Proxy Architecture** — Server-side only. API key never exposed to client. Matches Architecture Decision 14's server-side proxy pattern. The anti-pattern "DO NOT call the LLM from the client" is explicit and correct.

3. **Data Model** — Single `ai_conversations` row per plan with JSONB `messages` array. Matches architecture.md:384-387 exactly. The anti-pattern against separate table per turn is correct — JSONB array keeps queries simple for MVP. At scale, this may need migration to a normalized messages table, but that's a Phase 2 concern.

4. **Storage Pattern** — `getConversation(planId)` and `upsertConversation(planId, messages, tokensUsed)` follow the existing IStorage/DatabaseStorage CRUD pattern. The upsert semantics (create-or-update) are appropriate since each plan has at most one conversation record.

5. **Value Extraction Strategy** — Dev notes recommend tool use / function calling over JSON-in-response. I agree. Tool calling is the most reliable extraction pattern across all major LLM providers. The Vercel AI SDK recommendation provides provider abstraction, though reusing the existing Gemini SDK would reduce dependency surface.

6. **Financial Value Conversion** — Gotcha #1 correctly identifies the cents/decimal conversion requirement (dollars × 100, percent ÷ 100). This is a critical data integrity concern. The extraction logic MUST include this conversion or values will be off by orders of magnitude.

**Technical concerns (non-blocking):**

- **Concurrent write race condition (Gotcha #6):** The story acknowledges this and accepts load-append-save for MVP. Acceptable, but the upsertConversation implementation should use a database transaction to at least ensure atomicity of the read-modify-write cycle.
- **Token context window management:** AC-3 limits to most recent N messages (default 20). The service should count tokens, not just messages, since a single message could consume a disproportionate share of the context window. For MVP, message count is acceptable.
- **LLM SDK choice:** Story offers three paths (Vercel AI SDK, Anthropic SDK, or reuse Gemini). I'd recommend the developer choose based on which API key is actually configured in the environment. No need to install a new SDK if the Gemini key is already working.

---

### 🎨 Sally (UX) — User Experience

**Verdict: PASS**

Now, I know what you're thinking — "Sally, this is an API-only story, there's no UX here." But let me paint you a picture of the user experience this API *creates*, because the design decisions in this backend directly shape what the franchisee will feel.

1. **Streaming Response (AC-1)** — SSE token streaming means the franchisee sees the AI "thinking" in real-time, word by word. This is dramatically better than a loading spinner followed by a wall of text. The psychological effect is like watching someone write a letter to you — it builds engagement and trust. The `type: "token"` / `type: "done"` event structure gives the client (Story 9.2) exactly what it needs for a typing-indicator UX.

2. **Conversation History (AC-2)** — Returning chronologically ordered messages with timestamps means the franchisee can leave and come back without losing context. That kitchen-table-at-10pm user John mentioned? They might close the laptop and reopen it tomorrow morning. Conversation persistence is empathy in code.

3. **Confidence Levels (AC-4)** — The three-tier confidence system (high/tentative/uncertain) is brilliant for franchisee trust. "High" values slide into the plan silently (with visual attribution — Story 9.2). "Tentative" values need a thumbs-up. "Uncertain" values are just suggestions. This respects the franchisee's sense of ownership over their projections.

4. **FTC Compliance Framing (AC-3)** — The system prompt instructs the AI to be an advisor, not a prescriber. "Help them explore their own assumptions." This is the UX equivalent of a supportive financial planner who asks great questions rather than handing you a spreadsheet. The tone is everything for user comfort in a financial planning tool.

5. **Graceful Degradation (AC-7)** — When the AI goes down, the error message is warm and actionable: "Continue using My Plan forms or Reports." No dead end, no panic. The franchisee always has a path forward.

**UX recommendations (non-blocking):**

- The `extractedValues` array in the done event should include human-readable labels (not just field paths like "operatingCosts.rentMonthly"). Story 9.2 will need display-friendly names. Consider adding a `label` field to the extraction output.
- The error event message is good but could be softer: "AI advisor is temporarily unavailable" might alarm some users. Consider "Your AI advisor needs a moment — you can keep building your plan using the forms below." But this is a Story 9.2 concern.

---

### 🏃 Bob (SM) — Story Quality & Dev Readiness

**Verdict: PASS — ready-for-dev confirmed**

| Criterion | Status |
|-----------|--------|
| Clear user story statement | PASS — Developer persona, server-side LLM proxy, two FR references |
| 8 testable acceptance criteria | PASS — Each AC has Given/When/Then with specific assertions |
| Comprehensive dev notes | PASS — Architecture patterns, anti-patterns, gotchas, references |
| File change summary (6 files, action + notes) | PASS |
| Anti-patterns documented (7 hard constraints) | PASS |
| Gotchas documented (10 integration warnings) | PASS |
| Dependencies identified (packages + env vars) | PASS |
| Testing expectations defined | PASS — Unit, integration, framework specified |
| Scope boundary with adjacent stories explicit | PASS — "API-only. Client-side UI is Story 9.2 scope." |
| Source document references (15 references) | PASS — All verified against actual documents |

**Story sizing:** Medium-large. 6 files touched (2 new, 4 modified), SSE streaming implementation, LLM API integration, financial value extraction and validation. Appropriately scoped as a single story because the SSE endpoint, service layer, and database schema are all interdependent — splitting them would create incomplete vertical slices.

**One checklist item I want to highlight:** The testing expectations mention unit tests for ai-service.ts including "cents conversion" and "range warnings." These are critical path tests. If the extraction logic doesn't convert $4,200 to 420000, the financial engine will produce projections that are 100x too small. I'd recommend the dev write these conversion tests first as a TDD guardrail.

---

### 💻 Amelia (Dev) — Implementation Feasibility

**Verdict: PASS — implementable as specified**

All 6 files reviewed against existing codebase. Integration points accurate. Dependencies verified.

**Recommended implementation order:**

1. `shared/schema.ts` — Add `aiConversations` pgTable definition, insert schema, TypeScript types
2. `server/storage.ts` — Add `getConversation(planId)` and `upsertConversation()` to IStorage + DatabaseStorage
3. `npx drizzle-kit push` — Apply schema to database
4. `server/services/ai-service.ts` — CREATE: System prompt builder, LLM client wrapper, streaming handler, value extractor, range validator
5. `server/routes/ai.ts` — CREATE: Express Router with `POST /:planId/conversation` (SSE) and `GET /:planId/conversation` (history)
6. `server/routes.ts` — Register `aiRouter` under `/api/plans` prefix

**Key implementation notes:**

- `requirePlanAccess` pattern from `plans.ts:37-54` is copy-paste reusable. Import `requireAuth` and `getEffectiveUser` from `middleware/auth.ts`.
- SSE: `res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Accel-Buffering': 'no' })`. Then `res.write(\`data: ${JSON.stringify(payload)}\n\n\`)`. Call `res.end()` on completion.
- Value conversion: `dollars * 100` for cents, `percent / 100` for decimals. Test file: `server/services/ai-service.test.ts`.
- LLM SDK: Check `process.env.GOOGLE_GENERATIVE_AI_API_KEY` first (already configured for FDD). If present, reuse `@google/generative-ai`. If not, check for `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` and install the corresponding SDK.
- JSONB messages array: `messages: jsonb("messages").$type<ConversationMessage[]>().notNull().default([])` — matches `brandValidationRuns.detailedResults` pattern at `schema.ts:338-358`.
- `req.on('close', ...)` handler to abort LLM stream if client disconnects mid-response.

**Risk assessment:** Low-medium. The SSE streaming and LLM integration are new patterns for this codebase, but the existing Gemini extractor proves the team can work with LLM APIs. The financial value extraction logic is the highest-risk component — type conversion errors would corrupt plan data. TDD on the extraction layer is recommended.

---

## Cross-Agent Recommendations (Non-Blocking)

1. **Value conversion TDD (Bob + Amelia):** Write cents/decimal conversion tests before implementing the extraction logic. A $4,200 → 420000 conversion bug would silently corrupt financial projections.

2. **Human-readable labels in extractedValues (Sally):** Add a `label` field (e.g., "Monthly Rent") alongside the field path (e.g., "operatingCosts.rentMonthly") in the extraction output. Story 9.2 will need this for the UI.

3. **Transaction wrapper for upsertConversation (Winston):** Wrap the read-modify-write cycle in a database transaction to prevent race conditions on concurrent writes. Simple and cheap insurance.

4. **LLM SDK choice at implementation time (Amelia):** Don't pre-commit to a specific SDK. Check which API key is configured in the environment and use the corresponding SDK. This avoids installing unused dependencies.

5. **Token counting vs message counting (Winston):** For MVP, message count limit (default 20) is acceptable. Add a TODO comment noting that token-based context management should be considered for Phase 2.

6. **Stream abort on client disconnect (Amelia):** Handle `req.on('close')` to abort the LLM API call if the franchisee navigates away mid-stream. This prevents wasted API credits and orphaned connections.

---

## Approval

**Status:** APPROVED FOR DEVELOPMENT
**Approved By:** John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev)
**Date:** 2026-02-21
**Next Action:** Proceed to implementation via dev agent (Amelia)
