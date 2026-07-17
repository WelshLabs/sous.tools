/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";
import { useGlobalDrag } from "./use-global-drag.hook";
import { useOmniSocket } from "./use-omni-socket.hook";
import { motion, AnimatePresence } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { toast } from "sonner";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: SpeechRecognitionStatic;
  webkitSpeechRecognition: SpeechRecognitionStatic;
}

interface IntegrationStatus {
  provider: string;
  connected: boolean;
}

export function OmniBarProvider({
  children,
  token,
  apiClient,
}: {
  children?: React.ReactNode;
  token?: string;
  apiClient?: typeof fetch;
}) {
  const pathname = usePathname();
  const isFocusPage = pathname === "/home";

  const {
    contextPayload,
    chatHistory,
    isOpen,
    isProcessing,
    setIsOpen,
    setIsProcessing,
    setChatHistory,
    setIsDragging,
    inputText,
    setInputText,
    setIsGoogleDriveConnected,
    setApiClient,
    apiClient: ctxApiClient,
  } = useOmnibarContext();

  useEffect(() => {
    if (apiClient && apiClient !== ctxApiClient) {
      setApiClient(apiClient);
    }
  }, [apiClient, setApiClient, ctxApiClient]);

  const { socket, errorMessage, setErrorMessage, isListening, setIsListening } =
    useOmniSocket(token);

  const dragCounter = useRef(0);

  // Fetch integration status for Google Drive
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const fetcher = apiClient || fetch;
        const res = await fetcher("/api/integrations/status");
        if (res.ok) {
          const payload = await res.json() as { data: IntegrationStatus[] } | IntegrationStatus[];
          const list: IntegrationStatus[] = Array.isArray(payload) ? payload : payload.data || [];
          const google = list.find((item) => item.provider === "GOOGLE");
          setIsGoogleDriveConnected(!!google?.connected);
        }
      } catch (err) {
        console.error("Failed to fetch Google Drive integration status:", err);
      }
    };
    fetchStatus();
  }, [setIsGoogleDriveConnected, apiClient]);

  // Global Drag Listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes("Files")) {
        dragCounter.current++;
        if (dragCounter.current === 1) {
          setIsDragging(true);
          setIsOpen(true);
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = () => {
      // Don't prevent default here for the drop, let OmniInputPill handle it if dropped there,
      // but we do need to reset the drag state. Wait, if we preventDefault, child might not get it?
      // Actually child event runs first if bubbling, but window captures it at the end.
      dragCounter.current = 0;
      setIsDragging(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [setIsDragging, setIsOpen]);

  // Sync expanded state if user navigates to/from /home
  useEffect(() => {
    if (isFocusPage) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isFocusPage, setIsOpen]);

  const handleToggle = () => {
    if (!isFocusPage) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

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

  const handleMicClick = () => {
    const SpeechRecognition = (window as WindowWithSpeechRecognition).SpeechRecognition || (window as WindowWithSpeechRecognition).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");
      setInputText(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Global escape listener for when textarea is not focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isFocusPage) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, isFocusPage, setIsOpen]);

  return (
    <>
      {/* Global Top Progress Bar */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ width: "0%", opacity: 1 }}
            animate={{ width: "80%", opacity: 1 }}
            exit={{ width: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-[2px] bg-[var(--color-primary)] z-[100000]"
            style={{
              boxShadow:
                "0 0 10px var(--color-primary), 0 0 20px var(--color-primary)",
            }}
          />
        )}
      </AnimatePresence>

      {children}
      <OmniBarPresentation
        isOpen={isOpen}
        isListening={isListening}
        isProcessing={isProcessing}
        chatHistory={chatHistory}
        errorMessage={errorMessage}
        inputText={inputText}
        isFocusPage={isFocusPage}
        onToggle={handleToggle}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onMicClick={handleMicClick}
      />
    </>
  );
}
