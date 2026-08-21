import {
  authExchange,
  type AuthUtilities,
  type AuthConfig,
} from "@urql/exchange-auth";
import type { CombinedError, Exchange, Operation } from "urql";
import { refreshAuthSession } from "./auth-session";
import { reconnectSubscriptionWs } from "./urql-ws";

/**
 * Checks if a GraphQL / HTTP response indicates an unauthenticated / 401 error.
 */
export function isAuthError(error: CombinedError): boolean {
  if (error.response?.status === 401 || error.response?.status === 403) {
    return true;
  }

  return Boolean(
    error.graphQLErrors?.some((e) => {
      const message = (e.message || "").toLowerCase();
      const code = (e.extensions?.code as string | undefined)?.toUpperCase();
      const status = e.extensions?.status;

      return (
        message.includes("unauthorized") ||
        message.includes("unauthenticated") ||
        message.includes("jwt expired") ||
        code === "UNAUTHENTICATED" ||
        code === "UNAUTHORIZED" ||
        code === "FORBIDDEN" ||
        status === 401 ||
        status === 403
      );
    }),
  );
}

/**
 * Creates the URQL auth exchange configured for 401 interception and token refresh.
 */
export function createUrqlAuthExchange(
  headers?: Record<string, string>,
): Exchange {
  return authExchange(async (utils: AuthUtilities): Promise<AuthConfig> => {
    return {
      addAuthToOperation(operation: Operation) {
        const fetchOptions =
          typeof operation.context.fetchOptions === "function"
            ? operation.context.fetchOptions()
            : operation.context.fetchOptions || {};

        return utils.appendHeaders(
          {
            ...operation,
            context: {
              ...operation.context,
              fetchOptions: {
                ...fetchOptions,
                credentials: "include",
              },
            },
          },
          headers || {},
        );
      },
      didAuthError(error: CombinedError) {
        return isAuthError(error);
      },
      willAuthError() {
        return false;
      },
      async refreshAuth() {
        const refreshed = await refreshAuthSession();
        if (refreshed) {
          reconnectSubscriptionWs();
        }
      },
    };
  });
}
