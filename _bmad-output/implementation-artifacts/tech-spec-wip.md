---
title: 'FDD Document AI Ingestion'
slug: 'fdd-document-ai-ingestion'
created: '2026-02-20'
status: 'in-progress'
stepsCompleted: [1]
tech_stack: ['TypeScript 5.6', 'React 18', 'Express 5', 'PostgreSQL/Drizzle', 'shadcn/ui', 'Claude API (Anthropic SDK)', 'multer (file upload)']
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: FDD Document AI Ingestion

**Created:** 2026-02-20

## Overview

### Problem Statement

Katalyst admins currently configure brand financial parameters (~20 seed values) and startup cost templates (variable line items per brand) manually through form-based admin UI tabs. This is tedious, error-prone, and requires the admin to manually cross-reference an FDD (Franchise Disclosure Document) — a dense legal PDF that every franchise brand is required to produce. The FDD's Item 7 table contains exactly the startup cost ranges and fee structures that need to be entered. Automating this extraction would save hours of manual data entry per brand and reduce transcription errors.

### Solution

Add an FDD document upload and AI extraction feature to the brand admin configuration experience. A Katalyst admin uploads an FDD PDF for a brand, the backend sends it to Claude's API (which natively understands PDFs) with a structured extraction prompt, and the AI returns financial parameters and startup cost line items mapped to the existing `brandParameterSchema` and `startupCostTemplateSchema`. The admin reviews the extracted data with confidence indicators, can edit any values, then applies the extraction to populate the brand's configuration with a single action.

### Scope

**In Scope:**
- PDF file upload endpoint for FDD documents (Katalyst admin only)
- Server-side AI extraction service using Claude API with structured output
- Extraction of brand financial parameters (revenue, operating costs, financing, startup capital)
- Extraction of startup cost template items (name, default amount, CapEx classification, Item 7 ranges)
- Review UI with confidence indicators and inline editing before applying
- Apply extracted data to existing brand parameter and startup cost template endpoints
- Extraction history/audit trail (which FDD was processed, when, by whom)
- Storage of uploaded FDD documents

**Out of Scope:**
- Franchisee-facing FDD access or viewing
- AI extraction of non-financial FDD content (territory restrictions, legal terms, etc.)
- Batch processing of multiple FDDs at once
- OCR for scanned/image-based PDFs (Claude handles text-based PDFs natively; scanned documents are a future enhancement)
- Integration with the AI Planning Assistant (Epic 9) or Advisory Board (Epic 10)
- Automatic re-extraction when FDD is updated (manual re-upload and re-extract)

## Context for Development

### Codebase Patterns

- **Three-tier backend**: Routes (validation + auth) → Services (business logic) → Storage (data access)
- **Zod validation at API boundaries** with `safeParse` and structured error responses
- **`requireAuth` + `requireRole("katalyst_admin")`** middleware for admin-only endpoints
- **Brand configuration endpoints** already exist: `PUT /api/brands/:brandId/parameters` and `PUT /api/brands/:brandId/startup-cost-template`
- **Admin brand detail page** uses tabbed interface (`Tabs` from shadcn/ui) with tab components in `client/src/components/brand/`
- **TanStack React Query v5** object-form only, `apiRequest()` for mutations, explicit `invalidateQueries` after success
- **Currency: cents as integers**, percentages: decimals (0.065 = 6.5%)
- **`useToast()`** for user feedback
- **Data-testid attributes** on interactive elements for Playwright testing

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `shared/schema.ts` | `brandParameterSchema`, `startupCostTemplateSchema`, `startupCostItemSchema` — target output schemas |
| `server/routes/brands.ts` | Existing brand config API endpoints — parameters, startup costs, validation |
| `server/routes.ts` | Route registration pattern |
| `server/services/brand-validation-service.ts` | Example of a server-side service with brand-scoped logic |
| `server/storage.ts` | Storage interface pattern |
| `client/src/pages/admin-brand-detail.tsx` | Admin brand detail page with tabbed layout |
| `client/src/components/brand/BrandValidationTab.tsx` | Example of a brand admin tab component with file upload UX patterns |
| `client/src/components/brand/FinancialParametersTab.tsx` | Existing financial parameter editing UI |
| `client/src/components/brand/StartupCostTemplateTab.tsx` | Existing startup cost template editing UI |
| `client/src/lib/queryClient.ts` | `apiRequest()` helper, query client configuration |
| `_bmad-output/project-context.md` | Critical implementation rules and patterns |

### Technical Decisions

1. **Claude API for extraction**: Claude natively understands PDFs — no need for a separate PDF parsing library. Send the PDF as base64-encoded content in the API message. Use structured output prompting to get JSON matching our Zod schemas.
2. **multer for file upload**: Standard Express middleware for multipart form data. Stores temporarily on disk, validates file type/size, then reads for API submission.
3. **No new database table for FDD storage**: Store FDD metadata (filename, upload date, extraction status) as a new JSONB column on the brands table or a lightweight `fdd_ingestion_runs` table. The PDF binary can be stored on filesystem or as base64 in the database for MVP (small scale — max 10 brands).
4. **Review-before-apply pattern**: AI extraction produces a preview that the admin reviews and edits before committing to the brand configuration. This prevents bad AI output from silently corrupting brand parameters.
5. **Confidence scoring**: The extraction prompt asks Claude to rate confidence per field (high/medium/low). Low-confidence fields are highlighted in the review UI.

## Acceptance Criteria

- **AC 1**: Given a Katalyst admin is on the brand detail page, when they navigate to the "FDD Ingestion" tab, then they see an upload area for PDF files and a history of previous ingestion runs for this brand.

- **AC 2**: Given a Katalyst admin uploads a valid PDF file (≤ 20MB, .pdf extension), when the upload completes, then the system sends the document to the AI extraction service and displays a loading state with progress indication.

- **AC 3**: Given the AI extraction completes successfully, when results are returned, then the admin sees a structured review panel showing:
  - Extracted financial parameters grouped by category (revenue, operating costs, financing, startup capital) with current brand values (if any) shown alongside for comparison
  - Extracted startup cost line items with name, amount, CapEx classification, and Item 7 ranges
  - Confidence indicator (high/medium/low) per extracted field
  - Inline editing capability for any extracted value before applying

- **AC 4**: Given the admin is reviewing extracted data, when they click "Apply Financial Parameters", then the extracted parameters are saved to the brand via the existing `PUT /api/brands/:brandId/parameters` endpoint and a success toast is shown.

- **AC 5**: Given the admin is reviewing extracted data, when they click "Apply Startup Costs", then the extracted startup cost template is saved to the brand via the existing `PUT /api/brands/:brandId/startup-cost-template` endpoint and a success toast is shown.

- **AC 6**: Given the admin applies extracted data, when parameters or startup costs are saved, then the extraction run is recorded with metadata (filename, timestamp, admin user, extraction status, applied status).

- **AC 7**: Given a non-authenticated user or a non-katalyst_admin user, when they attempt to access the FDD ingestion endpoint, then they receive a 401 or 403 response.

- **AC 8**: Given the AI extraction fails (API timeout, invalid response, etc.), when the error occurs, then the admin sees a clear error message and can retry the extraction without re-uploading.

- **AC 9**: Given an uploaded file is not a PDF or exceeds 20MB, when the upload is attempted, then the system rejects it with a descriptive error message before sending to AI.

- **AC 10**: Given a brand already has parameters configured, when AI extraction results are shown, then the current brand values are displayed alongside extracted values so the admin can compare before applying.

## Implementation Guidance

### Architecture Patterns to Follow

1. **Route → Service → Storage**: Create `server/routes/fdd-ingestion.ts` for the API endpoints, `server/services/fdd-ingestion-service.ts` for the AI extraction logic, and add storage methods for ingestion run tracking.
2. **Zod validation at API boundary**: Validate upload constraints (file type, size) in the route handler. Validate AI extraction output against existing `brandParameterSchema` and `startupCostTemplateSchema` before returning to the client.
3. **Existing brand config endpoints for apply**: The "apply" action should call the existing parameter and startup cost update logic (via storage methods), not create parallel write paths.
4. **Tab component pattern**: Create `client/src/components/brand/FddIngestionTab.tsx` following the pattern of `BrandValidationTab.tsx` — receives `brand` prop, uses `useQuery`/`useMutation`, displays structured results.
5. **Error handling**: Follow existing pattern — `try/catch` in route handlers, structured error JSON responses, `useToast` for client-side feedback.

### Anti-Patterns and Constraints

1. **Do NOT send FDD documents to the client** — PDFs stay server-side. Only extracted structured data goes to the frontend.
2. **Do NOT auto-apply extracted data** — always require admin review and explicit apply action.
3. **Do NOT store API keys in client code** — Claude API key is server-side only via `process.env.ANTHROPIC_API_KEY`.
4. **Do NOT modify the existing `brandParameterSchema` or `startupCostTemplateSchema`** — the extraction output must conform to existing schemas.
5. **Do NOT use `require()` or CommonJS** — ESM only throughout.
6. **Currency values must be in cents** when writing to brand parameters (the extraction prompt must instruct Claude to convert dollar values to cents).
7. **Percentage values must be decimals** (e.g., 5% → 0.05) when writing to brand parameters.

### File Change Summary

**New files:**
- `server/routes/fdd-ingestion.ts` — API endpoints for upload, extract, apply
- `server/services/fdd-ingestion-service.ts` — AI extraction logic using Claude API
- `client/src/components/brand/FddIngestionTab.tsx` — Review and apply UI
- `server/services/fdd-ingestion-service.test.ts` — Unit tests for extraction service
- `server/routes/fdd-ingestion.test.ts` — Route handler tests

**Modified files:**
- `server/routes.ts` — Register new FDD ingestion router
- `client/src/pages/admin-brand-detail.tsx` — Add FDD Ingestion tab
- `shared/schema.ts` — Add `fddIngestionRuns` table schema (if using DB tracking)
- `package.json` — Add `@anthropic-ai/sdk` and `multer` + `@types/multer` dependencies

### Dependencies

**New npm packages:**
- `@anthropic-ai/sdk` — Anthropic's official TypeScript SDK for Claude API
- `multer` — Express middleware for multipart form data (file uploads)
- `@types/multer` — TypeScript types for multer

**Environment variables:**
- `ANTHROPIC_API_KEY` — Required for Claude API access

**External services:**
- Claude API (Anthropic) — for PDF document understanding and structured data extraction

### Testing Guidance

**Unit tests (Vitest):**
- Test the extraction service's prompt construction and response parsing
- Test schema validation of AI-extracted output against `brandParameterSchema` and `startupCostTemplateSchema`
- Test currency/percentage conversion logic (dollars → cents, percent → decimal)
- Test error handling for malformed AI responses
- Mock the Anthropic SDK client for deterministic testing

**Route tests (Vitest + supertest):**
- Test auth/role enforcement (401 for unauthenticated, 403 for non-admin)
- Test file validation (reject non-PDF, reject oversized files)
- Test successful extraction flow with mocked service
- Test error handling when extraction fails

**Manual verification:**
- Upload a real FDD PDF and verify extraction quality
- Verify extracted values display correctly with confidence indicators
- Verify apply flow writes correct values to brand configuration
- Verify values appear correctly in the existing Financial Parameters and Startup Costs tabs after applying

### Notes

**High-risk items:**
- AI extraction quality varies by FDD document formatting — some FDDs have clear tabular Item 7 data, others embed it in prose. The extraction prompt needs to be robust.
- Claude API costs — each FDD extraction uses a large context window (FDD documents can be 100+ pages). Consider sending only relevant sections (Item 7, fee schedule pages) if document is very large. Claude's PDF support has a page limit.
- Rate limiting — Claude API has rate limits. A single extraction is a single API call, so this is low risk for MVP scale (10 brands).

**Known limitations:**
- Scanned/image-only PDFs will not extract well — Claude's PDF support works best with text-layer PDFs.
- The extraction is a best-effort mapping — some FDD formats may not map cleanly to all brand parameter fields (e.g., per-year growth rates may not be in the FDD).
- Item 7 ranges are the primary extraction target. Operating cost percentages (COGS, labor, etc.) may not be present in all FDDs and would need to come from brand knowledge separate from the FDD.

**Future considerations:**
- Could add support for extracting from XLSX spreadsheets (existing PostNet/Jeremiah's reference spreadsheets) — the `xlsx` package is already installed
- Could integrate with the AI Planning Advisor to use FDD data as context for franchisee conversations
- Could add automatic re-extraction alerts when a brand's FDD is updated
