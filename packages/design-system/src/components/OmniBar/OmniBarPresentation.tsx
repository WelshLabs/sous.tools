"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { OmniInputPill } from "./OmniInputPill";
import { OmnibarPerimeterView } from "./OmnibarPerimeterView";
import { StagingArea } from "./StagingArea";
import { useOmnibarContext } from "./OmniBarContext";
import { Lettermark } from "../Logos/Logo";

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
  onSubmit: () => void;
  onClearHistory: () => void;
}

const springTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 };

const glowLoopTransition = {
  boxShadow: {
    type: "tween" as const,
    ease: "linear" as const,
    repeat: Infinity,
    duration: 2.4,
  },
};

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
  onSubmit,
  onClearHistory,
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
      {/* ── Backdrop (non-focus pages when open) ── */}
      {mounted && !isFocusPage &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-background/72 pointer-events-auto z-40"
                onClick={onToggle}
              />
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ── Collapsed FAB (bottom-right) or Expanded Panel (non-focus pages) ── */}
      {mounted && !isFocusPage &&
        createPortal(
          <LayoutGroup id="omnibar-morph">
            <AnimatePresence mode="popLayout">
              {!isOpen ? (
                /* ── Collapsed FAB — bottom-right ── */
                <motion.button
                  key="fab"
                  layoutId="omnibar-input-pill"
                  type="button"
                  aria-label="Open sous chef"
                  initial={{ opacity: 0, scale: 0.85, borderRadius: "9999px" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    borderRadius: "9999px",
                    boxShadow: isProcessing
                      ? "var(--ds-glow-md)"
                      : [
                          "var(--ds-glow-sm)",
                          "var(--ds-glow-accent)",
                          "var(--ds-glow-sm)",
                        ],
                  }}
                  exit={{ opacity: 0, scale: 0.85, borderRadius: "9999px" }}
                  transition={{
                    ...springTransition,
                    ...glowLoopTransition,
                  }}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={onToggle}
                  className="fixed bottom-6 right-6 z-50 w-16 h-16 ds-glass flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{
                    borderColor: isProcessing
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  }}
                >
                  <OmnibarPerimeterView busy={isProcessing} />
                  <Lettermark
                    gradient
                    className={`w-8 h-8 relative z-10 ${isProcessing ? "animate-pulse" : ""}`}
                  />
                </motion.button>
              ) : (
                /* ── Expanded: staging area + input pill ── */
                <motion.div
                  key="expanded-container"
                  className="fixed inset-x-0 bottom-6 flex flex-col items-center justify-end pointer-events-none z-50 max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto px-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={springTransition}
                >
                  <motion.div layout className="w-full flex flex-col gap-0 pointer-events-auto">
                    <StagingArea files={stagedFiles} />
                    <OmniInputPill
                      inputText={inputText}
                      isListening={isListening}
                      isProcessing={isProcessing}
                      errorMessage={errorMessage}
                      onChange={onChange}
                      onKeyDown={onKeyDown}
                      onMicClick={onMicClick}
                      onSubmit={onSubmit}
                      onToggle={onToggle}
                      showClose={true}
                      isDragging={isDragging}
                      stagedFiles={stagedFiles}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>,
          document.body
        )}

      {/* ── Focus Page (/home — Dead Center Omnibar) ── */}
      {isFocusPage && (
        <LayoutGroup id="omnibar-morph">
          <AnimatePresence>
            {chatHistory.length > 0 && (
              <motion.div
                key="home-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="fixed inset-0 top-[64px] bg-background/82 backdrop-blur-md pointer-events-auto z-40"
                onClick={onClearHistory}
              />
            )}
          </AnimatePresence>
          <motion.div
            layout
            layoutId="omnibar-input-pill"
            transition={springTransition}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg sm:max-w-2xl px-4 z-50 pointer-events-none flex flex-col items-center justify-center"
          >
            <motion.div layout className="w-full flex flex-col justify-center gap-0 pointer-events-auto">
              <StagingArea files={stagedFiles} />
              <OmniInputPill
                inputText={inputText}
                isListening={isListening}
                isProcessing={isProcessing}
                errorMessage={errorMessage}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onMicClick={onMicClick}
                onSubmit={onSubmit}
                showClose={false}
                isDragging={isDragging}
                stagedFiles={stagedFiles}
              />
            </motion.div>
          </motion.div>
        </LayoutGroup>
      )}
    </>
  );
}
