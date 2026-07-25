"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { type OmniMessage } from "@soustools/api-types";
import { OmniInputPill } from "./OmniInputPill";
import { StagingArea } from "./StagingArea";
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
  onSubmit: () => void;
  onClearHistory: () => void;
}

// Spring for smooth position morphing between /home center and /answer AppBar
const springTransition = { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.9 };

export function OmniBarPresentation({
  isOpen: _isOpen,
  isListening,
  isProcessing = false,
  chatHistory = [],
  errorMessage = null,
  inputText,
  isFocusPage = false,
  onChange,
  onKeyDown,
  onMicClick,
  onSubmit,
  onClearHistory,
}: OmniBarPresentationProps) {
  const { isDragging, stagedFiles } = useOmnibarContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <LayoutGroup id="omnibar-morph">
      {/* ── BACKDROP (shown when history is expanded or during modal interactions) ── */}
      <AnimatePresence>
        {isFocusPage && chatHistory.length > 0 && (
          <motion.div
            key="home-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[64px] bg-background/80 backdrop-blur-md pointer-events-auto z-40"
            onClick={onClearHistory}
          />
        )}
      </AnimatePresence>

      {/* ── OMNIBAR PILL CONTAINER ──
          When on /home (isFocusPage = true): Centered dead middle of the viewport (Google Homepage style)
          When on /answer or other pages (isFocusPage = false): Fixed inside top AppBar (Google Results style)
      ── */}
      <motion.div
        key="omnibar-shared-wrapper"
        layout
        layoutId="omnibar-input-pill"
        transition={springTransition}
        className={
          isFocusPage
            ? "fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-50 max-w-lg sm:max-w-2xl mx-auto px-4"
            : "fixed top-2.5 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-[100] pointer-events-auto"
        }
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
    </LayoutGroup>,
    document.body
  );
}
