# WebSocket Diagnosis Report

## Root Causes Found

### Bug 1 — `exception` event sends `{}` (empty object) to client [CRITICAL]
**File:** [`ws-exception.filter.ts`](file:///home/conar/code/sous.tools/apps/api/src/common/filters/ws-exception.filter.ts)

The `AllWsExceptionsFilter` does **not** call `super.catch()`. It catches `WsException` objects thrown by the auth guard and builds its own `errorMsg` from `exception.message`. But `WsException` from NestJS stores the error payload in `exception.getError()`, **not** `exception.message`. So `exception instanceof Error` is `false` for a `WsException`, the string fallback `"Internal server error"` fires, but even worse — the `WsException` constructor wraps a string payload, so `exception.message` is `"Websocket Exception"` (the generic NestJS message), not the auth message.

The client receives `{ state: 'error', message: 'Internal server error' }` — an object with no `Unauthorized` keyword — so the `handleException` in `use-omni-socket.hook.ts` logs it but **the auth-refresh path never triggers** (because `error.message` is `"Internal server error"`, not `"Unauthorized"`).

**Fix:** Extract the WsException payload properly using `getError()`.

---

### Bug 2 — `reauthenticated` emitted *before* reconnect completes [HIGH]
**File:** [`websocket.ts`](file:///home/conar/code/sous.tools/packages/api-client/src/websocket.ts#L104-L108)

```ts
socket.disconnect();
socket.connect();
socket.emit("reauthenticated"); // ← emitted synchronously, BEFORE connect fires
```

`socket.connect()` is async. The `emit("reauthenticated")` fires immediately on the still-disconnecting socket. The client-side `handleReauthenticated` handler runs but `wsSocket.connected` is `false`, so the command replay is silently dropped.

**Fix:** Move the `reauthenticated` emit inside the `connect` event handler after a reconnect, using a one-time flag.

---

### Bug 3 — `useOmniSocket` creates a NEW socket on every render dependency change [HIGH]
**File:** [`use-omni-socket.hook.ts`](file:///home/conar/code/sous.tools/packages/design-system/src/components/OmniBar/use-omni-socket.hook.ts#L140)

```ts
}, [addMessage, setIsProcessing, markLoadingComplete]);
```

These context functions (likely recreated on every render without `useCallback`) are in the dependency array of the socket-creation `useEffect`. Every time the context re-renders, a **new socket is created, connected, and the old one disconnected**. This causes:
- Constant connect/disconnect churn
- Missed messages during reconnect
- The exception `{}` spam (every fresh socket triggers the WsSupabaseAuthGuard)

**Fix:** Stabilize the effect deps using `useRef` for the callbacks and an empty `[]` dependency array — the socket should be created once per mount.

---

### Bug 4 — POS & KDS containers create raw sockets without any auth guard [MEDIUM]
**Files:** 
- [`pos.container.tsx`](file:///home/conar/code/sous.tools/packages/domain-pos/src/components/POSRegister/pos.container.tsx#L61-L64)
- [`kds.container.tsx`](file:///home/conar/code/sous.tools/packages/domain-pos/src/components/KDS/kds.container.tsx#L64-L67)

These create sockets inside `useEffect` with `[]` deps (correct), but they don't clean up the socket's event listeners before disconnect — they just call `socket.disconnect()`. If `loadCatalog` / `fetchOrders` are defined inside the `useEffect`, this is fine. But the created socket also has no error handling at all — no `connect_error`, `reconnect_failed`, or `exception` handlers. A silent failure here goes unnoticed.

Also, the `/pos` gateway has `cors: { origin: "*" }` — a wildcard in production is a security issue.

---

### Bug 5 — `use-display-player.ts` socket re-created when `display?.deckId` changes [MEDIUM]
**File:** [`use-display-player.ts`](file:///home/conar/code/sous.tools/apps/web/src/app/display/%5Bid%5D/use-display-player.ts#L148)

```ts
}, [displayId, display?.deckId, fetchDisplayAndLayout]);
```

`display?.deckId` being null on first render means the socket connects with `deckId: ""`. When display data loads, `deckId` becomes a real UUID, the effect re-runs, the old socket is destroyed and a new one created. The `join` event sent on the first connection was to the wrong room and is now gone.

**Fix:** Always emit `join` in `handleConnect` (already done), but also emit `join` immediately after the socket is already connected when `deckId` becomes available. Use a separate effect that only watches `display?.deckId` to emit `join` if the socket is already connected.

---

### Bug 6 — `signage.gateway.ts` uses default namespace (no namespace isolation) [LOW]
**File:** [`signage.gateway.ts`](file:///home/conar/code/sous.tools/apps/api/src/modules/signage/signage.gateway.ts#L16)

```ts
@WebSocketGateway({ cors: { origin: "*" } })
```

No `namespace` is set — this gateway is on the default `/` namespace. This means all sockets that connect to the API root (including any future default-namespace clients) share the same server. Should be `namespace: "/signage"`.

---

## Fix Plan

| Priority | Bug | File(s) |
|---|---|---|
| 🔴 Critical | Exception filter loses WsException payload | `ws-exception.filter.ts` |
| 🔴 Critical | `useOmniSocket` recreates socket on re-render | `use-omni-socket.hook.ts` |
| 🟠 High | `reauthenticated` emitted before reconnect | `websocket.ts` |
| 🟡 Medium | POS/KDS sockets have zero error handling | `pos.container.tsx`, `kds.container.tsx` |
| 🟡 Medium | Display player socket re-created on deckId change | `use-display-player.ts` |
| 🟢 Low | Signage gateway on default namespace | `signage.gateway.ts` |
