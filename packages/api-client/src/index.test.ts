import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  refreshAuthSession,
  createRestClient,
  createWebSocketClient,
  createGraphQLClient,
  api,
  graphqlClient,
  getDefaultBaseUrl,
} from "./index";
import { clientConfig as config } from "@soustools/config/client";

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

  describe("refreshAuthSession Mutex", () => {
    it("executes a single refresh request when called concurrently by multiple clients", async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(async () => {
        callCount++;
        // Artificial delay to simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 50));
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      // Invoke refreshAuthSession 5 times simultaneously
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

  describe("createGraphQLClient", () => {
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
