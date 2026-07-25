"use client";

import React, { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
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

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

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
}: OmniBarPresentationProps) {
  const pathname = usePathname();
  const isAnswerPage = pathname === "/answer";
  const { isDragging, stagedFiles } = useOmnibarContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory.length, isOpen]);

  const isWorkspace = !isFocusPage && !isAnswerPage;

  return (
    <LayoutGroup id="omnibar-morph">
      {/* Backdrop overlay ONLY for workspace modal when open */}
      <AnimatePresence>
        {isWorkspace && isOpen && (
          <motion.div
            key="workspace-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md pointer-events-auto z-[9990] cursor-pointer"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* ── MODE 1: /home — Dead Center Omnibar (NO FAB, NO BACKDROP) ── */}
      {isFocusPage && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg sm:max-w-2xl px-4 z-[9999] pointer-events-none flex flex-col items-center justify-center">
          <div className="w-full flex flex-col justify-center gap-0 pointer-events-auto">
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
          </div>
        </div>
      )}

      {/* ── MODE 2: /answer — Fixed right below AppBar for continued conversation (NO FAB, NO BACKDROP) ── */}
      {isAnswerPage && (
        <div className="fixed top-[72px] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[9999] pointer-events-none flex flex-col items-center justify-start">
          <div className="w-full flex flex-col justify-center gap-0 pointer-events-auto shadow-2xl">
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
          </div>
        </div>
      )}

      {/* ── MODE 3: Regular Workspace Pages (/inventory, /dashboard, etc.) ── */}
      {isWorkspace && (
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* Collapsed FAB Circle in bottom-right corner */
            <motion.button
              key="fab-button"
              type="button"
              aria-label="Open sous chef"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: 1,
                scale: 1,
                boxShadow: isProcessing
                  ? "var(--ds-glow-md)"
                  : [
                      "var(--ds-glow-sm)",
                      "var(--ds-glow-accent)",
                      "var(--ds-glow-sm)",
                    ],
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{
                ...springTransition,
                ...glowLoopTransition,
              }}
              whileHover={{ y: -3, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggle}
              className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full ds-glass flex items-center justify-center cursor-pointer pointer-events-auto overflow-hidden"
              style={{
                borderRadius: "9999px",
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
            /* Expanded Modal — Dead center of screen */
            <div
              key="workspace-modal-container"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg sm:max-w-2xl px-4 z-[9999] pointer-events-none flex flex-col items-center justify-center"
            >
              <div className="w-full flex flex-col justify-center gap-0 pointer-events-auto">
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
                  showClose={true}
                  onToggle={onToggle}
                  isDragging={isDragging}
                  stagedFiles={stagedFiles}
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      )}
    </LayoutGroup>
  );
}
