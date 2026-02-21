# Story 9.1: LLM Integration & Conversation API

Status: ready-for-dev

## Story

As a developer,
I want a server-side LLM proxy that streams AI responses and extracts financial values,
So that the Planning Assistant can have intelligent conversations about the franchisee's business (FR50, FR53).

## Acceptance Criteria

### AC-1: Conversation Endpoint — Send Message & Stream Response

**Given** a franchisee is authenticated and has a plan
**When** a `POST /api/plans/:planId/conversation` request is sent with `{ "message": "My rent is $4,200/month" }`
**Then** the server responds with `Content-Type: text/event-stream` and streams SSE events
**And** each SSE data event contains a JSON payload with `{ "type": "token", "content": "<partial text>" }` as the LLM generates tokens
**And** a final SSE data event contains `{ "type": "done", "fullResponse": "<complete AI message>", "extractedValues": [...], "updatedOutputs": {...} }` with any financial values extracted from the conversation
**And** the connection closes after the final event
**And** the complete AI response (including the streamed text) is persisted to the `ai_conversations` table for the plan

### AC-2: Conversation Endpoint — Retrieve History

**Given** a franchisee has an existing conversation on their plan
**When** a `GET /api/plans/:planId/conversation` request is sent
**Then** the response contains the full message history as a JSON array of `{ "role": "user" | "assistant", "content": string, "extractedValues": [...] | null, "timestamp": string }` objects ordered chronologically
**And** if no conversation exists, an empty array is returned

### AC-3: System Prompt Construction — Brand & Plan Context

**Given** a franchisee sends a conversation message
**When** the server constructs the LLM system prompt
**Then** the system prompt includes:
  - The brand's parameter set (default values, labels, descriptions) from `brand.brandParameters`
  - The brand's Item 7 ranges from the startup cost template (`item7_range_low`, `item7_range_high`)
  - The current state of the franchisee's financial inputs (which fields are filled, which are at brand default, which have been manually set)
  - FTC compliance framing: the AI is an advisor helping the franchisee build *their* projections — the franchisee is always the author
  - The per-field schema (valid types and reasonable ranges) so the LLM can extract structured values
**And** conversation context is limited to the most recent N messages (configurable, default 20) to stay within token limits

### AC-4: Financial Value Extraction & Validation

**Given** the LLM produces a response that contains extractable financial values (e.g., "I've noted your rent at $4,200/month")
**When** the server processes the LLM response
**Then** extracted values are returned as structured data: `{ "field": "operatingCosts.rentMonthly", "value": 420000, "confidence": "high" | "tentative" | "uncertain" }`
**And** each extracted value is validated against the field's expected type (number, percentage, currency) and reasonable range
**And** out-of-range values are flagged but NOT rejected — the validation result is returned alongside the extracted value (e.g., `"rangeWarning": "Value is above Item 7 high range"`)
**And** validated values with "high" confidence are applied to the plan's `financial_inputs` with `source: "ai_populated"` and `lastModifiedAt` set to the current timestamp
**And** "tentative" and "uncertain" values are returned to the client for user confirmation but NOT automatically applied to the plan

### AC-5: Conversation Persistence & Token Tracking

**Given** a conversation turn completes (user message + AI response)
**When** the turn is saved
**Then** both the user message and AI response are appended to the `ai_conversations` record for this plan
**And** the `total_tokens_used` field is incremented by the token count from the LLM API response
**And** if no `ai_conversations` record exists for this plan, one is created

### AC-6: Authorization & Data Isolation

**Given** a request to `POST` or `GET /api/plans/:planId/conversation`
**When** the server processes the request
**Then** the request requires authentication (`requireAuth` middleware)
**And** the requesting user must be the plan owner (franchisee) or have impersonation/admin access via `getEffectiveUser()`
**And** a franchisee cannot access another franchisee's conversation
**And** the LLM API key is never exposed to the client — all LLM calls happen server-side only

### AC-7: Graceful Degradation

**Given** the LLM API is unavailable (network error, timeout > 30s, rate limit, invalid API key)
**When** a conversation request is made
**Then** the server returns an SSE error event: `{ "type": "error", "message": "AI advisor is temporarily unavailable. Continue using My Plan forms or Reports to build your plan.", "code": "LLM_UNAVAILABLE" }`
**And** the connection closes cleanly after the error event
**And** no partial or corrupted data is written to the conversation history
**And** previously saved conversation history remains intact and accessible via GET

### AC-8: Database Schema — ai_conversations Table

**Given** the `ai_conversations` table is defined in the shared schema
**When** `db:push` is run
**Then** the table is created with columns:
  - `id` (varchar, PK, UUID default)
  - `plan_id` (varchar, FK → plans, NOT NULL, indexed)
  - `messages` (JSONB array — each entry: `{ role, content, extractedValues, timestamp }`)
  - `total_tokens_used` (integer, default 0)
  - `created_at` (timestamp, default now)
  - `updated_at` (timestamp, default now)
**And** the Drizzle schema, insert schema, and TypeScript types are exported from `shared/schema.ts`
**And** the `IStorage` interface and `DatabaseStorage` class include methods: `getConversation(planId)`, `upsertConversation(planId, messages, tokensUsed)`

## Dev Notes

### Architecture Patterns to Follow

- **Route module pattern:** Create `server/routes/ai.ts` as a thin Express Router module. Import and register it in `server/routes.ts` as `app.use("/api/plans", aiRouter)`. Keep the route handler under 100 lines — delegate business logic to the service layer. Follow the pattern in `server/routes/plans.ts` and `server/routes/fdd-ingestion.ts`.
  - Source: `server/routes.ts:1-56`, `server/routes/plans.ts:1-54`

- **Service layer pattern:** Create `server/services/ai-service.ts` for all LLM interaction logic: system prompt construction, LLM API calls, response streaming, value extraction, and validation. Follow the service pattern in `server/services/fdd-ingestion-service.ts` (interface + orchestration functions).
  - Source: `server/services/fdd-ingestion-service.ts:1-74`

- **Plan access authorization:** Reuse the `requirePlanAccess()` pattern from `server/routes/plans.ts:37-54` — load the plan, verify the effective user has access via `getEffectiveUser()`, return 404/403 as appropriate. Import `requireAuth` and `getEffectiveUser` from `server/middleware/auth.ts`.
  - Source: `server/routes/plans.ts:37-54`, `server/middleware/auth.ts:17-31`

- **Drizzle ORM table definition:** Define `ai_conversations` in `shared/schema.ts` following the existing table patterns (pgTable, varchar PK with UUID default, jsonb columns, timestamp columns, indexes). Use `createInsertSchema()` from `drizzle-zod` to generate the insert schema. Export the table, insert schema, and inferred types.
  - Source: `shared/schema.ts:103-125` (brands table pattern), `shared/schema.ts:338-358` (brandValidationRuns pattern)

- **Storage interface pattern:** Add `getConversation()` and `upsertConversation()` methods to the `IStorage` interface in `server/storage.ts`, then implement them in `DatabaseStorage`. Follow the CRUD patterns of existing methods (e.g., `getPlan()`, `createBrandValidationRun()`).
  - Source: `server/storage.ts:36-122`

- **SSE streaming from Express:** Use `res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' })` then `res.write(`data: ${JSON.stringify(payload)}\n\n`)` for each event. Call `res.end()` after the final event. Express 5.0 supports this natively — no additional SSE library needed.
  - Source: Architecture Decision 14 (architecture.md:648-660)

- **LLM SDK choice — use the existing Gemini pattern or add Anthropic/OpenAI SDK:** The project already uses `@google/generative-ai` (Gemini) for FDD ingestion (`server/services/extractors/gemini-fdd-extractor.ts`). The architecture specifies the LLM is "configurable (default: GPT-4o or Claude 3.5 Sonnet)" with "OpenAI SDK, Anthropic SDK, or Vercel AI SDK (provider-agnostic)" as options. **Recommended approach:** Use the Vercel AI SDK (`ai` package) which provides a unified interface across providers (OpenAI, Anthropic, Google) with built-in streaming support. This gives provider flexibility without coupling to a single vendor. Alternatively, if simplicity is preferred, reuse the existing `@google/generative-ai` Gemini SDK since it's already installed and proven in the codebase.
  - Source: architecture.md:267, package.json (existing `@google/generative-ai` dependency)

- **Financial field paths match schema:** The `planFinancialInputsSchema` in `shared/schema.ts:222-250` defines the exact field structure. Extracted values must reference paths like `"revenue.monthlyAuv"`, `"operatingCosts.rentMonthly"`, `"financing.loanAmount"`, etc. Values are stored with the `financialFieldValueSchema` structure: `{ currentValue, source, brandDefault, item7Range, lastModifiedAt, isCustom }`.
  - Source: `shared/schema.ts:210-250`

- **Source attribution:** When AI populates a field, set `source: "ai_populated"` (already a valid source in `financialFieldValueSchema` at `shared/schema.ts:212-214`). This is critical for the four-state value attribution system (brand_default, user_entry, ai_populated, admin:name).

- **Temperature 0.3:** Architecture specifies low creativity, high consistency for financial conversations. Do not use high temperature values.
  - Source: architecture.md:838

- **API response format:** Success responses use `{ data: T }`, errors use `{ error: { message, code } }` with `{ error: { message, code: "VALIDATION_ERROR", details } }` for validation errors. HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server error).
  - Source: architecture.md:1225-1238

### Anti-Patterns & Hard Constraints

- **DO NOT call the LLM from the client.** All LLM API calls happen server-side only. The API key must never be exposed to the frontend. The server is the mandatory proxy.
  - Source: architecture.md:1750-1753

- **DO NOT use WebSocket for conversation streaming.** Architecture Decision 7 specifies SSE for MVP. The `ws` package is available but reserved for potential Phase 2 use.
  - Source: architecture.md:648-660

- **DO NOT auto-apply "tentative" or "uncertain" extracted values.** Only "high" confidence values are written to the plan's financial inputs. Tentative/uncertain values are returned to the client for user confirmation (Story 9.3 handles the client-side UI for this).
  - Source: PRD NFR23 (line 941), architecture.md:841-844

- **DO NOT store the full conversation history in every system prompt.** Limit to the most recent N messages (configurable, default 20). Include a current plan state summary instead of full history.
  - Source: architecture.md:866-869

- **DO NOT modify `server/services/fdd-ingestion-service.ts` or `server/services/extractors/gemini-fdd-extractor.ts`.** The FDD ingestion service has a separate purpose (document extraction). The AI conversation service is a new, independent service.

- **DO NOT add new URL routes to the React client.** Story 9.1 is API-only. The client-side UI is Story 9.2 scope. However, the route endpoints live under the existing `/api/plans` prefix (not a new top-level route).

- **DO NOT install packages that duplicate existing capabilities.** Check `package.json` before adding any dependency. Zod is already available for validation, Express for HTTP, Drizzle for ORM.

- **DO NOT create a separate table per conversation turn.** Use a single `ai_conversations` row per plan with a JSONB `messages` array. This matches the architecture spec and keeps queries simple.
  - Source: architecture.md:384-387

### Gotchas & Integration Warnings

1. **Engine values are in cents and decimals.** All monetary amounts in `PlanFinancialInputs` are in integer cents (e.g., $4,200 = 420000). All percentages are decimals (e.g., 5% = 0.05). The LLM will likely extract values in human-readable format ($4,200, 5%). The extraction logic MUST convert dollars to cents (multiply by 100) and percent to decimal (divide by 100) before writing to `financial_inputs`.
   - Source: `shared/schema.ts:210-220`, `shared/financial-engine.ts` interfaces

2. **LLM API key environment variable.** The architecture mentions `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` stored as Replit Secrets. If using Vercel AI SDK, you'll need the appropriate provider key. If reusing Gemini, use the existing `GOOGLE_GENERATIVE_AI_API_KEY` pattern from `gemini-fdd-extractor.ts`. The service must fail gracefully if the key is not configured.
   - Source: architecture.md:788, `server/services/extractors/gemini-fdd-extractor.ts`

3. **SSE and Express 5.0 compatibility.** Express 5.0 is used in this project. Ensure SSE response headers are set before calling `res.write()`. The response must NOT be buffered — set `'X-Accel-Buffering': 'no'` header to prevent proxy buffering in production environments (Replit's proxy may buffer SSE otherwise).

4. **Plan must exist and have financial inputs.** Before constructing the system prompt, verify `plan.financialInputs` is not null. If a plan exists but has no financial inputs yet (new plan before Quick ROI), the AI should still be able to converse but will have limited context.

5. **Brand parameters loading.** The brand's parameter set must be loaded via `storage.getBrand(plan.brandId)` to include in the system prompt. The `brand.brandParameters` contains default values, labels, and descriptions. The `brand.startupCostTemplate` contains Item 7 ranges.

6. **Concurrent conversation writes.** If two browser tabs send messages simultaneously, the JSONB `messages` array could have a race condition. Use an atomic append pattern: `jsonb_set(messages, '{-1}', new_message)` or load-then-save with optimistic locking. For MVP, a simple load-append-save within a single request handler is acceptable since concurrent AI conversations on the same plan are unlikely.

7. **LLM structured extraction is non-trivial.** The LLM must return both conversational text AND structured extracted values. Options include:
   - **Tool use / function calling:** Most reliable. Define tools that the LLM can call to extract values (e.g., `set_financial_field(path, value, confidence)`). OpenAI, Anthropic, and Gemini all support this.
   - **JSON in final message:** Ask the LLM to include a JSON block at the end of its response. Less reliable but simpler.
   - **Vercel AI SDK structured output:** The `ai` package supports structured output schemas.
   - **Recommended:** Tool use / function calling for reliability. The conversational response is the text output; the extracted values come from tool calls.

8. **FTC compliance tone.** The system prompt must instruct the LLM to frame all guidance as advisory. The franchisee is the author of their projections. The AI helps them think through numbers — it does not prescribe numbers. Example system prompt framing: "You are a friendly financial planning advisor. Help the franchisee explore their own assumptions. Never tell them what values to use — ask guiding questions and present brand averages as reference points."

9. **`db:push` for schema changes.** After adding the `ai_conversations` table to `shared/schema.ts`, run `npx drizzle-kit push` to apply the schema to the database. The project uses `db:push` (not migration files).
   - Source: `package.json:11` (scripts.db:push)

10. **Request body size.** Conversation messages could be long. Express 5.0's default JSON body limit should be sufficient, but verify the body parser is configured in the app setup (check `server/index.ts` or `vite.config.ts` server setup).

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `ai_conversations` table definition, insert schema, and TypeScript types |
| `server/storage.ts` | MODIFY | Add `getConversation()` and `upsertConversation()` to IStorage interface and DatabaseStorage class |
| `server/services/ai-service.ts` | CREATE | LLM proxy service: system prompt construction, streaming, extraction, validation |
| `server/routes/ai.ts` | CREATE | Express Router: POST /conversation (SSE stream), GET /conversation (history) |
| `server/routes.ts` | MODIFY | Import and register `aiRouter` under `/api/plans` prefix |
| `package.json` | MODIFY (maybe) | Add LLM SDK dependency if not reusing Gemini (e.g., `ai` for Vercel AI SDK, or `@anthropic-ai/sdk`, or `openai`) |

### Testing Expectations

- **Unit tests for `ai-service.ts`:** Test system prompt construction (includes brand parameters, plan state, FTC framing), value extraction and validation (correct field paths, cents conversion, range warnings), token limit enforcement (message trimming), and graceful degradation (LLM timeout, missing API key).
- **Unit tests for storage methods:** Test `getConversation()` returns null for no conversation, `upsertConversation()` creates and updates correctly.
- **Integration tests for routes:** Test `POST /api/plans/:planId/conversation` returns SSE stream headers, test `GET /api/plans/:planId/conversation` returns message history, test authorization (403 for wrong user, 401 for unauthenticated).
- **Test framework:** Vitest for unit tests (already configured at `vitest.config.ts`), Supertest for HTTP integration tests (already in dependencies). Follow existing test file naming: `*.test.ts` co-located with source files.
  - Source: `server/routes/plans.test.ts`, `server/services/financial-service.test.ts`

### Dependencies & Environment Variables

**Packages already present (DO NOT reinstall):**
- `express` (5.0.1) — HTTP server
- `express-session` — session auth
- `drizzle-orm` (0.39) — ORM
- `drizzle-zod` (0.7) — schema-to-validation
- `zod` (3.24) — runtime validation
- `@google/generative-ai` (0.24) — Gemini SDK (if reusing for conversation)
- `pg` — PostgreSQL driver

**Packages to install (if choosing Vercel AI SDK):**
- `ai` — Vercel AI SDK (unified LLM interface with streaming support)
- `@ai-sdk/openai` or `@ai-sdk/anthropic` or `@ai-sdk/google` — provider adapter

**Packages to install (if choosing Anthropic SDK directly):**
- `@anthropic-ai/sdk` — Anthropic SDK with native streaming

**Environment variables needed:**
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY` — LLM API key (stored as Replit Secret, never in source). The existing Gemini key may already be configured for FDD ingestion.
- `LLM_MODEL` (optional) — Override default model name (e.g., `gpt-4o`, `claude-sonnet-4-20250514`, `gemini-2.0-flash`)
- `LLM_MAX_CONTEXT_MESSAGES` (optional, default 20) — Max conversation messages in LLM context window
- `LLM_TEMPERATURE` (optional, default 0.3) — LLM temperature setting

### References

- [PRD: FR50-FR54] — `_bmad-output/planning-artifacts/prd.md:831-837` (AI Planning Advisor functional requirements)
- [PRD: NFR22-NFR24] — `_bmad-output/planning-artifacts/prd.md:940-942` (AI response time, validation, graceful degradation)
- [PRD: Four-state value attribution] — `_bmad-output/planning-artifacts/prd.md:637` (brand_default, user_entry, ai_populated, Item 7 reference)
- [Architecture: Decision 7 — SSE] — `_bmad-output/planning-artifacts/architecture.md:648-660`
- [Architecture: Decision 14 — LLM Integration Pattern] — `_bmad-output/planning-artifacts/architecture.md:811-870`
- [Architecture: ai_conversations schema] — `_bmad-output/planning-artifacts/architecture.md:384-387`
- [Architecture: API endpoints] — `_bmad-output/planning-artifacts/architecture.md:572-574`
- [Architecture: Environment variables] — `_bmad-output/planning-artifacts/architecture.md:788-795`
- [Schema: financialFieldValueSchema] — `shared/schema.ts:210-220`
- [Schema: planFinancialInputsSchema] — `shared/schema.ts:222-250`
- [Existing LLM pattern: Gemini FDD extractor] — `server/services/extractors/gemini-fdd-extractor.ts`
- [Existing route pattern] — `server/routes/plans.ts`, `server/routes/fdd-ingestion.ts`
- [Existing service pattern] — `server/services/fdd-ingestion-service.ts`

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
