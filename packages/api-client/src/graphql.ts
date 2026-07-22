import { clientConfig as config } from "@soustools/config/client";
import { refreshAuthSession } from "./auth-session";

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: Record<string, any> }>;
}

export interface GraphQLClientOptions {
  url?: string;
  headers?: Record<string, string>;
}

export class GraphQLClient {
  private url: string;
  private headers: Record<string, string>;

  constructor(options: GraphQLClientOptions = {}) {
    const baseUrl = options.url || config.NEXT_PUBLIC_API_URL;
    this.url = baseUrl.endsWith("/graphql") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/graphql`;
    this.headers = options.headers || {};
  }

  async request<TData = any, TVariables = Record<string, any>>(
    query: string,
    variables?: TVariables,
    requestInit?: RequestInit
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
      throw new Error(`GraphQL HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json: GraphQLResponse<TData> = await response.json();

    const hasAuthError = json.errors?.some(
      (e) =>
        e.message?.toLowerCase().includes("unauthorized") ||
        e.extensions?.code === "UNAUTHENTICATED"
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
}

export function createGraphQLClient(options?: GraphQLClientOptions): GraphQLClient {
  return new GraphQLClient(options);
}

export const graphqlClient = createGraphQLClient();
