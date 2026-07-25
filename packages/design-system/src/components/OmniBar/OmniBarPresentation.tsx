"use client";

import React, { useRef, useEffect } from "react";
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

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory.length, isOpen]);

  // Determine if expanded Omnibar pill should be visible:
  // 1. On /home (isFocusPage = true) -> ALWAYS visible dead center
  // 2. On workspace routes -> Visible when isOpen = true (opened from FAB or hotkey)
  const showExpandedModal = isFocusPage || isOpen;

  return (
    <LayoutGroup id="omnibar-morph">
      {/* ── Backdrop (shown when expanded modal is open) ── */}
      <AnimatePresence>
        {showExpandedModal && (
          <motion.div
            key="omnibar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className={`fixed inset-0 bg-background/80 backdrop-blur-md pointer-events-auto z-[9990] ${
              isFocusPage ? "cursor-default" : "cursor-pointer"
            }`}
            onClick={() => {
              if (isFocusPage) {
                onClearHistory();
              } else {
                onToggle();
              }
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {!showExpandedModal ? (
          /* ── Collapsed FAB — bottom-right corner ── */
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
            className="fixed bottom-6 right-6 z-[9999] w-16 h-16 ds-glass flex items-center justify-center cursor-pointer pointer-events-auto"
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
          /* ── Expanded Omnibar: DEAD CENTER OF SCREEN ── */
          <motion.div
            key="expanded-omnibar-modal"
            layout
            layoutId="omnibar-input-pill"
            transition={springTransition}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg sm:max-w-2xl px-4 z-[9999] pointer-events-none flex flex-col items-center justify-center"
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
                showClose={!isFocusPage}
                onToggle={onToggle}
                isDragging={isDragging}
                stagedFiles={stagedFiles}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
