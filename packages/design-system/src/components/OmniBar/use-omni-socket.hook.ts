import { useState, useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { type OmniMessage } from "@soustools/api-types";
import { useOmnibarContext } from "./OmniBarContext";
import { usePathname } from "next/navigation";

export function useOmniSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const pathname = usePathname();

  const {
    contextPayload,
    chatHistory,
    addMessage,
    setIsProcessing,
    markLoadingComplete,
    setExecuteBackgroundCommand,
    setChatHistory,
  } = useOmnibarContext();

  // Initialize WebSocket connection
  useEffect(() => {
    let newSocket: Socket | null = null;
    const initSocket = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001";
        const socketUrl = apiUrl.startsWith("http") ? apiUrl : window.location.origin;


        // The HttpOnly session cookie is automatically sent by the browser.
        // No JS-accessible token is needed — NestJS validates commands gateway via WsSupabaseAuthGuard.
        newSocket = io(socketUrl + "/commands", {
          withCredentials: true,
          transports: ["websocket"],
        });

        // Listen for standard chat stream
        newSocket.on("chat_message", (message: OmniMessage) => {
          addMessage(message);
          if (message.role === "model") {
            setIsProcessing(false);
            markLoadingComplete();
          }
        });

        // Listen for explicit errors
        newSocket.on("command_status", (data: { state: string; message: string }) => {
          if (data.state === "error") {
            setErrorMessage(data.message);
            setIsProcessing(false);
            setIsListening(false);
            markLoadingComplete();
          }
        });

        setSocket(newSocket);
      } catch (err: unknown) {
        console.error("Failed to initialize WebSocket:", err);
      }
    };

    initSocket();

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [addMessage, setIsProcessing, markLoadingComplete]);

  // Execute Background Command
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

      try {
        if (!socket || !socket.connected) {
          socket?.connect();
        }
        socket?.emit("executeCommand", {
          chatHistory: updatedHistory,
          source: "omnibar",
          path: pathname,
          context: contextPayload,
        });
      } catch (error: unknown) {
        console.error("Failed to emit background command:", error);
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
