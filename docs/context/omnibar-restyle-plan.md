# Omnibar Diagnosis & Restyle Implementation Plan

## 1. Current Architecture (as-is)

```
apps/web (PWA)
 ├─ manifest.ts               → share_target: GET /home (multipart/form-data: title/text/url)
 ├─ (workspace)/home/page.tsx → Server Component. If ?chat= present → <AnswerView initialQuery initialReviewId>
 │                               else → empty focus-mode shell (Omnibar dead-centered by OmniBarProvider)
 └─ layout → mounts <OmniBarProvider> globally (design-system)

packages/design-system/OmniBar/
 ├─ OmniBarProvider.tsx   → wires hooks (socket, hotkeys, speech, drag) into presentation
 ├─ OmniBarPresentation.tsx → 3 render modes: focus-page pill, answer-page pill, workspace FAB+modal pill
 ├─ OmniInputPill.tsx     → textarea + attach/mic/submit cluster + drop zone
 ├─ use-omni-socket.hook.ts    → socket.io client on `/commands` namespace; listens chat_message/command_status
 ├─ use-omnibar-hotkeys.hook.ts→ builds OmniMessage, routes to /home?chat=<uuid>, emits `executeCommand`
 └─ UnifiedReviewPanel.tsx / UnifiedItemRow.tsx → invoice/recipe human-in-the-loop review UI

packages/domain-inventory/
 ├─ AnswerView.tsx        → the ACTUAL chat transcript renderer (mounted at /home?chat=)
 │                           fetches history via GET /commands/conversations/:id/messages
 │                           renders messages inline in a single big Card, all left-aligned except
 │                           an icon swap; no real bubble alignment, no thought-trace collapsing
 └─ ReviewComponent/UniversalReviewComponent.tsx → polymorphic ingestion review (invoice/recipe/prose blocks),
                                                     driven by uiAction commands from chat (TURN_PAGE, ACCEPT_ALL, MAP_ITEM)

apps/api/modules/commands/
 ├─ commands.gateway.ts   → `/commands` WS namespace, `executeCommand` handler, `emitIngestionUpdate` broadcaster
 ├─ commands.service.ts   → 790-line monolithic ReAct tool-calling loop against LiteLLM (`ai.sous.tools`),
 │                           14 tools all if/else-branched inline, persists agent_step/render_component
 │                           messages mid-stream via persistMessage()
 ├─ commands-tools.ts     → flat array of 14 plain-object tool schemas (no NestJS DI, no co-location
 │                           with the domain modules that actually implement each tool's behavior)
 └─ commands.controller.ts→ REST fallback POST /commands/execute, GET /commands/conversations/:id/messages

apps/api/modules/unified-ingestion/
 ├─ unified-ingestion.processor.ts → BullMQ worker; per-page block extraction via LiteLLM vision call,
 │                                    fallback to keyword-sniffing sample data if the model call fails
 └─ unified-ingestion.service.ts   → embeddings, master-item + USDA top-5 matching, review CRUD, commit-to-DB

Persistence: Supabase `chat_conversations` + `chat_messages` (migration 00004), RLS-enabled.
```

## 2. Diagnosed Problems

### Correctness / architecture bugs

1. **`orgId: "unknown"` placeholder bug** — `commands.gateway.ts:72,87` calls
   `persistMessage(conversationId, "unknown", undefined, msg)` for `agent_step` and `render_component`
   messages emitted from `emitIngestionUpdate`. Because `persistMessage` only uses `orgId` when it has to
   **create** a new conversation row, any ingestion-triggered message that arrives before the conversation
   row exists will silently attribute it to the hardcoded demo org fallback instead of the real tenant.
2. **User/model turns from the live WS chat loop are not consistently persisted.** `commands.service.ts`
   emits `agent_step`/`render_component` via `emitMessage` but the **final assistant response** and the
   **initial user message** path (in `use-omnibar-hotkeys.hook.ts`) go straight over the socket to
   `chat_message` — there is no `persistMessage` call wrapping the user's inbound message or the final
   "Heard, Chef..." model reply inside `handleCommand`'s main loop. **In practice this means essentially
   zero real persistence happens for a normal conversational turn** — only the incidental ingestion-status
   pings get written, and even those go to the wrong org. Reloading `/home?chat=<id>` loses almost
   everything.
3. **The nicer chat-bubble component was dead code** (now deleted — see §5). It had proper left/right
   alignment, rounded-corner asymmetry, markdown link parsing, timestamps. `AnswerView` (the component
   actually mounted) re-implements a cruder, non-aligned version. This was the root cause of "doesn't look
   like a modern chat UI."
4. **Hardcoded org ID fallback (`d0000000-0000-0000-0000-000000000000`)** appears in `OmniBarProvider.tsx`,
   `AnswerView.tsx`, and `use-omni-actions.hook.ts` — violates the "no string fallbacks" rule in AGENTS.md
   and means every Omnibar action is tenant-unsafe outside of the seeded demo org.
5. **Container/View violation acknowledged in code**: `AnswerView.tsx` fetches `/dashboard/stats` and
   conversation history directly — it's a `.tsx` file, not a `.container.tsx`, so it violates the
   Container/View quarantine rule.
6. **No conversation list / history sidebar** — there's no way to browse past conversations; the only
   entry point is a `chat` query param the user must already know. Modern chat UIs (Gemini, Claude) always
   expose a left rail of past sessions.
7. **No "thinking" / tool-trace collapsing** — `agent_step` messages render as flat pill-shaped status
   lines inline in the timeline, not as a collapsible "Thought for Ns" trace block the way Claude Code /
   Gemini display reasoning steps.
8. **`commands.service.ts` is a 790-line monolith** — every one of the 14 tools is handled by an inline
   `if (functionName === "...")` branch mixing prompt-engineering, DB writes, Neo4j calls, BullMQ enqueues,
   and message emission all in one file. Zero use of NestJS's IoC/DI to let each domain module own and
   register its own tools.
9. **Image parsing is unreliable and undocumented in failure**: `unified-ingestion.processor.ts` fetches
   the image, base64-encodes it, and sends it as an OpenAI-style `image_url` content part to whatever model
   is configured as `gemini-3.6-flash` in LiteLLM. If that call throws for *any* reason (bad model alias,
   network blip, vision-unsupported model route, malformed response), the code silently swallows the error
   (`catch (err) { this.logger.error(...) }`) and falls through to `buildFallbackBlocks(rawText)` — which
   is a **keyword-sniffing stub that returns literally hardcoded sample data** ("Sysco Food Services",
   "Chicken Breast 10lb", "Olive Oil", etc.) with zero indication to the end user that the extraction
   failed and they're looking at fake placeholder data. This is almost certainly why "most of the time it
   fails to parse the image" — the pipeline never surfaces the failure, it just serves canned junk that
   looks like a real (but wrong) result.
10. **The human-in-the-loop review UI (`UniversalReviewComponent` + `UnifiedReviewPanel`/`UnifiedItemRow`)
    shows every field as an always-editable input** rather than static text that becomes editable on click,
    contradicting the explicit ask that fields "look like normal text unless you click to modify it." There
    is also no persisted learning loop: `handleConfirmAlias` posts to `/ingestion/alias` (vendor item ↔
    master item), but nothing feeds that alias table back into the *next* extraction's tenant-match ranking
    at ingestion time — `searchMasterItemsTop5` only does pgvector embedding similarity, it never joins
    against previously-confirmed aliases first. So "the system never gets smarter" is accurate: the alias
    table is written to but never read from during ingestion.
11. **No explicit USDA-linking guarantee for ingredients.** `unified-ingestion.processor.ts` calls
    `usdaResolver.searchTop5(guessName)` and defaults `selectedUsdaId` to `usdaMatches[0]?.fdcId` — i.e. it
    auto-picks the #1 fuzzy text match with no confidence threshold, no verification step, and no way to
    tell the difference between "confidently linked" and "guessed because something existed at index 0."
    If `usdaMatches` is empty (API failure, throttling, or truly novel ingredient), the ingredient is saved
    with no USDA link at all and nothing flags it for follow-up.

## 3. Restyle Goals (Gemini / Claude-Code-like chat UI, mobile-first)

- Persisted, resumable conversations with a browsable, **per-user** history rail (confirmed: not shared
  across the org — each user only sees their own conversations).
- Visual language sourced from `.assets/neon-glass-design-system/` (the non-functional v0 prototype the
  user built) — see §6 for the concrete mapping from that prototype to our real design-system tokens.
- Clear left/right alignment: user messages right-aligned/tinted, assistant left-aligned neutral.
- Collapsible **"thought trace"** groups: consecutive `agent_step` messages collapse into a single
  expandable "Working..." accordion (like Claude Code's tool-call trace), instead of a flat list of pills.
- Mobile-first layout: single scrollable conversation column by default; **generated artifacts (ingestion
  review panels, charts, tables) live in their own collapsible, independently-scrollable second column**
  rather than interleaved inline in the chat stream — closer to Claude/Gemini's canvas pattern than the
  current inline-swap approach.
- Sticky composer pinned to the bottom of the conversation column (not just an overlay pill) when in
  active-chat mode.
- Streaming affordances: skeleton/typing indicator that matches the final bubble's shape.
- Field values in review panels render as **static text by default**, becoming an editable input only on
  click/tap — not permanently-open form inputs for every field.

## 4. Implementation Plan

### Phase 0 — Fix data-integrity bugs (prerequisite, small, backend only)

**Files:** `apps/api/src/modules/commands/commands.gateway.ts`, `commands.service.ts`

1. Thread the real `orgId` (resolved from the WS auth guard's `client.user`) into `emitIngestionUpdate`
   callers instead of the `"unknown"` literal.
2. Wrap the initial user message and the final assistant message inside `handleCommand` with
   `persistMessage(...)` calls so a full turn is durably saved before `emitMessage` fires. This is the
   actual fix for "literally zero things persist" (see §7 for the deeper persistence work).
3. Replace hardcoded `d0000000-0000-0000-0000-000000000000` fallbacks with a fail-fast read from
   `serverConfig`/request context per AGENTS.md Secrets SSOT rule (no default fallbacks).

Validation: `pnpm --filter api test` + manual: send a chat message as a non-demo org and confirm
`chat_conversations.organization_id` matches the real tenant, and that reloading `/home?chat=<id>` shows
the full prior turn (user + agent steps + final reply).

### Phase 1 — Conversation List API + Sidebar (per-user)

**New backend endpoint:** `GET /commands/conversations?userId=` → list `chat_conversations` filtered by
`user_id = current user` (per-user visibility, confirmed), ordered by `updated_at desc`.
**New frontend:** `packages/domain-inventory/src/components/ConversationHistory/` (Container/View pair)

- `ConversationHistory.container.tsx` — fetches list via `api-client`, subscribes to socket `chat_message`
  to bump order/title live.
- `ConversationHistory.view.tsx` — pure presentational rail, active-state highlight, "New chat" button
  that clears `chatHistory` and pushes `/home` (no chat param).

Wire into `/home` layout as a persistent left rail (desktop) / collapsible drawer (mobile) — mobile-first,
so the rail defaults to hidden behind a hamburger/menu affordance on small viewports.

### Phase 2 — Container/View split + revive proper bubble rendering

1. Split `AnswerView.tsx` into `AnswerView.container.tsx` (data: chat history fetch, dashboard stats,
   socket emit for `initialQuery`) + `AnswerView.tsx` (pure view: renders the chat transcript + artifact
   column), resolving the acknowledged Container/View violation.
2. Rebuild the transcript renderer as a new pure-presentation component (the old `OmniChatWindow.tsx` has
   been deleted as dead code — see §5) directly informed by the v0 prototype's
   `omnibar-timeline.view.tsx` / `omnibar-event.view.tsx` / `message-event.view.tsx` structure (already
   Container/View-correct in the prototype). Port the alignment logic (`flex-row-reverse` for user
   messages, asymmetric rounded corners, timestamp formatting) from that prototype, adapted to our actual
   design-system tokens (see §6).

### Phase 3 — Visual restyle from the v0 "neon glass" prototype

**Reference:** `.assets/neon-glass-design-system/` — confirmed by the user as the intended visual direction
(non-functional prototype, built with our tech stack but without knowledge of our actual design tokens).

Concrete component mapping (prototype → our real implementation):

| Prototype file | Maps to | Action |
|---|---|---|
| `components/omnibar/omnibar.view.tsx` | `OmniBarPresentation.tsx` | Adopt the 3-mode layout logic (home-centered / FAB+overlay), re-skin with our actual `--color-*` tokens instead of the prototype's own token guesses |
| `components/omnibar/molecules/omnibar-composer.view.tsx` | `OmniInputPill.tsx` | Match the pill shell styling (rounded-full border, `OmnibarPerimeterView` animated border), already structurally similar — align spacing/radius tokens |
| `components/omnibar/organisms/omnibar-timeline.view.tsx` | New transcript view (Phase 2) | Port the scrollable timeline shell, mask-image fade at top, "Clear" affordance |
| `components/omnibar/molecules/message-event.view.tsx` | New message bubble component | Port `flex-row-reverse` + asymmetric radius alignment logic |
| `components/omnibar/molecules/activity-event.view.tsx` | Thought-trace step (Phase 4) | Port the "title + detail + working/complete" shape as the inner row of each collapsed trace step |
| `components/omnibar/molecules/metrics-event.view.tsx` | Artifact column metric card | Port 3-column metric tile grid into the new second-column artifact renderer |
| `components/omnibar/molecules/operation-event.view.tsx` | Artifact column "change"/"ingestion" card | Port the review/apply button pattern for suggested changes |
| `lib/omnibar/types.ts` (`OmnibarEvent` union) | Extend `OmniMessage` schema | The prototype's tagged-union event model (`user | agent | activity | uploads | metrics | change | ingestion`) is cleaner than our current single flat `OmniMessage` with optional fields — consider narrowing our schema toward this discriminated-union shape as part of the Phase 2 rebuild, since it directly enables the trace-grouping and artifact-column logic without ad hoc type-narrowing |

None of the prototype's actual token values (colors, spacing) should be copied verbatim — it doesn't know
our design system. Only the **structure, motion patterns, and information architecture** should be ported;
visual values must resolve through our real `--color-*`/`--ds-*` CSS variables.

### Phase 4 — Thought-trace collapsing + artifact column

**New component:** `packages/design-system/src/components/OmniBar/ThoughtTrace.tsx`

- Groups consecutive `agent_step` messages between two non-`agent_step` messages into one collapsed
  accordion, header = "Worked for Ns" (compute from first/last timestamp in group) or "Working..." while
  `isLoading !== false`, expand to show each step.

**New component:** `packages/domain-inventory/src/components/ArtifactColumn/` (Container/View pair)

- Mobile-first two-column layout: conversation transcript (always visible, primary) + a collapsible second
  column that is populated whenever a `render_component` message or ingestion-review directive appears.
  On mobile, the artifact column is a bottom-sheet/full-screen overlay toggled by a badge/button in the
  chat stream ("View result →"); on desktop it's a persistent side-by-side scrollable panel.
- Move `UniversalReviewComponent`, revenue/ticket charts, prep lists, and search results out of being
  inline `render_component` swaps in the transcript and into this column exclusively.

Validation: Storybook story exercising a mixed history array with 3 consecutive agent_steps + user + model
+ one render_component directive, confirming the artifact renders in the side column, not inline.

### Phase 5 — Sticky composer + polish

- In the new view component, wrap the transcript + `OmniInputPill` in a flex column with the input
  `sticky bottom-0` inside the scroll container (Claude Code layout), instead of the current
  viewport-fixed floating pill, when in `/home?chat=` mode specifically. Keep the floating pill behavior
  for the fresh `/home` and workspace-FAB modes unchanged.

### Phase 6 — PWA Share-Target ingestion follow-through

`manifest.ts`'s `share_target` posts `title`/`text`/`url` as GET query params to `/home`. Currently
`HomePage` only reads `chat`/`prompt`. Add handling: if `title`/`text`/`url` present without `chat`,
auto-create a conversation id, seed `inputText` with the shared text/url, and auto-open the pill.

---

## 5. Dead Code Removed (completed this session)

- Deleted `packages/design-system/src/components/OmniBar/OmniChatWindow.tsx` and
  `OmniChatAtoms.tsx` — confirmed via knip + grep as unreferenced by anything except each other and the
  barrel `index.ts`. `AnswerView` (the component actually mounted at `/home?chat=`) never imported them.
- Removed the now-dead `OmniMetric`, `OmniChatWindowProps`, `OmniChatWindow` re-exports from
  `packages/design-system/src/components/OmniBar/index.ts`.
- Verified with `tsc --noEmit` on `packages/design-system` — no new errors introduced (2 pre-existing,
  unrelated errors remain in `use-omni-actions.hook.ts` about generated API path types).
- Left the other 3 knip-flagged OmniBar files (`CreateItemButton.tsx`, `ItemSelectionDropdown.tsx`,
  `NonInventoryExpenseCheckbox.tsx`) untouched — out of scope for this cleanup pass per explicit user
  instruction; revisit separately if desired.

---

## 6. Tooling Architecture: Co-located Tools + IoC Registration

### Current state
`commands-tools.ts` is a flat file exporting 14 plain-object JSON-schema tool definitions with **zero
connection to NestJS's dependency injection** — the actual tool *behavior* lives in one giant if/else chain
inside `commands.service.ts`, manually wired to services injected into `CommandsService`'s constructor
(`PurchaseOrdersService`, `VendorsService`, `WhiteboardService`, `RecipeCostService`, `Neo4jService`, the
ingestion `Queue`). Adding a new tool means: (1) add a schema object to `commands-tools.ts`, (2) add it to
`ALL_COMMAND_TOOLS`, (3) add a new `else if` branch in the 790-line service, (4) possibly add a new
constructor dependency to `CommandsService` even though that logic belongs to a different domain module.
This does not scale and is the direct cause of "we can't even think about expanding it yet."

### Target architecture: `AgentTool` provider pattern via NestJS DI

1. **Define a common contract** in a new shared location, e.g. `packages/api-types/src/agent-tool.ts`:
   ```ts
   export interface AgentToolDefinition {
     name: string;
     description: string;
     parameters: JSONSchema; // existing shape from commands-tools.ts
   }
   export interface AgentTool<TArgs = any, TResult = any> {
     definition: AgentToolDefinition;
     execute(args: TArgs, ctx: AgentToolContext): Promise<TResult>;
   }
   export interface AgentToolContext {
     orgId: string;
     userId?: string;
     conversationId: string;
     emitMessage?: (msg: OmniMessage) => void;
   }
   ```
2. **Introduce an `AGENT_TOOL` DI token** (NestJS multi-provider, `@Injectable()` classes registered with
   `{ provide: AGENT_TOOL, useClass: AddToPurchaseOrderTool, multi: true }`-style pattern, or a custom
   `@RegisterAgentTool()` class decorator that self-registers into a `DiscoveryModule`-powered registry at
   bootstrap, consistent with NestJS's `DiscoveryService` pattern for plugin-style collection).
3. **Co-locate each tool with its owning domain module**, e.g.:
   - `apps/api/src/modules/items/tools/add-to-purchase-order.tool.ts` (depends on
     `PurchaseOrdersService`/`VendorsService`, both already local to that module)
   - `apps/api/src/modules/items/tools/add-to-whiteboard.tool.ts`
   - `apps/api/src/modules/recipe/tools/get-recipe-cost.tool.ts`
   - `apps/api/src/modules/unified-ingestion/tools/ingest-document.tool.ts`
   - `apps/api/src/modules/neo4j-sync/tools/execute-cypher-query.tool.ts`
   - `apps/api/src/modules/pos/tools/get-pos-sales-stats.tool.ts`
   - Generic/cross-cutting tools (`render_ui_component`, `enqueue_background_task`, `search_the_web`,
     `update_review_state`) can live in a new `apps/api/src/modules/commands/tools/` subfolder since they
     don't belong to any single domain.
   Each module already imports the services its tool needs — DI just injects them into the tool class
   instead of into `CommandsService`.
4. **New `AgentToolRegistryService`** (in `commands` module) collects all registered `AgentTool` providers
   at boot via NestJS `DiscoveryService`, exposes `getAllToolDefinitions()` (replaces
   `ALL_COMMAND_TOOLS.map(...)` in the LiteLLM payload builder) and `execute(name, args, ctx)` (replaces the
   giant if/else chain with a `Map<string, AgentTool>` lookup).
5. **Refactor `CommandsService.handleCommand`** to depend only on `AgentToolRegistryService` — drops from
   790 lines to roughly 150 (just the ReAct loop: call LiteLLM, detect tool_calls, dispatch through the
   registry, push results back into `contents`, repeat).
6. **Each domain module's `*.module.ts`** adds its own tool provider(s) to its `providers` array and, if
   using a decorator/multi-provider pattern, no further wiring is needed — `CommandsModule` only needs to
   import those modules (which it already does for `ItemsModule`, `RecipeModule`, `Neo4jSyncModule`) plus
   any newly-tool-bearing modules (`UnifiedIngestionModule`, `PosModule`).

This gives a clean path to "there are a lot more tools that need to be added" — new tools become
self-contained files inside the module that owns the underlying capability, with no changes required to
`commands.service.ts` itself.

---

## 7. Chat History Persistence: Ground-Up Fix

Current reality (confirmed by tracing the code, not assumed): **the only writes to `chat_messages` come
from `commandsGateway.emitIngestionUpdate()`**, and only for `agent_step`/`render_component` messages tied
to an active ingestion job — and even those are misattributed to a fake org (`"unknown"` → demo org
fallback, see Problem #1). The three most common message types in an ordinary conversation —
**the user's own message, the model's plain-text reply, and every other tool's `agent_step` status
line emitted directly from `handleCommand`** — are **never persisted at all**. `getConversationMessages`
therefore returns an almost-always-empty or drastically incomplete list, which is why reloading
`/home?chat=<id>` effectively wipes the conversation.

### Required fixes (expands Phase 0)

1. **Persist the user's message immediately on receipt**, before calling LiteLLM, inside
   `CommandsGateway.handleExecuteCommand` (or at the top of `CommandsService.handleCommand`) — using the
   *real* `orgId`/`userId` already resolved from the authenticated socket.
2. **Persist every `agent_step` message** at the same point it's `emitMessage`'d inside the tool-dispatch
   loop in `handleCommand` — not just the ones routed through `emitIngestionUpdate`.
3. **Persist the final assistant (`model`) reply** and the `render_component` directive messages emitted
   at the end of `handleCommand`.
4. **Persist `render_component`/ingestion-status messages from `emitIngestionUpdate` with the correct
   `orgId`** (ties into Phase 0 item 1).
5. **Update `chat_conversations.updated_at` and `title`** on each new message — currently the title is
   hardcoded to `"New Conversation"` forever and never refreshed, so the conversation list (Phase 1) would
   have nothing meaningful to display. Auto-generate a title from the first user message (simple
   truncation is fine initially; could use a cheap LLM summarization call later).
6. **Idempotency / ordering guarantee**: since messages currently arrive from two different code paths
   (direct `emitMessage` in `handleCommand`, and `emitIngestionUpdate` from the BullMQ processor running in
   a separate worker process), persisted rows must carry a strictly increasing `created_at` or a sequence
   column so that reloading a conversation always renders turns in the order they actually happened,
   even when the ingestion worker and the live chat gateway write concurrently. This directly feeds the
   "duplicate/out-of-order messages" bug in §8 — the two write paths need to funnel through one persistence
   choke point (e.g., a single `ChatPersistenceService.appendMessage()` used by both the gateway and the
   processor) rather than each calling `supabase.from("chat_messages").insert()` independently.
7. **Background-safe behavior**: because ingestion runs in a BullMQ worker decoupled from any open socket
   connection, the "leave the page immediately after triggering an ingestion, come back later and it's
   done" requirement is *already structurally possible* (the processor runs regardless of client
   connection) — but only once messages are reliably persisted (#1–#4) and the conversation list (Phase 1)
   lets the user navigate back to find it. The existing `notifications` insert + `notification:new` socket
   emit in `emitIngestionUpdate` already covers the "send a notification when done" requirement structurally,
   it just needs the `orgId`/`userId` fix from Phase 0 to reach the correct user.

---

## 8. WebSocket Reliability Fixes

### Diagnosed root causes

1. **Auth token race on reconnect**: `packages/api-client/src/websocket.ts` builds `socket.auth` as an
   async callback (`auth: async (cb) => cb({ token: options.token })`), but `options.token` is captured
   **once at socket-creation time** in `use-omni-socket.hook.ts` (`createWebSocketClient({ namespace:
   "/commands" })` — no `token` or `getToken` is ever passed in). This means the socket is created with
   `token: undefined` from the very first connection, and the `auth` callback will keep returning
   `undefined` forever, since nothing ever updates `options.token` after creation. The
   `WsSupabaseAuthGuard` on the server then legitimately rejects the connection or accepts it only if
   cookies happen to carry a valid `sb-access-token` — explaining "the socket appears connected until you
   send a message and it says no auth token": the initial handshake may succeed via cookie fallback, but
   the guard re-validates per-message context and finds nothing once the cookie expires or isn't present
   in the WS upgrade path.
2. **Reauthentication doesn't actually refresh the socket's own auth payload with a real token.** In
   `websocket.ts`'s `handleAuthError`, after `refreshAuthSession()` succeeds, it tries `options.getToken?.()`
   — but since `use-omni-socket.hook.ts` never supplies a `getToken` callback either, `newToken` stays
   `undefined`, and the code sets `socket.auth = { ...socket.auth, token: undefined }` — a no-op. The
   reconnect therefore retries with the exact same missing-token state that caused the failure, so the
   self-healing loop cannot actually succeed; it just reconnects into the same broken state (matching the
   reported "doesn't heal itself, user has to reload or re-login").
3. **No token source wired end-to-end.** There is no evidence in `use-omni-socket.hook.ts` of pulling the
   current Supabase session's access token (e.g., from a shared `supabase.auth.getSession()` call or a
   client-side auth context) to pass as `getToken` into `createWebSocketClient`. The REST `api-client` must
   have a working equivalent (cookies/bearer refresh) since "the rest of the system is logged in just
   fine" — but the WS layer was never connected to that same source.
4. **Duplicate/out-of-order messages** — two independent causes converge here:
   - Reconnect logic in `use-omni-socket.hook.ts`'s `handleReauthenticated` **re-emits the last full
     command payload** (`wsSocket.emit("executeCommand", lastPayloadRef.current)`) whenever a
     `reauthenticated` event fires. If the server had *already* processed part of the original request
     before the auth blip (e.g., had emitted some `agent_step`s already), replaying the entire command
     causes the LLM tool loop to run again from scratch, duplicating every step and the final reply.
   - Cross-process write races described in §7 item 6 (gateway path vs. BullMQ processor path both writing
     `chat_message` and to Postgres independently, with client-side `addMessage` appending in socket-arrival
     order rather than a persisted, authoritative sequence) cause visual out-of-order rendering even when
     the underlying data is eventually consistent.

### Required fixes

**CORRECTION (per explicit user instruction): no client-side code outside `apps/api` may reference or know
that Supabase exists — this is a hard architectural rule ("The Supabase Firewall"). The originally-drafted
fix below of calling `supabase.auth.getSession()` client-side is WRONG and must not be implemented. The
correct fix uses a new REST endpoint, exactly like every other client/server interaction in this codebase.**

1. **Add a new `POST /auth/ws-ticket` endpoint in `apps/api/src/modules/auth/auth.controller.ts`**, guarded
   by the existing `SupabaseAuthGuard` (cookie-based, already working for all other REST calls). This
   endpoint reads the already-validated Supabase access token cookie (the guard already decodes it into
   `request.user`) and returns a short-lived value the client can use as its WS auth token — either (a) the
   literal current access token string (simplest, since it's already short-lived and httpOnly-cookie-scoped
   server-side context, not exposed to any other client code) or (b) a separate signed ticket if we want an
   extra layer of indirection. Simplest correct option: return `{ token: <the sb-access-token cookie value> }`
   as JSON. Only `apps/api` ever touches `supabase` to produce this value.
2. **Client fetches this ticket via the normal `api-client`**, not Supabase: in
   `packages/design-system/src/components/OmniBar/use-omni-socket.hook.ts`, call
   `api.POST("/auth/ws-ticket")` (same `api-client` used everywhere else in the app, which already carries
   the httpOnly cookie automatically via `credentials: "include"`) to obtain the token, then pass it into
   `createWebSocketClient({ namespace: "/commands", getToken: async () => (await api.POST("/auth/ws-ticket")).data.token })`.
   This satisfies the existing `getToken` callback contract in `packages/api-client/src/websocket.ts` without
   any package outside `apps/api` ever importing or referencing a Supabase client.
3. **Fix the reauthentication token refresh to actually produce a new token.** After
   `refreshAuthSession()` succeeds inside `websocket.ts`'s `handleAuthError`, `getToken()` must be called
   fresh (it now hits `/auth/ws-ticket` again, which reads the freshly-refreshed cookie) so `newToken` is
   real and not `undefined`.
4. **Stop blind full-payload replay on reauthentication.** Instead of re-emitting the entire
   `lastPayloadRef.current`, track whether the original `executeCommand` actually got a server-side ack
   before the disconnect; only resume/retry if it did not, and prefer an idempotency key
   (`conversationId` + a client-generated `requestId`) so the server can dedupe a retried request rather
   than reprocessing it from scratch.
5. **Route all persisted-message reads through server order, not client arrival order**, once §7's
   persistence fixes land — i.e., after reconnecting or reloading, re-fetch
   `GET /commands/conversations/:id/messages` (already ordered by `created_at`) as the source of truth
   rather than trusting whatever partial/duplicate stream arrived over the socket during the blip.
6. **Server-side**: `WsSupabaseAuthGuard` currently throws `WsException` on any missing/invalid token with
   no distinction between "never authenticated" and "token expired mid-session" — consider a grace-period
   or explicit `token_expired` event distinct from generic `Unauthorized` so the client's
   `handleAuthError` can react more precisely (right now it pattern-matches on message substrings like
   `"expired"`/`"jwt expired"`, which is brittle).

Validation: manually let a Supabase session token expire (or force-expire in dev), confirm sending a chat
message during that window triggers exactly one silent reconnect-and-resend with a valid new token, no
duplicate assistant replies, and no forced page reload/re-login required.

---

## 9. Ingestion Review Screens: Ground-Up Rebuild

### Current state (see also Problems #9, #10, #11 in §2)

`UniversalReviewComponent.tsx` (polymorphic page/block navigator) + `UnifiedReviewPanel.tsx` +
`UnifiedItemRow.tsx` render every extracted field (invoice line items, recipe ingredients, prose blocks) as
permanently-open form controls, with a "waterfall" of tenant-match and USDA-match tables per item. This is
the screen the user explicitly wants rebuilt "so eventually there really shouldn't even be anything you
need to review."

### Rebuild direction

1. **Static-text-by-click editing pattern.** Every field (vendor name, line-item name, quantity, unit,
   price, recipe title, yield, ingredient name) renders as plain styled text by default; a single click/tap
   swaps that field into its editable control (text input, quantity stepper, or the existing
   `CreatableSelect`/`ItemSelectionDropdown` for item-matching) and commits back to static text on
   blur/confirm. This directly replaces the current always-editable-input UI.
2. **Confidence-gated auto-acceptance.** Only surface a mapping for manual review when the top pgvector
   tenant match and/or top USDA match falls below a confidence threshold (or when there are multiple
   near-tied candidates); high-confidence matches should auto-apply and render as plain confirmed text
   with a small "AI-matched" indicator, not another row the user has to act on. This is the concrete
   mechanism for "eventually there shouldn't be anything to review."
3. **Feed the alias table back into ranking (closes the learning loop).** `searchMasterItemsTop5` currently
   only queries `match_master_items` (pgvector similarity) — it must be extended to first check
   `vendor_item_aliases` (already written to by `handleConfirmAlias` via `POST /ingestion/alias`) for an
   exact/fuzzy match on `vendor_item_string` for the given vendor, and short-circuit to that confirmed
   mapping before falling back to embedding search. Without this, every previously-confirmed alias is
   dead-written data that never improves future extractions — which is exactly the complaint that "the
   waterfall... [is meant] to help the learning process but... needs to be improved."
4. **Mandatory USDA linkage for ingredient-type items.** Do not silently default `selectedUsdaId` to
   whatever happens to be at index 0 of an unranked list. **Confirmed via the FDC API's own OpenAPI spec:
   `GET /v1/foods/search` already returns a `score` field (type `number`, "Relative score indicating how
   well the food matches the search criteria") on every `SearchResultFood` result.** `usda-resolver.service.ts`'s
   `searchTop5()` currently discards this field (`return data.foods.slice(0,5).map(f => ({ fdcId, description }))`)
   — it must be extended to also return `score`, and the ingestion processor must carry that score through
   to `usdaMatches` so the review UI can gate on it (e.g., auto-accept only if top score exceeds a threshold
   AND clears the runner-up by a minimum margin; otherwise flag as `needsUsdaVerification`). For our OWN
   tenant matches (`searchMasterItemsTop5`, pgvector-based), there is no API-provided score, but
   `match_master_items` already computes cosine similarity internally (`match_threshold: 0.2` is already
   being used as a cutoff) — that similarity value must likewise be returned and threaded through to the UI
   as the tenant-match confidence, computed server-side (not guessed client-side), since it's already being
   computed by the RPC and simply not being returned to the caller today.
5. **Collapse the redundant "waterfall of tables"** into the single click-to-edit row model from #1 — i.e.,
   the tenant-match table and USDA-match table currently rendered as separate stacked UI blocks per item
   should become one compact row with a match chip that expands to show alternates only when clicked, not
   a permanently-rendered waterfall of every candidate for every item.
6. **Surface extraction failure honestly.** Per Problem #9, when `unified-ingestion.processor.ts` falls
   back to `buildFallbackBlocks` because the real vision call failed, the review screen must show an
   explicit "extraction failed — showing placeholder, please re-upload or retry" banner rather than
   presenting the hardcoded sample data as if it were real extracted content.

This rebuild depends on Phase 4's artifact-column work (§4) — the rebuilt review screen becomes the primary
content rendered in that second column rather than swapped inline into the chat transcript.

---

## 10. Image Parsing Reliability

Directly expands Problem #9. Concrete fixes for `unified-ingestion.processor.ts`'s `extractPageBlocks`:

1. **Stop silently swallowing vision-call failures.** Replace the bare `catch (err) { this.logger.error }`
   with a typed result (`{ ok: true, blocks } | { ok: false, reason }`) so the caller can distinguish "model
   returned zero blocks because the page was genuinely blank" from "the vision request itself errored,"
   and propagate the failure reason all the way to the review screen banner described in §9 item 6.
2. **Verify the model alias is actually vision-capable.** The hardcoded `model: "gemini-3.6-flash"` string
   should be validated against `litellm_config.yaml`'s configured model list at startup (or replaced with a
   named constant sourced from config) rather than a magic string that silently 404s/400s if the LiteLLM
   routing table changes.
3. **Add basic image preprocessing safeguards**: check `imageRes.ok` and content-type before base64-encoding
   (already partially done), but also cap image size/resolution (downscale extremely large phone-camera
   photos before sending to the vision endpoint) and retry once with a fresh signed URL if the first fetch
   returns a transient error — camera-uploaded images from a PWA share-target are frequently very large.
4. **Return structured per-page confidence/diagnostics** from the vision call (e.g., ask the model to
   report `pageQuality: "clear" | "blurry" | "partial"` alongside the blocks) so the review UI can warn the
   user proactively for likely-bad scans instead of just showing wrong data with no signal.
5. **Add a manual retry action** in the (rebuilt) review screen that re-triggers `extractPageBlocks` for a
   single page without re-running the entire ingestion job, so a one-page misfire doesn't require
   re-uploading the whole document.

---

## 11. Suggested Issue Breakdown (GitHub, following AGENTS.md templates) — NOT YET FILED

Per explicit instruction, issues are not being created yet; this section is retained as a planning
reference for when filing is requested.

- **Epic**: "Omnibar Chat UI Overhaul, Persistence & Tooling Architecture" (references this doc)
  - Task 1: Fix `orgId` placeholder + full-turn persistence in commands.gateway/service (§4 Phase 0, §7)
  - Task 2: WebSocket auth token wiring + reconnect/dedupe fix (§8)
  - Task 3: Add `GET /commands/conversations` list endpoint (per-user) (§4 Phase 1)
  - Task 4: Build `ConversationHistory` container/view + sidebar wiring (§4 Phase 1)
  - Task 5: Container/View split of `AnswerView` + new transcript renderer informed by v0 prototype (§4 Phase 2, §6 visual mapping)
  - Task 6: Visual restyle pass from `.assets/neon-glass-design-system` (§4 Phase 3)
  - Task 7: `ThoughtTrace` accordion + mobile-first Artifact Column (§4 Phase 4)
  - Task 8: Sticky composer for active-chat mode (§4 Phase 5)
  - Task 9: PWA share-target → prefilled Omnibar chat (§4 Phase 6)
  - Task 10: Extract `AgentTool` DI contract + registry service (§6)
  - Task 11: Migrate all 14 existing tools into co-located, module-owned `*.tool.ts` files (§6)
  - Task 12: Ingestion review screen rebuild — click-to-edit fields, confidence-gated auto-accept,
    alias-table-first matching, mandatory USDA linkage signaling (§9)
  - Task 13: Image parsing reliability — structured failure surfacing, model-alias validation, retry
    action, page-quality diagnostics (§10)

## 12. Open Questions — ALL RESOLVED

1. **Resolved.** `gh` CLI confirmed working (GitHub MCP tools remain broken — bad credentials for
   `conarwelsh`). Use `gh` CLI for all issue filing.
2. **Resolved: option (a).** Use a custom `@RegisterAgentTool()` class decorator +
   `DiscoveryService`-based auto-registration for the `AgentTool` DI pattern (§6), not explicit
   manual multi-provider listing. Tradeoff accepted: this scales better as tool count grows at the cost
   of being slightly less greppable/explicit than manual registration — acceptable given the stated goal
   of significantly expanding the tool count going forward.
3. **Resolved.** Confirmed via the official USDA FDC API OpenAPI/JSON spec
   (`https://api.nal.usda.gov/fdc/v1/json-spec`) that `GET /v1/foods/search` already returns a native
   `score` field (`number`) on every `SearchResultFood` result — "Relative score indicating how well the
   food matches the search criteria." No client-side confidence computation is needed for USDA matches;
   `usda-resolver.service.ts` must simply stop discarding this field and thread it through. For our own
   tenant/pgvector matches there is no external API score, but `match_master_items` already computes
   cosine similarity server-side (already used for the `match_threshold: 0.2` cutoff) — that value must
   likewise be returned to the caller instead of computing anything approximate client-side.

**Correction logged this session:** the WebSocket auth fix in §8 was initially drafted as calling
`supabase.auth.getSession()` from client code. This violated the hard "Supabase Firewall" rule in
AGENTS.md and has been corrected in §8 to use a new `apps/api`-only `POST /auth/ws-ticket` REST endpoint
fetched via the normal `api-client`, keeping all Supabase knowledge inside `apps/api`.
