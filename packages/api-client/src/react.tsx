"use client";

import { createContext, useContext, useEffect, ReactNode, useRef } from "react";
import { createWebSocketClient, WebSocketClientOptions } from "./websocket";
import { Socket } from "socket.io-client";
import { api } from "./index";

interface ApiContextValue {
  socket: Socket;
  api: typeof api;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({
  children,
  config,
}: {
  children: ReactNode;
  config?: WebSocketClientOptions;
}) {
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
    <ApiContext.Provider value={{ socket: socketRef.current, api }}>
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

