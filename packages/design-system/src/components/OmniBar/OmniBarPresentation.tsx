"use client";

import React from "react";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { OmniChatWindow } from "./OmniChatWindow";
import { OmniInputPill } from "./OmniInputPill";
import { OmnibarPerimeterView } from "./OmnibarPerimeterView";
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

// Spring for positional/scale transitions (not used for keyframe arrays).
const springTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 };

// Tween used for any multi-keyframe property — springs can't do keyframe arrays.
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

  useEffect(() => { setMounted(true); }, []);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory.length, isOpen]);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
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
                onClick={() => onToggle()}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}

      {/* ── FAB (collapsed) + Expanded panel ─────────────────────────────── */}
      {/* LayoutGroup couples the shared layoutId="omnibar-input-pill" across   */}
      {/* the two portals so Framer can perform the shared-layout morph.         */}
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
                  // Explicit borderRadius in animate+initial+exit prevents Framer
                  // from interpolating back to the pill's rectangular radius on close.
                  initial={{ opacity: 0, scale: 0.85, borderRadius: "9999px" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    borderRadius: "9999px",
                    // Keyframe array → MUST use tween (not spring).
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
                  // w-16 h-16 = 64px — proper FAB touch target.
                  // No overflow-hidden: allows OmnibarPerimeterView SVG to render outside.
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
                /* ── Expanded: chat timeline + input pill ── */
                <motion.div
                  key="expanded-container"
                  // z-50 ensures the chat window sits above regular page content.
                  className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-50 max-w-3xl mx-auto px-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={springTransition}
                >
                  <OmniChatWindow
                    chatHistory={chatHistory}
                    scrollRef={scrollRef}
                    onClearHistory={onClearHistory}
                  />
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
              )}
            </AnimatePresence>
          </LayoutGroup>,
          document.body,
        )}

      {/* ── Focus Page (Inline — full-width centered) ─────────────────────── */}
      {isFocusPage && (
        <motion.div
          layout
          transition={springTransition}
          className="fixed inset-0 top-[64px] flex flex-col items-center justify-center pointer-events-none z-50 max-w-3xl mx-auto px-4"
        >
          <motion.div layout className="w-full flex flex-col justify-center gap-4 pointer-events-auto">
            <OmniChatWindow
              chatHistory={chatHistory}
              scrollRef={scrollRef}
              onClearHistory={onClearHistory}
            />
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
      )}
    </>
  );
}
