"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const {
    isProcessing,
    inputText,
    setInputText,
    setIsProcessing,
    setIsOpen,
    chatHistory,
    setChatHistory,
    contextPayload,
    stagedFiles,
    setStagedFiles,
  } = useOmnibarContext();

  /**
   * Core submit logic — shared between Enter keypress and the Submit button.
   * Sends both the text prompt AND any staged file attachments in a single payload.
   * Clears the staging area after dispatch.
   */
  const handleSubmit = async () => {
    if (isProcessing) return;

    const textToSubmit = inputText.trim();
    const hasFiles = stagedFiles.length > 0;

    // Allow submit if there is text OR staged files (or both)
    if (!textToSubmit && !hasFiles) return;

    setInputText("");
    setStagedFiles([]);
    setIsProcessing(true);
    setErrorMessage(null);

    // Always route to /home with chat session when submitting a query
    const searchParams = new URLSearchParams(window.location.search);
    const existingChatId = searchParams.get("chat");
    let currentChatId = existingChatId;

    if (pathname !== "/home" || !existingChatId) {
      currentChatId = existingChatId || crypto.randomUUID();
      const params = new URLSearchParams();
      params.set("chat", currentChatId);
      if (textToSubmit) params.set("prompt", textToSubmit);
      router.push(`/home?${params.toString()}`);

      if (pathname !== "/home") {
        setIsProcessing(false);
        setIsOpen(false);
        return;
      }
    }
    setIsOpen(true);

    // Build a human-readable user message that reflects what was submitted
    const attachmentSummary = hasFiles
      ? `[${stagedFiles.length} attachment${stagedFiles.length > 1 ? "s" : ""}]`
      : "";
    const userContent = [attachmentSummary, textToSubmit]
      .filter(Boolean)
      .join(" ");

    // Build attachments array from staged files for the backend
    const attachments = await Promise.all(
      stagedFiles.map(async (f) => {
        let dataUrl = f.url ?? f.previewUrl ?? null;
        if (f.file) {
          dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(f.file!);
          });
        }
        return {
          id: f.id,
          name: f.file?.name ?? "unknown",
          mimeType: f.file?.type ?? "application/octet-stream",
          url: dataUrl,
        };
      })
    );

    const newUserMessage: OmniMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
      attachments,
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
        context: { ...contextPayload, conversationId: currentChatId },
        attachments,
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
      if (isFocusPage) {
        setChatHistory([]);
        setInputText("");
      } else {
        setIsOpen(false);
      }
    }
  };

  return { handleKeyDown, handleSubmit };
}
