import { clientConfig as config } from "@soustools/config/client";

export { refreshAuthSession } from "./auth-session";
export {
  createRestClient,
  createApiClient,
  api,
  type RestApiClient,
  type RestClientOptions,
} from "./rest";
export {
  createWebSocketClient,
  type WebSocketClientOptions,
} from "./websocket";
export {
  createGraphQLClient,
  graphqlClient,
  GraphQLClient,
  type GraphQLResponse,
  type GraphQLClientOptions,
  type SubscriptionOptions,
} from "./graphql";
export { uploadFile } from "./upload";

/**
 * Backward compatibility alias directly exposing config value.
 * No parsing or fallback guesswork logic.
 */
export const getDefaultBaseUrl = (): string => config.NEXT_PUBLIC_API_URL;

export type { paths } from "./schema";
