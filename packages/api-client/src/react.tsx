"use client";

import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { SocketManager, SocketConfig } from "./websocket";

interface ApiContextValue {
  socket: SocketManager;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: SocketConfig;
}) {
  const socketManager = useMemo(() => {
    return SocketManager.getInstance();
  }, []);

  useEffect(() => {
    // Only initialize once on the client
    socketManager.init(config);
  }, [socketManager, config]);

  return (
    <ApiContext.Provider value={{ socket: socketManager }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
