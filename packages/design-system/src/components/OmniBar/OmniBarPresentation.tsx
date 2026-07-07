"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { OmniMessage } from "@soustools/api-types";
import { OmniChatWindow } from "./OmniChatWindow";
import { OmniInputPill } from "./OmniInputPill";

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
      {/* Portal the backdrop AND the expanded OmniBar so they escape the App Bar's stacking context */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-black/60 pointer-events-auto"
              style={{ zIndex: 9999 }}
              onClick={() => onToggle()}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Expanded OmniBar (Portaled to escape App Bar z-index 50) */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed bottom-24 left-[5%] right-[5%] md:left-[15%] md:right-[15%] lg:left-[25%] lg:right-[25%] flex flex-col gap-4 pointer-events-none"
              style={{ zIndex: 10000 }}
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
              />
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Collapsed OmniBar (or /home Focus Page OmniBar which is inline) */}
      {(!isOpen || isFocusPage) && (
        <div
          className={`relative z-10 flex flex-col items-center justify-center
            ${isFocusPage 
              ? `w-full max-w-4xl mx-auto flex flex-col gap-4`
              : "w-12 h-12"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {!isFocusPage && !isOpen ? (
              <motion.div
                key="collapsed"
                layoutId="omnibar-input-pill"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={onToggle}
                className="w-12 h-12 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer pointer-events-auto shadow-lg"
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
                className="w-full flex flex-col gap-4"
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
                  showClose={false}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
