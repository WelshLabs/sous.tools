/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext } from "./OmniBarContext";
import { useOmniSocket } from "./use-omni-socket.hook";
import { motion, AnimatePresence } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";

export function OmniBarProvider({
  children,
  token,
}: {
  children?: any;
  token?: string;
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
  } = useOmnibarContext();

  const [inputText, setInputText] = useState("");
  const { socket, errorMessage, setErrorMessage, isListening, setIsListening } =
    useOmniSocket(token);

  const dragCounter = useRef(0);

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
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown })
        .webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    const SpeechRecognitionConstructor = SpeechRecognition as unknown as {
      new (): {
        continuous: boolean;
        interimResults: boolean;
        onresult: (e: { results: Iterable<{ transcript: string }[]> }) => void;
        onerror: (e: { error: unknown }) => void;
        onend: () => void;
        start: () => void;
      };
    };
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join("");
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
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
