### Implementation Plan: WebSocket Connection Lifecycle and Authentication Management

This plan translates the ADR into actionable engineering tasks, ensuring the architectural constraints defined in our project rules (e.g., pure transport layer, no `process.env` in the package) are strictly maintained.

#### Phase 1: `api-client` Foundation (The Singleton & IoC)
*Location: `@packages/api-client`*

1. **Define Types and Interfaces**
   - Create `SocketConfig` interface defining the required IoC callbacks: `onTokenRefresh: () => Promise<string>`, `onLogout: () => void`, and backend URL (injected via `@soustools/config`).
   - Define types for the internal message queue (e.g., event name, payload, and callback).
2. **Implement the Message Queue Buffer**
   - Create an internal FIFO queue array inside `SocketManager` to hold messages.
   - Implement `flushQueue()` which iterates over the queue and transmits messages sequentially when the connection is fully authenticated and established.
   - Implement `clearQueue()` for hard authentication failures (to avoid unbounded memory growth).
3. **Build the `SocketManager` Singleton**
   - Create the `SocketManager` class with a strict private constructor and a static `getInstance(config: SocketConfig)` method.
   - Wrap the native `socket.io-client` instance.
   - Create a wrapped `emit()` method. If the socket is disconnected or currently refreshing tokens, push the event to the queue. Otherwise, emit directly.
   - Listen for `Unauthorized` or specific auth-failure events from the NestJS server. On capture, pause `emit()`, invoke the `onTokenRefresh()` callback, update the socket's auth payload, reconnect, and call `flushQueue()`. If refresh fails, call `onLogout()` and `clearQueue()`.

#### Phase 2: Next.js Context Integration
*Location: `apps/web` & `apps/pos-simulator` (or shared `packages/design-system`/`packages/domain-*` if appropriate)*

1. **Create the `ApiProvider` Context**
   - Build a React Context (`ApiContext`) that will hold the initialized `SocketManager` instance.
   - In the `ApiProvider` component, instantiate the `SocketManager` singleton using `serverConfig` / `clientConfig` from `@soustools/config`.
   - Provide the implementations for `onTokenRefresh` (which should handle the centralized HTTP token refresh mutex and update browser cookies) and `onLogout` (which clears cookies and redirects to `/login`).
2. **Develop the `useApi()` Hook**
   - Create a custom hook `useApi()` that consumes `ApiContext`.
   - Ensure the hook throws a clear error if used outside of `ApiProvider`.
   - Expose the wrapped `emit` method, connection status, and typed event listeners.

#### Phase 3: Refactoring Existing Implementations
*Location: Across all Client Apps*

1. **Remove Direct `socket.io-client` Usage**
   - Search for all direct imports of `socket.io-client` in Next.js applications and domain packages.
   - Replace them with the `useApi()` hook.
2. **Consolidate Auth State**
   - Ensure that the REST/GraphQL clients are tapping into the same token refresh logic now managed by the `ApiProvider`/callbacks. This guarantees synchronized authentication state across transports.

#### Phase 4: Testing & Validation

1. **Simulate Token Expiration**
   - Force a token expiration while actively interacting with the UI (e.g., POS simulator). Verify that outgoing socket emissions are queued, the token is refreshed seamlessly, and the queue is drained upon reconnection.
2. **Verify Singleton Behavior (HMR/Strict Mode)**
   - Start the Next.js dev server. Perform multiple hot reloads and verify in the browser's Network tab that only a single WebSocket connection is active and that no connection leaks occur.
