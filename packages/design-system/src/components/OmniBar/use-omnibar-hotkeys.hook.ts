"use client";

import { useOmnibarContext } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";
import { type Socket } from "socket.io-client";

export function useOmniBarHotkeys({
  socket,
  isFocusPage,
  pathname,
}: {
  socket: Socket | null;
  isFocusPage: boolean;
  pathname: string;
}) {
  const {
    isProcessing,
    inputText,
    setInputText,
    setIsProcessing,
    setErrorMessage,
    setIsOpen,
    chatHistory,
    setChatHistory,
    contextPayload,
  } = useOmnibarContext();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (isProcessing) return;

      if (inputText.trim()) {
        const textToSubmit = inputText.trim();
        setInputText("");
        setIsProcessing(true);
        setErrorMessage(null);
        setIsOpen(true);

        const newUserMessage: OmniMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: textToSubmit,
          timestamp: new Date(),
        };

        const updatedHistory = [...chatHistory, newUserMessage];
        setChatHistory(updatedHistory);

        try {
          if (!socket || !socket.connected) {
            setErrorMessage("WebSocket not connected. Attempting reconnect...");
            socket?.connect();
            setIsProcessing(false);
            return;
          }

          socket.emit("executeCommand", {
            chatHistory: updatedHistory,
            source: "omnibar",
            path: pathname,
            context: contextPayload,
          });
        } catch (err: unknown) {
          console.error("Failed to emit command:", err);
          const errorMessage =
            err instanceof Error ? err.message : "Network error occurred.";
          setErrorMessage(errorMessage);
          setIsProcessing(false);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!isFocusPage) setIsOpen(false);
    }
  };

  return { handleKeyDown };
}
