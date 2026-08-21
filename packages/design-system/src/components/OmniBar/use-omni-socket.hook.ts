"use client";

import { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { type Socket } from "socket.io-client";
import { type OmniMessage } from "@soustools/api-types";
import { useOmnibarContext } from "./OmniBarContext";
import { usePathname } from "next/navigation";
import { api, createWebSocketClient } from "@soustools/api-client";

export function useOmniSocket(): {
  socket: Socket | null;
  errorMessage: string | null;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  isListening: boolean;
  setIsListening: Dispatch<SetStateAction<boolean>>;
} {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const pathname = usePathname();
  const lastPayloadRef = useRef<Record<string, unknown> | null>(null);

  const {
    contextPayload,
    chatHistory,
    addMessage,
    setIsProcessing,
    markLoadingComplete,
    setExecuteBackgroundCommand,
    setChatHistory,
  } = useOmnibarContext();

  // Initialize WebSocket connection & manage listeners cleanly
  useEffect(() => {
    const fetchWsTicket = async (): Promise<string> => {
      try {
        const { data } = await (
          api as unknown as {
            POST: (
              path: string,
              options: unknown,
            ) => Promise<{ data?: unknown }>;
          }
        ).POST("/auth/ws-ticket", {});
        const token = (data as { data?: { token?: string } })?.data?.token;
        return token || "";
      } catch (err) {
        console.error("[OmniBar] Failed to fetch WS ticket:", err);
        return "";
      }
    };

    const wsSocket = createWebSocketClient({
      namespace: "/commands",
      getToken: fetchWsTicket,
    });

    const handleChatMessage = (message: OmniMessage) => {
      addMessage(message);
      if (message.role === "model") {
        setIsProcessing(false);
        markLoadingComplete();
      }
    };

    const handleCommandStatus = (data: { state: string; message: string }) => {
      if (data.state === "error") {
        setErrorMessage(data.message);
        setIsProcessing(false);
        setIsListening(false);
        markLoadingComplete();
      }
    };

    const handleException = (error: { message?: string }) => {
      console.error("[OmniBar] WebSocket exception:", error);
      setErrorMessage(error.message || "An error occurred processing command.");
      setIsProcessing(false);
      setIsListening(false);
      markLoadingComplete();
    };

    const handleError = (error: unknown) => {
      console.error("[OmniBar] Socket error:", error);
      setErrorMessage("A network error occurred.");
      setIsProcessing(false);
      markLoadingComplete();
    };

    const handleConnectError = (error: unknown) => {
      console.error("[OmniBar] Socket connect error:", error);
      setErrorMessage("Failed to connect to the server.");
      setIsProcessing(false);
      markLoadingComplete();
    };

    const handleDisconnect = (reason: string) => {
      console.warn("[OmniBar] Socket disconnected:", reason);
      if (
        reason !== "io client disconnect" &&
        reason !== "io server disconnect"
      ) {
        // Log transport disconnect; socket.io auto-reconnects in background
        console.warn(
          "[OmniBar] Temporary disconnect, socket is reconnecting...",
        );
      }
    };

    const handleReauthenticated = () => {
      // Deliberately does NOT re-emit the last payload. Blindly replaying a
      // full executeCommand after a reconnect causes the AI tool-calling loop
      // to reprocess the entire request from scratch, duplicating every
      // agent_step and the final reply if the server had already processed
      // part of the original request before the auth blip. If the original
      // request is still pending, the user must manually resubmit; a fully
      // idempotent retry-with-requestId mechanism is tracked as future work.
      console.log(
        "[OmniBar] Re-authenticated. Not replaying prior command (see comment).",
      );
    };

    wsSocket.on("chat_message", handleChatMessage);
    wsSocket.on("command_status", handleCommandStatus);
    wsSocket.on("exception", handleException);
    wsSocket.on("error", handleError);
    wsSocket.on("connect_error", handleConnectError);
    wsSocket.on("disconnect", handleDisconnect);
    wsSocket.on("reauthenticated", handleReauthenticated);

    setSocket(wsSocket);

    // Guaranteed teardown: remove every registered event listener & disconnect socket
    return () => {
      wsSocket.off("chat_message", handleChatMessage);
      wsSocket.off("command_status", handleCommandStatus);
      wsSocket.off("exception", handleException);
      wsSocket.off("error", handleError);
      wsSocket.off("connect_error", handleConnectError);
      wsSocket.off("disconnect", handleDisconnect);
      wsSocket.off("reauthenticated", handleReauthenticated);
      wsSocket.disconnect();
    };
  }, [addMessage, setIsProcessing, markLoadingComplete]);

  // Execute Background Command handler
  useEffect(() => {
    const executeBackgroundCommand = (text: string) => {
      if (!text.trim()) return;
      setIsProcessing(true);
      const newUserMessage: OmniMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      const updatedHistory = [...chatHistory, newUserMessage];
      setChatHistory(updatedHistory);

      const payload = {
        chatHistory: updatedHistory,
        source: "omnibar",
        path: pathname,
        context: contextPayload,
      };
      lastPayloadRef.current = payload;

      try {
        if (!socket || !socket.connected) {
          socket?.connect();
        }
        socket?.emit("executeCommand", payload);
      } catch (error: unknown) {
        console.error("[OmniBar] Failed to emit command:", error);
        setIsProcessing(false);
      }
    };
    setExecuteBackgroundCommand(executeBackgroundCommand);
  }, [
    socket,
    chatHistory,
    pathname,
    contextPayload,
    setExecuteBackgroundCommand,
    setChatHistory,
    setIsProcessing,
  ]);

  return { socket, errorMessage, setErrorMessage, isListening, setIsListening };
}
