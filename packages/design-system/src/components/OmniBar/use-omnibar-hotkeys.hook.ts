"use client";

import { useOmnibarContext } from "./OmniBarContext";
import { type OmniMessage } from "@soustools/api-types";
import { type Socket } from "socket.io-client";

export function useOmniBarHotkeys({
  socket,
  isFocusPage,
  pathname,
  setErrorMessage,
}: {
  socket: Socket | null;
  isFocusPage: boolean;
  pathname: string;
  setErrorMessage: (msg: string | null) => void;
}) {
  const {
    isProcessing,
    inputText,
    setInputText,
    setIsProcessing,
    setIsOpen,
    chatHistory,
    setChatHistory,
    contextPayload,
  } = useOmnibarContext();

  /**
   * Core submit logic — shared between Enter keypress and the Submit button.
   * Reads the current inputText from Zustand, emits over the socket.
   */
  const handleSubmit = async () => {
    if (isProcessing) return;

    const textToSubmit = inputText.trim();
    if (!textToSubmit) return;

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
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (!isFocusPage) setIsOpen(false);
    }
  };

  return { handleKeyDown, handleSubmit };
}
