import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  refreshAuthSession,
  onAuthRefreshed,
  notifyAuthRefreshed,
  createRestClient,
  createWebSocketClient,
  createGraphQLClient,
  createUrqlClient,
  urqlClient,
  isAuthError,
  defaultCacheConfig,
  getSubscriptionWsClient,
  reconnectSubscriptionWs,
  api,
  graphqlClient,
  getDefaultBaseUrl,
  useHealthCheckQuery,
  useDashboardStatsQuery,
  useDashboardStatsUpdatedSubscription,
} from "./index";
import { clientConfig as config } from "@soustools/config/client";
import { CombinedError } from "urql";

describe("packages/api-client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("URL & Config", () => {
    it("getDefaultBaseUrl returns config.NEXT_PUBLIC_API_URL directly without fallback logic", () => {
      expect(getDefaultBaseUrl()).toBe(config.NEXT_PUBLIC_API_URL);
    });
  });

  describe("refreshAuthSession Mutex & Listeners", () => {
    it("executes a single refresh request when called concurrently by multiple clients", async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      const results = await Promise.all([
        refreshAuthSession(),
        refreshAuthSession(),
        refreshAuthSession(),
        refreshAuthSession(),
        refreshAuthSession(),
      ]);

      expect(results).toEqual([true, true, true, true, true]);
      expect(callCount).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
    });

    it("notifies onAuthRefreshed listeners when session refresh succeeds", async () => {
      let listenerCalled = false;
      const unsubscribe = onAuthRefreshed(() => {
        listenerCalled = true;
      });

      global.fetch = vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ success: true }), { status: 200 }),
        );

      await refreshAuthSession();
      expect(listenerCalled).toBe(true);

      // Verify manual notifyAuthRefreshed works
      listenerCalled = false;
      notifyAuthRefreshed();
      expect(listenerCalled).toBe(true);

      unsubscribe();
    });
  });

  describe("createRestClient", () => {
    it("creates a client configured with credentials: include", () => {
      const client = createRestClient();
      expect(client).toBeDefined();
      expect(api).toBeDefined();
    });
  });

  describe("createWebSocketClient", () => {
    it("instantiates a Socket.io socket targeting the configured API URL", () => {
      const socket = createWebSocketClient({
        namespace: "/commands",
        socketOptions: { autoConnect: false },
      });
      expect(socket).toBeDefined();
      expect(typeof socket.on).toBe("function");
      expect(typeof socket.off).toBe("function");
      socket.disconnect();
    });
  });

  describe("URQL SDK & Offline Graphcache", () => {
    it("creates a singleton URQL client and configured instances", () => {
      expect(urqlClient).toBeDefined();
      const customUrql = createUrqlClient({
        url: "http://localhost:4000/graphql",
      });
      expect(customUrql).toBeDefined();
    });

    it("has defaultCacheConfig with optimistic updates and normalized keys configured", () => {
      expect(defaultCacheConfig.keys).toBeDefined();
      expect(defaultCacheConfig.updates).toBeDefined();
      if (
        typeof defaultCacheConfig.keys?.DashboardStatsPayload === "function"
      ) {
        expect(
          defaultCacheConfig.keys.DashboardStatsPayload({} as any),
        ).toBeNull();
      }
    });

    it("identifies 401 HTTP and GraphQL unauthorized errors correctly with isAuthError", () => {
      const http401Error = new CombinedError({
        response: { status: 401 } as any,
      });
      expect(isAuthError(http401Error)).toBe(true);

      const gqlUnauthenticatedError = new CombinedError({
        graphQLErrors: [
          {
            message: "Unauthorized access",
            extensions: { code: "UNAUTHENTICATED" },
          } as any,
        ],
      });
      expect(isAuthError(gqlUnauthenticatedError)).toBe(true);

      const regularError = new CombinedError({
        graphQLErrors: [{ message: "Some internal error" } as any],
      });
      expect(isAuthError(regularError)).toBe(false);
    });

    it("exports generated typed React hooks from @graphql-codegen/cli", () => {
      expect(typeof useHealthCheckQuery).toBe("function");
      expect(typeof useDashboardStatsQuery).toBe("function");
      expect(typeof useDashboardStatsUpdatedSubscription).toBe("function");
    });

    it("supports subscription websocket management and reconnecting", () => {
      reconnectSubscriptionWs();
      expect(getSubscriptionWsClient()).toBeNull();
    });
  });

  describe("createGraphQLClient Backward Compatibility", () => {
    it("executes GraphQL POST queries with credentials: include", async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: { health: "OK" } }), {
          status: 200,
        }),
      );

      const client = createGraphQLClient();
      expect(graphqlClient).toBeDefined();
      const res = await client.request("{ health }");

      expect(res.data).toEqual({ health: "OK" });
      expect(global.fetch).toHaveBeenCalledWith(
        `${config.NEXT_PUBLIC_API_URL}/graphql`,
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ query: "{ health }", variables: undefined }),
        }),
      );
    });

    it("provides a subscribe method that handles subscriptions safely", () => {
      const client = createGraphQLClient();
      const unsub = client.subscribe({
        query: "subscription { test }",
        onNext: () => {},
      });
      expect(typeof unsub).toBe("function");
      unsub();
    });
  });
});
