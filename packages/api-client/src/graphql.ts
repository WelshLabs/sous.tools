import { clientConfig as config } from "@soustools/config/client";
import { refreshAuthSession } from "./auth-session";
import { createClient, type Client } from "graphql-ws";

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, any> }>;
}

export interface GraphQLClientOptions {
  url?: string;
  wsUrl?: string;
  headers?: Record<string, string>;
}

export interface SubscriptionOptions<
  TData = any,
  TVariables extends Record<string, unknown> = Record<string, any>,
> {
  query: string;
  variables?: TVariables;
  onNext: (data: TData) => void;
  onError?: (error: unknown) => void;
  onComplete?: () => void;
}

export class GraphQLClient {
  private url: string;
  private wsUrl: string;
  private headers: Record<string, string>;
  private wsClient?: Client;

  constructor(options: GraphQLClientOptions = {}) {
    const baseUrl = options.url || config.NEXT_PUBLIC_API_URL;
    this.url = baseUrl.endsWith("/graphql")
      ? baseUrl
      : `${baseUrl.replace(/\/$/, "")}/graphql`;

    if (options.wsUrl) {
      this.wsUrl = options.wsUrl;
    } else {
      this.wsUrl = this.url.replace(/^http/, "ws");
    }
    this.headers = options.headers || {};
  }

  async request<TData = any, TVariables = Record<string, any>>(
    query: string,
    variables?: TVariables,
    requestInit?: RequestInit,
  ): Promise<GraphQLResponse<TData>> {
    const fetchQuery = async (): Promise<Response> => {
      return fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
          ...requestInit?.headers,
        },
        body: JSON.stringify({ query, variables }),
        credentials: "include",
        ...requestInit,
      });
    };

    let response = await fetchQuery();

    if (response.status === 401) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        response = await fetchQuery();
      }
    }

    if (!response.ok) {
      throw new Error(
        `GraphQL HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    const json: GraphQLResponse<TData> = await response.json();

    const hasAuthError = json.errors?.some(
      (e) =>
        e.message?.toLowerCase().includes("unauthorized") ||
        e.extensions?.code === "UNAUTHENTICATED",
    );

    if (hasAuthError) {
      const refreshed = await refreshAuthSession();
      if (refreshed) {
        const retryRes = await fetchQuery();
        if (retryRes.ok) {
          return retryRes.json();
        }
      }
    }

    return json;
  }

  getWsClient(): Client | null {
    if (typeof window === "undefined") {
      return null;
    }
    if (!this.wsClient) {
      this.wsClient = createClient({
        url: this.wsUrl,
        connectionParams: async () => {
          return {
            headers: this.headers,
          };
        },
      });
    }
    return this.wsClient;
  }

  subscribe<
    TData = any,
    TVariables extends Record<string, unknown> = Record<string, any>,
  >(options: SubscriptionOptions<TData, TVariables>): () => void {
    if (typeof window === "undefined") {
      return () => {};
    }

    const client = this.getWsClient();
    if (!client) {
      return () => {};
    }

    const unsubscribe = client.subscribe<GraphQLResponse<TData>>(
      {
        query: options.query,
        variables: options.variables,
      },
      {
        next: (response) => {
          if (response.data) {
            options.onNext(response.data as TData);
          }
        },
        error: (err) => {
          options.onError?.(err);
        },
        complete: () => {
          options.onComplete?.();
        },
      },
    );

    return unsubscribe;
  }
}

export function createGraphQLClient(
  options?: GraphQLClientOptions,
): GraphQLClient {
  return new GraphQLClient(options);
}

export const graphqlClient = createGraphQLClient();
