"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Provider as UrqlProvider, useClient as useUrqlClient } from "urql";
import type { Client as UrqlClient } from "urql";
import {
  createWebSocketClient,
  type WebSocketClientOptions,
} from "./websocket";
import type { Socket } from "socket.io-client";
import { api, urqlClient as defaultUrqlClient } from "./index";

export interface ApiProviderProps {
  children: ReactNode;
  config?: WebSocketClientOptions;
  urqlClient?: UrqlClient;
}

interface ApiContextValue {
  socket: Socket;
  api: typeof api;
  urqlClient: UrqlClient;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({
  children,
  config,
  urqlClient = defaultUrqlClient,
}: ApiProviderProps) {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    socketRef.current = createWebSocketClient(config);
  }

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <UrqlProvider value={urqlClient}>
      <ApiContext.Provider
        value={{ socket: socketRef.current, api, urqlClient }}
      >
        {children}
      </ApiContext.Provider>
    </UrqlProvider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}

export { useUrqlClient, UrqlProvider };

// Re-export URQL React Hooks
export {
  useQuery,
  useMutation,
  useSubscription,
  Consumer as UrqlConsumer,
  Context as UrqlContext,
} from "urql";

// Re-export generated typed React hooks & documents
export * from "./generated/graphql";
