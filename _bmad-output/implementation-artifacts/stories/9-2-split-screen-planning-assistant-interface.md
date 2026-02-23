# Story 9.2: Split-Screen Planning Assistant Interface

Status: ready-for-dev

## Story

As a franchisee (Sam),
I want to have a conversation with the AI advisor while seeing my plan update live,
So that I can describe my business situation and watch my plan build itself (FR50).

## Acceptance Criteria

1. **Given** I am on the My Plan workspace and the AI Planning Assistant is available,
   **When** I click the floating action button (bottom-right corner),
   **Then** a panel slides in from the right edge of the screen overlaying or pushing the existing layout to create a split-screen view with: conversation panel (left, minimum 360px) and live financial dashboard (right, minimum 480px).

2. **Given** the Planning Assistant panel is open,
   **When** the layout renders,
   **Then** the conversation panel and dashboard panel are resizable via a drag handle between them, and each panel respects its minimum width constraint (360px conversation, 480px dashboard).

3. **Given** the Planning Assistant panel is open,
   **When** the AI advisor loads for the first time on a plan,
   **Then** it displays a warm greeting: "Hi [first name], I'm here to help you build your [Brand Name] business plan. Tell me about your business — where are you planning to open?" (personalized with the franchisee's name and brand).

4. **Given** the Planning Assistant panel is open,
   **When** I type a message in the text input and press Enter (or click Send),
   **Then** my message appears in the conversation history and the AI response streams in real-time with a visible typing/streaming indicator.

5. **Given** the AI is streaming a response,
   **When** new tokens arrive,
   **Then** the conversation panel auto-scrolls to keep the latest content visible, and a scroll-to-bottom button appears if the user has scrolled up.

6. **Given** the viewport width is below 1024px,
   **When** the Planning Assistant is open,
   **Then** the split-screen layout stacks into a tabbed interface with two tabs: "Chat" and "Dashboard", with an accent-colored dot indicator on the Dashboard tab when a financial recalculation has occurred since the user last viewed it.

7. **Given** the Planning Assistant panel is open,
   **When** I close it (via X button, clicking outside the panel, or pressing Escape),
   **Then** the panel slides out and the My Plan workspace returns to its normal layout, preserving all conversation state for when I reopen the panel.

8. **Given** I reopen the Planning Assistant after closing it,
   **When** the panel renders,
   **Then** the full conversation history is displayed and the AI continues from where it left off (no re-greeting, no lost context).

9. **Given** the Planning Assistant panel is open,
   **When** the layout enters Planning Assistant mode,
   **Then** the sidebar collapses automatically for maximum workspace immersion, and re-expands when the panel is closed.

10. **Given** I click "Planning Assistant" in the sidebar Help section (instead of the floating action button),
    **When** the panel opens,
    **Then** the same split-screen experience renders — both entry points lead to the identical Planning Assistant panel.

## Dev Notes

### Architecture Patterns to Follow

- **WorkspaceView context extension:** The existing `WorkspaceViewContext` (in `client/src/contexts/WorkspaceViewContext.tsx`) manages workspace views (`"my-plan" | "reports" | "scenarios" | "settings"`). The Planning Assistant is NOT a new workspace view — it is a **slide-in panel overlay** within any workspace view, managed by its own state. Add a `planningAssistantOpen: boolean` and `togglePlanningAssistant()` to a new context or extend the sidebar context. Do not add `"planning-assistant"` to the `WorkspaceView` type.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 7 — "The AI Planning Assistant is a feature, not a destination"]
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, line 511 — "Planning Assistant sidebar item opens the same assistant from a conversational starting point"]

- **Resizable panels:** Use the existing `react-resizable-panels` library (v2.1.7, already installed) via the shadcn wrapper components in `client/src/components/ui/resizable.tsx`. Import `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` — do NOT import from `react-resizable-panels` directly. Use `minSize` prop (percentage-based) to enforce minimum widths. Calculate percentage values from pixel minimums based on container width.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, line 221 — "React Resizable Panels 2.1 (critical for split-screen Story Mode layout)"]

- **SSE streaming for AI responses:** The conversation API (from Story 9.1) uses Server-Sent Events. On `POST /api/plans/:id/conversation`, the server streams tokens via SSE. Use `EventSource` or the `fetch` API with `ReadableStream` to consume the SSE stream. The final SSE event contains extracted financial values. This story handles the **client-side UI** for streaming — the server API is built in Story 9.1.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 7 — SSE for AI conversation streaming]

- **Financial input state flow:** AI-extracted values flow through the same `updateFinancialInput()` pipeline as form edits and inline edits. The conversation response includes extracted values → call `updateFinancialInput()` with `source: 'ai_populated'` → React Query cache updates → dashboard/Impact Strip re-renders. Do NOT create a separate update path for AI values.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 8 — Financial Input State Flow diagram]

- **TanStack Query for conversation history:** Use query key `['/api/plans', planId, 'conversation']` for fetching conversation history. Mutations for sending messages should invalidate this key on completion.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 8 — "Query keys: `['/api/plans', planId]`, etc."]

- **Component placement:** New components for the Planning Assistant go in `client/src/components/planning/` directory (co-located with other plan-specific components like `input-panel.tsx`, `financial-statements.tsx`, `impact-strip.tsx`).
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Project Structure — `client/src/components/planning/`]

- **Independent loading states for split-screen panels:** Each panel (conversation and dashboard) must have its own loading/skeleton state. Never block the entire split-screen layout for a single panel's load.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, line 1351 — "Split-screen panels have independent loading states (Party Mode: Sally)"]

- **Error boundary per panel:** Wrap each panel in an error boundary so that a crash in the conversation panel does not take down the dashboard, and vice versa. Reuse the error boundary pattern from `client/src/components/shared/`.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, line 1902 — "Error boundary in `common/` enables fault isolation per panel in split-screen layouts"]

- **data-testid convention:** Every interactive element must have a `data-testid` attribute. Follow the existing pattern: `{action}-{target}` for interactive elements, `{type}-{content}` for display elements. Examples: `button-open-planning-assistant`, `input-chat-message`, `panel-conversation`, `panel-dashboard`, `tab-chat`, `tab-dashboard`, `button-close-planning-assistant`, `button-send-message`, `text-ai-message-{index}`, `text-user-message-{index}`, `indicator-dashboard-update`.
  - [Source: `_bmad-output/project-context.md` — data-testid naming conventions]

- **Sidebar integration:** The sidebar `useSidebar()` hook from `client/src/components/ui/sidebar.tsx` provides `setOpen()` to programmatically collapse/expand. The planning workspace already collapses the sidebar on mount (see `planning-workspace.tsx` line 56-60). For Planning Assistant mode, call `setOpen(false)` when the panel opens and restore the previous state when it closes.

- **Animation:** Sidebar transitions use 200-300ms with `prefers-reduced-motion` support. Apply the same animation timing to the Planning Assistant slide-in/slide-out.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md` — "200-300ms sidebar transition animation with prefers-reduced-motion support"]

### UI/UX Deliverables

**Screens/Components:**

1. **PlanningAssistantPanel** — The main slide-in panel container. Hosts the split-screen layout (conversation left, dashboard right). Renders as a sheet/overlay that pushes or overlays the My Plan content.

2. **ConversationPanel** (left panel, min 360px) — Contains:
   - Scrollable message history (user messages right-aligned, AI messages left-aligned)
   - Message bubbles with distinct styling for user vs AI
   - Streaming text indicator (animated dots or cursor) during AI response
   - Scroll-to-bottom floating button when user scrolls up
   - Text input area at the bottom with Send button (disabled while AI is responding)
   - Message timestamps (relative: "just now", "2 min ago")

3. **DashboardPanel** (right panel, min 480px) — Contains:
   - Reuse existing `SummaryMetrics` component from `client/src/components/shared/summary-metrics.tsx`
   - Reuse existing `ImpactStrip` component from `client/src/components/planning/impact-strip.tsx`
   - Financial summary that updates in real-time when AI extracts values
   - Plan completeness indicator showing which sections have been populated

4. **Floating Action Button (FAB)** — Bottom-right corner of My Plan workspace. Pulses gently to indicate AI availability. Opens the Planning Assistant panel on click.
   - Shows on My Plan workspace view only
   - Uses the "Mystical/Gurple" advisory color (`#A9A2AA`) or brand accent for visual distinction

5. **Mobile/Tablet Tabbed View** (below 1024px) — Two-tab interface:
   - "Chat" tab — full-width conversation panel
   - "Dashboard" tab — full-width dashboard panel with accent-colored dot indicator when recalculation occurred

**UI States:**

| State | Behavior |
|-------|----------|
| **Loading (conversation history)** | Skeleton placeholders in conversation panel; dashboard loads independently |
| **Loading (AI streaming)** | Typing indicator in conversation panel; send button disabled; dashboard remains interactive |
| **Empty (no conversation yet)** | AI greeting message displayed; text input ready; dashboard shows current plan state |
| **Error (SSE connection fails)** | Inline error message in conversation panel: "Connection lost. Trying to reconnect..." with retry button. Dashboard continues working. |
| **AI unavailable** | Message in conversation panel: "AI advisor is temporarily unavailable. Continue using My Plan forms or Reports to build your plan." — with navigation links to My Plan and Reports |
| **Responsive stacked** | Tabbed interface replaces side-by-side below 1024px |

**Navigation to this feature:**
- **Path 1:** My Plan workspace → floating action button (bottom-right)
- **Path 2:** Sidebar → Help section → "Planning Assistant" item
- Both paths open the same Planning Assistant panel

### Anti-Patterns & Hard Constraints

- **DO NOT add "planning-assistant" as a WorkspaceView.** The Planning Assistant is a slide-in panel feature, not a workspace destination. The `WorkspaceView` type must remain `"my-plan" | "reports" | "scenarios" | "settings"`.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 7 — "The AI Planning Assistant is a feature, not a destination"]

- **DO NOT create a mode switcher.** There are no modes. The retired three-mode model (Planning Assistant / Forms / Quick Entry) must not be reintroduced. No toggle, no segmented control, no `if (mode === 'planning-assistant')` branching.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 7, Critical Rule 1]

- **DO NOT modify shadcn `ui/` components.** The files in `client/src/components/ui/` (including `resizable.tsx`, `sheet.tsx`, `sidebar.tsx`) are template files marked `[T]` and must never be modified.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Project Structure — "[T] ui/ — Shadcn primitives (NEVER modify these)"]

- **DO NOT modify `vite.config.ts`, `server/vite.ts`, `package.json`, or `drizzle.config.ts`.**
  - [Source: `_bmad-output/project-context.md` — Forbidden Changes]

- **DO NOT create a separate data update path for AI values.** AI-extracted financial values must flow through the same `updateFinancialInput()` function used by forms and inline editing. Do not create `updateFinancialInputFromAI()` or any AI-specific mutation.
  - [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 8 — unified Financial Input State Flow]

- **DO NOT use WebSocket.** SSE is the chosen transport for AI streaming in MVP (Decision 7). The `ws` package is reserved for future Advisory Board Meeting (Phase 2).

- **DO NOT conflate the AI Planning Assistant with the human account manager.** The sidebar "Book a Consultation" item connects to a human (e.g., Denise). The "Planning Assistant" is the AI. These are separate features with separate identities.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, line 740 — "Critical distinction"]

- **DO NOT duplicate components from `shared/`.** The `SummaryMetrics` and `ImpactStrip` components already exist — reuse them in the dashboard panel. Do not recreate.

- **Currency in cents.** All financial values in the engine and storage use integers (cents). Use `unwrapForEngine()` at the boundary. Display values use `formatCurrency()` from existing utilities.
  - [Source: `_bmad-output/project-context.md` — "Currency: integers (cents) in engine/storage"]

### Gotchas & Integration Warnings

- **Story 9.1 dependency:** This story depends on Story 9.1 (LLM Integration & Conversation API) for the `POST /api/plans/:id/conversation` endpoint, the `GET /api/plans/:id/conversation` endpoint, and the `ai_conversations` table. If 9.1 is not yet complete, stub the API with mock SSE responses for UI development, but structure the code so the real API integration is a drop-in replacement.

- **Story 9.3 boundary:** This story builds the split-screen UI and basic conversation flow. The three-tier confidence threshold (confident/tentative/uncertain), field-population animations, and AI-to-dashboard bridging language are Story 9.3 scope. This story should display AI-extracted values in the dashboard panel when they arrive in the final SSE event, but the sophisticated extraction UX (dashed borders, pulse animations, clarifying questions) belongs to 9.3.

- **Story 9.4 boundary:** Graceful degradation (AI unavailable messaging, mode continuity, background completion) is Story 9.4 scope. This story should include a basic error state for the conversation panel, but the full degradation UX is 9.4.

- **Responsive breakpoint (1024px):** The tabbed mobile view is a fundamentally different layout, not just CSS media queries. Use `useIsMobile()` or a viewport width check to conditionally render `ResizablePanelGroup` (desktop) vs `Tabs` (mobile). The existing `client/src/hooks/use-mobile.tsx` hook may need adjustment — check its breakpoint value.
  - [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 17 — "AI Planning Assistant panel becomes full-screen sheet"]

- **Sidebar collapse timing:** The planning workspace already collapses the sidebar on mount (`planning-workspace.tsx` lines 54-60). The Planning Assistant adds a second collapse trigger. Ensure that closing the Planning Assistant restores the sidebar to its state BEFORE the Planning Assistant opened, not necessarily "expanded" — if the user had manually collapsed the sidebar, don't force-expand it.

- **Auto-scroll vs user scroll:** When the AI is streaming, the conversation should auto-scroll to keep the latest text visible. But if the user manually scrolls up to re-read earlier messages, auto-scroll should pause until the user scrolls back to the bottom or clicks "scroll to bottom." This is a common chat UX pattern but easy to get wrong.

- **Conversation persistence:** Conversation history is stored server-side in `ai_conversations` table (per plan). On panel open, fetch history via `GET /api/plans/:id/conversation`. The conversation survives page refreshes, plan switching, and browser restarts.

- **Panel resize persistence:** Consider storing the user's preferred panel width ratio in local storage (key: `planning-assistant-panel-ratio-${planId}`) so it persists across sessions. This is nice-to-have, not required.

- **Keyboard accessibility:** The chat input should be focusable, Enter sends message (Shift+Enter for newline). Escape closes the panel. Tab navigation should work through the conversation panel controls.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/planning/planning-assistant-panel.tsx` | CREATE | Main slide-in panel with split-screen layout (ResizablePanelGroup) |
| `client/src/components/planning/conversation-panel.tsx` | CREATE | Left panel: message history, streaming display, text input |
| `client/src/components/planning/dashboard-panel.tsx` | CREATE | Right panel: reuses SummaryMetrics, ImpactStrip, plan completeness |
| `client/src/components/planning/planning-assistant-fab.tsx` | CREATE | Floating action button for My Plan workspace |
| `client/src/components/planning/mobile-planning-assistant.tsx` | CREATE | Tabbed layout for viewports below 1024px |
| `client/src/contexts/PlanningAssistantContext.tsx` | CREATE | Context for panel open/close state, conversation state management |
| `client/src/hooks/use-conversation.ts` | CREATE | Custom hook for SSE streaming, message sending, conversation history query |
| `client/src/pages/planning-workspace.tsx` | MODIFY | Add FAB, integrate PlanningAssistantPanel, wire up context |
| `client/src/components/app-sidebar.tsx` | MODIFY | Add "Planning Assistant" item to Help section with click handler to open panel |
| `client/src/contexts/WorkspaceViewContext.tsx` | NO CHANGE | Do NOT modify — Planning Assistant is not a workspace view |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `react-resizable-panels` (v2.1.7) — split-screen layout
- `@tanstack/react-query` (v5) — server state management
- `wouter` — routing
- `lucide-react` — icons

**Packages to install:**
- None expected. The existing stack covers all requirements. If SSE consumption requires a helper library, prefer the native `EventSource` API or `fetch` with `ReadableStream` — no additional package needed.

**Environment variables:**
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` — required for Story 9.1's server-side LLM proxy (not directly consumed by this story's frontend code, but the API must be functional)
- `LLM_MODEL` — configurable model selection (server-side, Story 9.1 scope)

### Testing Expectations

- **E2E tests (Playwright):** Primary testing approach for this story. Critical flows to test:
  1. Open Planning Assistant via FAB → verify split-screen renders with both panels
  2. Open Planning Assistant via sidebar Help item → same split-screen renders
  3. Send a message → verify it appears in conversation history
  4. Verify AI streaming indicator appears during response
  5. Close panel (X, Escape, click outside) → verify panel dismisses and My Plan returns to normal
  6. Reopen panel → verify conversation history is preserved
  7. Verify sidebar collapses when panel opens and restores on close
  8. Resize viewport below 1024px → verify tabbed interface renders with Chat and Dashboard tabs
  9. Verify dashboard tab has accent dot indicator after recalculation

- **Critical ACs for test coverage:** AC 1, 4, 6, 7, 8, 9

- **Testing framework:** Playwright (via Replit's `run_test` tool). No unit test framework setup is required — E2E tests validate the full user flow.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md`, Epic 9, Story 9.2] — Story definition and acceptance criteria
- [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 7] — SSE for AI conversation streaming
- [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 8] — State management and financial input flow
- [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 9] — Component architecture and My Plan layout
- [Source: `_bmad-output/planning-artifacts/architecture.md`, Decision 14] — LLM integration pattern and conversation flow
- [Source: `_bmad-output/planning-artifacts/architecture.md`, lines 1351-1354] — Split-screen independent loading states
- [Source: `_bmad-output/planning-artifacts/architecture.md`, lines 1983-1985] — Split-screen responsive rule (stack below 1024px)
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 7] — Navigation architecture, two-door model, "AI is a feature not a destination"
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 8] — My Plan layout with AI Planning Assistant placeholder
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Journey 2] — Sam's AI-guided planning experience (lines 1088-1111)
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 17] — Responsive behavior below 1024px
- [Source: `_bmad-output/planning-artifacts/ux-design-specification-consolidated.md`, Part 18] — Anti-patterns: AI assistant as separate workspace
- [Source: `_bmad-output/project-context.md`] — Data-testid conventions, currency handling, forbidden changes
- [Source: `client/src/contexts/WorkspaceViewContext.tsx`] — Existing workspace view management (do not modify)
- [Source: `client/src/pages/planning-workspace.tsx`] — Existing planning workspace (modify to integrate)
- [Source: `client/src/components/ui/resizable.tsx`] — Existing shadcn resizable panel wrapper (use, don't modify)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
