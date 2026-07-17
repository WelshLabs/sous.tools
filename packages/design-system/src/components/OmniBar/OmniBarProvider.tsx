"use client";

import React from "react";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";
import { useOmniBarHotkeys } from "./use-omnibar-hotkeys.hook";
import { useSpeechRecognition } from "./use-speech-recognition.hook";
import { useGlobalDrag } from "./use-global-drag.hook";
import { useOmniSocket } from "./use-omni-socket.hook";
import { motion, AnimatePresence } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { toast } from "sonner";


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

  
  useGlobalDrag(
    () => {
      setIsDragging(true);
      setIsOpen(true);
    },
    () => {
      setIsDragging(false);
    }
  );

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

  const { handleKeyDown } = useOmniBarHotkeys({ socket, isFocusPage, pathname });
  const { isListening, handleMicClick } = useSpeechRecognition({ onTranscript: setInputText });

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
