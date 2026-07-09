"use client";

import React from "react";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { type OmniMessage } from "@soustools/api-types";
import { OmniChatWindow } from "./OmniChatWindow";
import { OmniInputPill } from "./OmniInputPill";
import { useOmnibarContext } from "./OmniBarContext";

export interface OmniBarPresentationProps {
  isOpen: boolean;
  isListening: boolean;
  isProcessing?: boolean;
  chatHistory: OmniMessage[];
  errorMessage?: string | null;
  inputText: string;
  isFocusPage?: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicClick: () => void;
}

export function OmniBarPresentation({
  isOpen,
  isListening,
  isProcessing = false,
  chatHistory = [],
  errorMessage = null,
  inputText,
  isFocusPage = false,
  onToggle,
  onChange,
  onKeyDown,
  onMicClick,
}: OmniBarPresentationProps) {
  const { isDragging, stagedFiles } = useOmnibarContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  return (
    <>
      {/* Backdrop for Expanded State */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-background/60 pointer-events-auto"
              style={{ zIndex: 40 }}
              onClick={() => onToggle()}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Global Anchored Container */}
      {mounted && !isFocusPage && createPortal(
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center justify-end w-full max-w-3xl pointer-events-none gap-4">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              <motion.div
                key="collapsed"
                layoutId="omnibar-input-pill"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={onToggle}
                className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer pointer-events-auto shadow-lg"
                style={{
                  boxShadow: isProcessing ? `0 0 20px var(--color-primary)` : undefined,
                  borderColor: isProcessing ? "var(--color-primary)" : "var(--color-border)",
                }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
            ) : (
              <div
                key="expanded"
                className="w-full flex flex-col gap-4 pointer-events-none"
              >
                <OmniChatWindow chatHistory={chatHistory} scrollRef={scrollRef} />
                <OmniInputPill
                  inputText={inputText}
                  isListening={isListening}
                  isProcessing={isProcessing}
                  errorMessage={errorMessage}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  onMicClick={onMicClick}
                  onToggle={onToggle}
                  showClose={true}
                  isDragging={isDragging}
                  stagedFiles={stagedFiles}
                />
              </div>
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}

      {/* Focus Page (Inline) */}
      {isFocusPage && (
        <div className="fixed inset-0 top-[64px] flex flex-col items-center justify-center pointer-events-none z-50">
          <div className="w-full max-w-3xl flex flex-col justify-center px-4 gap-4 pointer-events-none">
            <OmniChatWindow chatHistory={chatHistory} scrollRef={scrollRef} />
            <OmniInputPill
              inputText={inputText}
              isListening={isListening}
              isProcessing={isProcessing}
              errorMessage={errorMessage}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onMicClick={onMicClick}
              showClose={false}
              isDragging={isDragging}
              stagedFiles={stagedFiles}
            />
          </div>
        </div>
      )}
    </>
  );
}
