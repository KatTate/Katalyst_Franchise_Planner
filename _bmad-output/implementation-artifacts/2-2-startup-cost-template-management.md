# Story 2.2: Startup Cost Template Management

Status: done

## Story

As a Katalyst admin,
I want to define and manage the startup cost line items for a brand,
so that franchisees see accurate default cost categories with FDD Item 7 ranges when planning (FR40).

## Acceptance Criteria

1. **Given** I am viewing a brand's detail page,
   **When** I navigate to the Startup Cost Template tab,
   **Then** I see a list of all template line items showing: name, default value, CapEx/non-CapEx classification, Item 7 Low range, and Item 7 High range,
   **And** I see an "Add Line Item" button,
   **And** if no line items exist, I see an empty state prompting me to add the first item.

2. **Given** I am on the Startup Cost Template tab,
   **When** I click "Add Line Item",
   **Then** I see a form with fields for: Line Item Name, Default Value (currency), CapEx Classification (with tooltip/description: "CapEx costs are depreciated over time; non-CapEx costs are expensed in Year 1"), Item 7 Low Range (currency, optional), and Item 7 High Range (currency, optional).

3. **Given** I have filled out the Add Line Item form with valid values,
   **When** I click Save,
   **Then** the new line item appears in the template list,
   **And** I see a success message confirming the item was added.

4. **Given** I submit the Add Line Item form with invalid data (e.g., blank name, negative amounts, Item 7 Low Range greater than High Range),
   **When** I click Save,
   **Then** I see inline validation errors explaining what needs to be corrected.

5. **Given** I have an existing line item in the template,
   **When** I click Edit on that line item,
   **Then** the form reopens with the current values pre-filled,
   **And** I can modify any field and save the changes.

6. **Given** I have an existing line item in the template,
   **When** I click Delete on that line item,
   **Then** I see a confirmation dialog: "Remove '[Line Item Name]' from the template? This will not affect existing plans.",
   **And** upon confirming, the line item is removed from the list.

7. **Given** I have multiple line items in the template,
   **When** I reorder the items using move up/down controls,
   **Then** the new order is reflected immediately in the list,
   **And** the order is persisted when I navigate away and return.

8. **Given** the startup cost template is complete for a brand,
   **When** a new franchisee creates a plan with this brand (Epic 3),
   **Then** the franchisee's startup cost section will be pre-populated with all template line items in the configured order,
   **And** each line item will show the FDD Item 7 range alongside the brand default and the franchisee's own estimate.
   *(Note: This AC is satisfied by design — plans copy brand template at creation time in Epic 3. No implementation needed in this story.)*

9. **Given** I update the template after franchisees have already started plans,
   **When** an existing franchisee views their plan,
   **Then** their existing startup cost entries remain unchanged — template changes only affect newly created plans.
   *(Note: Same as AC8 — naturally satisfied by copy-at-creation pattern in Epic 3.)*

## Dev Notes

### Architecture Patterns to Follow

- **Existing implementation**: The Startup Cost Template feature is substantially pre-built. The schema (`startupCostItemSchema`, `startupCostTemplateSchema`), storage method (`updateStartupCostTemplate`), API endpoints (`GET/PUT /api/brands/:brandId/startup-cost-template`), and the full UI tab (`StartupCostTemplateTab` in `admin-brand-detail.tsx`) all exist and are functional for add, edit, and delete operations.
- **Primary development work**: The main gap is **reorder functionality** (AC7). The `GripVertical` icon is already imported but unused. Implement move up/down button controls for reordering (preferred over drag-and-drop for simplicity and accessibility).
- **Accessibility (Party Mode accepted)**: All icon-only buttons (Edit, Delete, Move Up, Move Down) MUST have `aria-label` attributes (e.g., `aria-label="Edit Equipment & Signage"`). Disable Move Up button on first row and Move Down button on last row.
- **Help text (Party Mode accepted)**: Add help text to Item 7 Low/High fields: "Leave blank if this cost category is not included in Item 7 of the FDD." Add naming guidance to Line Item Name field.
- **JSONB storage pattern**: The startup cost template is stored as a JSONB array on the `brands` table. Each item add/edit/delete/reorder saves the entire template array via `PUT /api/brands/:brandId/startup-cost-template`. This is the correct pattern — keep it.
- **Schema validation**: The `startupCostItemSchema` enforces `.min(0)` on `default_amount` and includes `capex_classification` enum (`capex`, `non_capex`, `working_capital`). The client-side `startupCostFormSchema` adds the Item 7 range cross-field validation (low <= high).
- **Route protection**: Endpoints already use `requireAuth` + `requireRole("katalyst_admin")` middleware.
- **Data fetching**: Uses `@tanstack/react-query` with `useMutation` + `apiRequest` for saves, and `queryClient.invalidateQueries` for cache invalidation.
- **Forms**: Uses shadcn `useForm` + `Form` component with `zodResolver` for validation, following project convention.
- **data-testid**: All interactive and display elements already have `data-testid` attributes. Any new elements (reorder buttons) must follow the same pattern.

### UI/UX Deliverables

**Tab: Startup Cost Template (existing in `/admin/brands/:brandId`)**
- Table list of template line items showing: name, default amount ($), CapEx classification badge, Item 7 Low ($), Item 7 High ($), and action buttons
- "Add Line Item" button in header area
- Empty state card with prompt to add first item
- **NEW: Reorder controls** — up/down arrow buttons per row to move items in sort order; disable Move Up on first row, Move Down on last row; `aria-label` on each button

**Dialog: Add/Edit Line Item (existing)**
- Fields: Line Item Name (with naming guidance description), Default Value ($), CapEx Classification (select dropdown with tooltip description), Item 7 Low ($, optional, with help text), Item 7 High ($, optional, with help text)
- Help text on Item 7 fields: "Leave blank if this cost category is not included in Item 7 of the FDD."
- Validation: name required, amounts non-negative, Item 7 Low <= High when both provided
- Success: toast notification on save

**Dialog: Delete Confirmation (existing)**
- Message: "Remove '[Line Item Name]' from the template? This will not affect existing plans."
- Cancel and Remove buttons

**UI States:**
- Loading: Inherited from brand detail page query
- Empty: Card with "No startup cost items yet" message and "Add First Line Item" button
- Error: Inline validation in form dialog, toast on save failure
- Success: Toast on item add/edit/delete

### Anti-Patterns & Hard Constraints

- **DO NOT modify**: `server/vite.ts`, `vite.config.ts`, `server/index.ts`, `server/static.ts`, `drizzle.config.ts`, `package.json`
- **DO NOT install packages manually** — use the packager tool if a new dependency is needed
- **DO NOT rewrite the existing `StartupCostTemplateTab`** — enhance it with reorder functionality
- **DO NOT duplicate schema definitions** — `startupCostItemSchema`, `startupCostTemplateSchema` already exist in `shared/schema.ts`
- **DO NOT duplicate storage methods** — `updateStartupCostTemplate` already exists in `server/storage.ts`
- **DO NOT add hover/active background color classes to `<Button>` or `<Badge>`** — they have built-in elevation interactions
- **DO NOT use drag-and-drop libraries** unless reorder controls are insufficient — keep it simple with up/down buttons
- **DO NOT implement plan pre-population logic** — that belongs to Epic 3 (Story 3.2/3.3)
- **DO NOT specify height/width on `<Button size="icon">` elements**

### Gotchas & Integration Warnings

- **Session table**: The `session` table for `connect-pg-simple` has been dropped by drizzle-kit push in the past. If it's missing, recreate it with the SQL from Story 2.1 dev notes.
- **sort_order management**: When reordering items, all `sort_order` values in the array must be re-indexed (0, 1, 2, ...) to maintain consistency. The existing delete handler already does this (`items.map((item, i) => ({ ...item, sort_order: i }))`). Apply the same pattern after reorder.
- **ACs 8 and 9 (plan pre-population and immutability)**: These are satisfied by the copy-at-creation architecture pattern in Epic 3. No implementation is needed in this story — just verify the template is correctly stored and retrievable.
- **Epic 3 handoff (Party Mode accepted)**: Epic 3 Story 3.2/3.3 MUST explicitly verify that template copy-at-creation works correctly. Sort order, Item 7 ranges, and CapEx classification must all survive the copy. Document this as a CRITICAL DEPENDENCY in Epic 3 stories.
- **Existing `GripVertical` import**: The `GripVertical` icon is already imported in `admin-brand-detail.tsx` but unused. It can be used as a visual indicator alongside move buttons, or replaced with `ChevronUp`/`ChevronDown` arrows from lucide-react.
- **Dev login bypass**: When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not set, the system uses a dev login bypass for testing.
- **Item 7 range nullable**: Both `item7_range_low` and `item7_range_high` are nullable in the schema. The form handles this by converting empty strings to null. Cross-validation (low <= high) only applies when both are provided.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/admin-brand-detail.tsx` | MODIFY | Add reorder controls (move up/down buttons) to `StartupCostTemplateTab` |
| `shared/schema.ts` | VERIFY | Startup cost schemas already correct — no changes expected |
| `server/storage.ts` | VERIFY | `updateStartupCostTemplate` already exists — no changes expected |
| `server/routes.ts` | VERIFY | GET/PUT startup-cost-template endpoints already exist — no changes expected |

### Dependencies & Environment Variables

**Already installed (DO NOT reinstall):**
- drizzle-orm, drizzle-zod, zod (schema + validation)
- @tanstack/react-query (data fetching)
- react-hook-form, @hookform/resolvers (form handling)
- shadcn/ui components (form, dialog, tabs, card, button, input, toast, table, etc.)
- wouter (routing)
- lucide-react (icons — includes GripVertical, ChevronUp, ChevronDown, ArrowUp, ArrowDown)

**No new packages needed for this story.**

**Environment variables:**
- `DATABASE_URL` — already configured (Replit built-in PostgreSQL)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — optional for dev (dev login bypass works without them)
- `SESSION_SECRET` — already configured

### References

- Epic 2 Story 2.2 ACs: `_bmad-output/planning-artifacts/epics.md` lines 531-581
- Architecture — Startup Cost Builder subsystem: `_bmad-output/planning-artifacts/architecture.md` lines 126-137
- Architecture — Data Model (startup_cost_templates): `_bmad-output/planning-artifacts/architecture.md` lines 317-321
- Architecture — API Routes: `_bmad-output/planning-artifacts/architecture.md` lines 1421-1424
- UX — Brand theming and startup cost categories: `_bmad-output/planning-artifacts/ux-design-specification.md` lines 39, 573-574
- Story 2.1 dev notes and learnings: `_bmad-output/implementation-artifacts/2-1-brand-entity-financial-parameter-configuration.md`
- Existing schema: `shared/schema.ts` (startupCostItemSchema, startupCostTemplateSchema)
- Existing storage: `server/storage.ts` (updateStartupCostTemplate)
- Existing routes: `server/routes.ts` lines 576-611 (GET/PUT startup-cost-template)
- Existing UI: `client/src/pages/admin-brand-detail.tsx` lines 221-529 (StartupCostTemplateTab)

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

- ACs 1-6 verified as pre-built and functional (schema, storage, routes, UI all correct)
- AC7 (reorder): Implemented move up/down buttons with ArrowUp/ArrowDown icons, boundary disable (first/last), aria-labels, and sort_order normalization after every swap
- Party Mode improvements applied: aria-labels on all icon buttons (Edit, Delete, Move Up, Move Down), help text on Item 7 Low/High and Line Item Name fields, Epic 3 handoff dependency documented
- Removed unused GripVertical import
- E2E test passed: full CRUD flow + reorder + persistence verification + cleanup
- Code review (adversarial): PASS — 0 High, 0 Medium, 0 Low findings. All 9 ACs verified as satisfied. All Dev Notes constraints compliant. Protected files unmodified. LSP 0 errors. Visual verification passed (4 buttons fit, boundary disable visible, help text present).

### File List

- `client/src/pages/admin-brand-detail.tsx` — MODIFIED: Added reorder handlers (handleMoveUp, handleMoveDown), Move Up/Down buttons with boundary disable and aria-labels, aria-labels on Edit/Delete buttons, FormDescription help text on Line Item Name and Item 7 fields, removed unused GripVertical import
- `_bmad-output/implementation-artifacts/2-2-startup-cost-template-management.md` — MODIFIED: Status transitions, Party Mode improvements documented, completion notes
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: Story 2.2 status updated
