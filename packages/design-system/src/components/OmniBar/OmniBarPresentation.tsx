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

const springTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 };

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
  const isFabState = isWorkspace && !isOpen;

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

      {/* SINGLE UNIFIED OMNIBAR ELEMENT — Never unmounts, never flashes */}
      <motion.div
        key="omnibar-unified-pill"
        layout
        layoutId="omnibar-input-pill"
        transition={springTransition}
        className={
          isFabState
            ? "fixed bottom-6 right-6 w-16 h-16 rounded-full ds-glass flex items-center justify-center cursor-pointer pointer-events-auto z-[9999]"
            : isAnswerPage
              ? "fixed top-[72px] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[9999] pointer-events-auto flex flex-col items-center"
              : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg sm:max-w-2xl px-4 z-[9999] pointer-events-none flex flex-col items-center justify-center"
        }
        onClick={isFabState ? onToggle : undefined}
      >
        {isFabState ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <OmnibarPerimeterView busy={isProcessing} />
            <Lettermark
              gradient
              className={`w-8 h-8 relative z-10 ${isProcessing ? "animate-pulse" : ""}`}
            />
          </div>
        ) : (
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
              showClose={isWorkspace && isOpen}
              onToggle={onToggle}
              isDragging={isDragging}
              stagedFiles={stagedFiles}
            />
          </motion.div>
        )}
      </motion.div>
    </LayoutGroup>
  );
}
