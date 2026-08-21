import {
  createClient as createBaseUrqlClient,
  fetchExchange,
  subscriptionExchange,
  type Client,
  type ClientOptions,
  type Exchange,
} from "urql";
import {
  cacheExchange,
  offlineExchange,
  type CacheExchangeOpts,
} from "@urql/exchange-graphcache";
import { clientConfig as config } from "@soustools/config/client";
import { defaultCacheConfig } from "./urql-cache";
import { createUrqlAuthExchange } from "./urql-auth";
import { getSubscriptionWsClient } from "./urql-ws";

export * from "./urql-cache";
export * from "./urql-auth";
export * from "./urql-ws";

export interface UrqlClientOptions {
  url?: string;
  wsUrl?: string;
  headers?: Record<string, string>;
  fetchOptions?: RequestInit | (() => RequestInit);
  cacheConfig?: Partial<CacheExchangeOpts>;
  exchanges?: Exchange[];
  clientOptions?: Partial<ClientOptions>;
}

/**
 * Creates a fully-configured URQL Client instance with Graphcache optimistic UI,
 * automatic 401 interception via @urql/exchange-auth with session refresh mutex,
 * and transparent WebSocket subscriptions.
 */
export function createUrqlClient(options: UrqlClientOptions = {}): Client {
  const baseUrl = options.url || config.NEXT_PUBLIC_API_URL;
  const url = baseUrl.endsWith("/graphql")
    ? baseUrl
    : `${baseUrl.replace(/\/$/, "")}/graphql`;

  const wsUrl = options.wsUrl || url.replace(/^http/, "ws");

  const graphCacheOpts: CacheExchangeOpts = {
    ...defaultCacheConfig,
    ...options.cacheConfig,
  };

  const selectedCacheExchange = graphCacheOpts.storage
    ? offlineExchange({
        ...graphCacheOpts,
        storage: graphCacheOpts.storage,
      })
    : cacheExchange(graphCacheOpts);

  const auth = createUrqlAuthExchange(options.headers);

  const subscriptionEx = subscriptionExchange({
    forwardSubscription(request) {
      const input = { ...request, query: request.query || "" };
      return {
        subscribe(sink) {
          const wsClient = getSubscriptionWsClient(wsUrl, options.headers);
          if (!wsClient) {
            return { unsubscribe: () => {} };
          }
          const dispose = wsClient.subscribe(input, sink);
          return {
            unsubscribe: dispose,
          };
        },
      };
    },
  });

  const exchanges: Exchange[] = options.exchanges || [
    selectedCacheExchange,
    auth,
    fetchExchange,
    subscriptionEx,
  ];

  return createBaseUrqlClient({
    url,
    fetchOptions: () => {
      const customFetchOpts =
        typeof options.fetchOptions === "function"
          ? options.fetchOptions()
          : options.fetchOptions || {};

      return {
        credentials: "include",
        headers: {
          ...options.headers,
        },
        ...customFetchOpts,
      };
    },
    exchanges,
    ...options.clientOptions,
  });
}

/**
 * Singleton URQL client instance.
 */
export const urqlClient: Client = createUrqlClient();
