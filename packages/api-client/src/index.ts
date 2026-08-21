import { clientConfig as config } from "@soustools/config/client";

export {
  refreshAuthSession,
  onAuthRefreshed,
  notifyAuthRefreshed,
  type AuthRefreshListener,
} from "./auth-session";
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
  createUrqlClient,
  urqlClient,
  type UrqlClientOptions,
  getSubscriptionWsClient,
  reconnectSubscriptionWs,
  isAuthError,
  defaultCacheConfig,
} from "./urql";
export {
  createGraphQLClient,
  graphqlClient,
  GraphQLClient,
  type GraphQLResponse,
  type GraphQLClientOptions,
  type SubscriptionOptions,
  gql,
  cacheExchange,
  offlineExchange,
  authExchange,
  fetchExchange,
  subscriptionExchange,
  type Client as UrqlClientInstance,
  type Exchange,
  type Operation,
  type OperationResult,
  type CombinedError,
} from "./graphql";
export {
  uploadFile,
  uploadAndIngest,
  type UploadAndIngestOptions,
  type UploadAndIngestResult,
} from "./upload";

export * from "./generated/graphql";

/**
 * Backward compatibility alias directly exposing config value.
 * No parsing or fallback guesswork logic.
 */
export const getDefaultBaseUrl = (): string => config.NEXT_PUBLIC_API_URL;

export type { paths } from "./schema";
