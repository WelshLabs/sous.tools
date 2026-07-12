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
  }, [chatHistory.length, isOpen]);

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
              className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-background/30 pointer-events-auto"
              style={{ zIndex: 55 }}
              onClick={() => onToggle()}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Global Anchored Container */}
      {mounted && !isFocusPage && createPortal(
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-60 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-4 pointer-events-none gap-4"
        >
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
              <motion.div
                key="expanded"
                layout
                className="w-full flex flex-col gap-4 pointer-events-auto"
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>,
        document.body
      )}

      {/* Focus Page (Inline) */}
      {isFocusPage && (
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 top-[64px] flex flex-col items-center justify-center pointer-events-none z-50 max-w-3xl mx-auto px-4"
        >
          <motion.div layout className="w-full flex flex-col justify-center gap-4 pointer-events-auto">
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
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
