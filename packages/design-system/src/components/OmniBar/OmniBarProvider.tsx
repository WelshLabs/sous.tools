"use client";

import React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";
import { useOmniBarHotkeys } from "./use-omnibar-hotkeys.hook";
import { useSpeechRecognition } from "./use-speech-recognition.hook";
import { useGlobalDrag } from "./use-global-drag.hook";
import { useOmniSocket } from "./use-omni-socket.hook";
import { motion, AnimatePresence } from "framer-motion";


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
    chatHistory,
    isOpen,
    isProcessing,
    setIsOpen,
    setIsDragging,
    inputText,
    setInputText,
    setIsGoogleDriveConnected,
    setChatHistory,
    setApiClient,
    apiClient: ctxApiClient,
  } = useOmnibarContext();

  const handleClearHistory = () => setChatHistory([]);

  useEffect(() => {
    if (apiClient && apiClient !== ctxApiClient) {
      setApiClient(apiClient);
    }
  }, [apiClient, setApiClient, ctxApiClient]);

  const { socket, errorMessage, setErrorMessage } =
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

  const { handleKeyDown, handleSubmit } = useOmniBarHotkeys({ socket, isFocusPage, pathname, setErrorMessage });
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
            className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-pulse z-[100000]"
            style={{
              boxShadow:
                "0 0 10px var(--color-primary), 0 0 20px var(--color-accent)",
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
        onSubmit={handleSubmit}
        onClearHistory={handleClearHistory}
      />
    </>
  );
}
