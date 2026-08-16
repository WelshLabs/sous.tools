"use client";

import React, { useRef, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { OmniInputPill } from "./OmniInputPill";
import { OmnibarPerimeterView } from "./OmnibarPerimeterView";
import { StagingArea } from "./StagingArea";
import { useOmnibarContext } from "./OmniBarContext";
import { AnimatedLettermark, Lettermark } from "../Logos/Logo";

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

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.9,
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
  const searchParams = useSearchParams();
  const isAnswerPage = pathname === "/home" && searchParams?.has("chat");
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
            className="bg-background/80 pointer-events-auto fixed inset-0 z-[9990] cursor-pointer backdrop-blur-md"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* ── MODE 1: /home (without chat) — Dead Center Omnibar (NO FAB, NO BACKDROP) ── */}
      {isFocusPage && !isAnswerPage && (
        <div className="pointer-events-none fixed top-1/2 left-1/2 z-[9999] flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4 sm:max-w-2xl">
          <div className="pointer-events-auto flex w-full flex-col justify-center gap-0">
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

      {/* ── MODE 2: /home?chat=... — Sticky bottom composer (Claude Code layout) ── */}
      {isAnswerPage && (
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-[9999] flex justify-center px-4 pb-4">
          <div className="pointer-events-auto flex w-full max-w-2xl flex-col justify-center gap-0 shadow-2xl">
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
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={springTransition}
              whileHover={{ y: -3, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggle}
              className="ds-glass pointer-events-auto fixed right-6 bottom-6 z-[9999] flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full"
              style={{
                borderRadius: "9999px",
                borderColor: isProcessing
                  ? "var(--color-primary)"
                  : "var(--color-border)",
              }}
            >
              <OmnibarPerimeterView busy={isProcessing} />
              {isProcessing ? (
                <AnimatedLettermark
                  gradient
                  duration={1.65}
                  className="relative z-10 h-9 w-9"
                />
              ) : (
                <Lettermark gradient className="relative z-10 h-8 w-8" />
              )}
            </motion.button>
          ) : (
            /* Expanded Modal — Dead center of screen */
            <div
              key="workspace-modal-container"
              className="pointer-events-none fixed top-24 left-1/2 z-[9999] flex w-full max-w-lg -translate-x-1/2 flex-col items-center justify-center px-4 sm:max-w-2xl"
            >
              <div className="pointer-events-auto flex w-full flex-col justify-center gap-0">
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
