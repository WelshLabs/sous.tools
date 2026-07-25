"use client";

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
const springTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 };

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

  return (
    <LayoutGroup id="omnibar-morph">
      {/* ── BACKDROP (shown when history/focus overlay is active on /home) ── */}
      <AnimatePresence>
        {isFocusPage && chatHistory.length > 0 && (
          <motion.div
            key="home-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-md pointer-events-auto z-[9990]"
            onClick={onClearHistory}
          />
        )}
      </AnimatePresence>

      {/* ── OMNIBAR PILL CONTAINER ──
          When on /home (isFocusPage = true): Centered dead middle of viewport (Google Homepage)
          When on /answer or any workspace route (isFocusPage = false): Fixed inside top AppBar (Google Results)
      ── */}
      <motion.div
        key="omnibar-shared-wrapper"
        layout
        layoutId="omnibar-input-pill"
        transition={springTransition}
        className={
          isFocusPage
            ? "fixed inset-x-0 top-1/2 -translate-y-1/2 w-full max-w-xl sm:max-w-2xl mx-auto px-4 z-[9999] pointer-events-none"
            : "fixed top-2.5 inset-x-0 w-full max-w-xl mx-auto px-4 z-[9999] pointer-events-none"
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
    </LayoutGroup>
  );
}
