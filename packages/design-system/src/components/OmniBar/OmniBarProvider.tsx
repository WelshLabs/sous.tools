/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { graphqlClient } from "@soustools/api-client";

export function OmniBarProvider({ children }: { children?: React.ReactNode }) {
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
    setSocket,
  } = useOmnibarContext();

  const handleClearHistory = () => setChatHistory([]);

  const { socket, errorMessage, setErrorMessage } = useOmniSocket();

  useEffect(() => {
    setSocket(socket);
  }, [socket, setSocket]);

  useGlobalDrag(
    () => {
      setIsDragging(true);
      if (!isFocusPage) {
        setIsOpen(true);
      }
    },
    () => {
      setIsDragging(false);
    },
  );

  // Fetch integration status for Google Drive via GraphQL
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await graphqlClient.request<{
          integrationStatuses: { provider: string; connected: boolean }[];
        }>(`
          query GetIntegrationStatuses {
            integrationStatuses {
              provider
              connected
            }
          }
        `);
        if (res.data?.integrationStatuses) {
          const google = res.data.integrationStatuses.find(
            (item) => item.provider === "GOOGLE",
          );
          setIsGoogleDriveConnected(!!google?.connected);
        }
      } catch (err) {
        console.error("Failed to fetch Google Drive integration status via GraphQL:", err);
      }
    };
    fetchStatus();
  }, [setIsGoogleDriveConnected]);

  // Ensure modal overlay is closed on route changes to prevent backdrop flashes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const handleToggle = () => {
    if (!isFocusPage) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const { handleKeyDown, handleSubmit } = useOmniBarHotkeys({
    socket,
    isFocusPage,
    pathname,
    setErrorMessage,
  });
  const { isListening, handleMicClick } = useSpeechRecognition({
    onTranscript: setInputText,
  });

  // Global escape and cmd+k listeners + custom open-omnibar event
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isFocusPage) {
          setIsOpen(!isOpen);
        }
      } else if (e.key === "Escape") {
        if (isFocusPage) {
          setChatHistory([]);
          setInputText("");
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    const handleOpenEvent = () => {
      if (!isFocusPage) {
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("open-omnibar", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("open-omnibar", handleOpenEvent);
    };
  }, [isOpen, isFocusPage, setIsOpen, setChatHistory, setInputText]);

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
            className="from-primary via-accent to-primary fixed top-0 left-0 z-[100000] h-[2px] animate-pulse bg-gradient-to-r bg-[length:200%_auto]"
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
