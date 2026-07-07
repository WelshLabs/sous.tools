"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

export interface OmniInputPillProps {
  inputText: string;
  isListening: boolean;
  isProcessing: boolean;
  errorMessage?: string | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicClick: () => void;
  onToggle?: () => void;
  showClose?: boolean;
}

export function OmniInputPill({
  inputText,
  isListening,
  isProcessing,
  errorMessage,
  onChange,
  onKeyDown,
  onMicClick,
  onToggle,
  showClose = true
}: OmniInputPillProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputText]);

  return (
    <motion.div
      layoutId="omnibar-input-pill"
      className="w-full bg-[var(--color-card)] border transition-all duration-300 rounded-[32px] p-2 pointer-events-auto flex flex-col"
      style={{
        boxShadow: isProcessing ? `0 0 20px var(--color-primary)` : '0 10px 40px -10px rgba(0,0,0,0.5)',
        borderColor: isProcessing ? "var(--color-primary)" : "var(--color-border)",
      }}
    >
      <div className="w-full flex items-center gap-4 px-2">
        <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0 transition-transform hover:scale-110 ml-2" disabled={isProcessing}>
          <Mic className={`w-5 h-5 ${isListening ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />
        </button>
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={isProcessing}
          placeholder={isProcessing ? "Chef is thinking..." : "Ask your sous chef"}
          className={`w-full bg-transparent border-none text-[var(--color-foreground)] text-lg outline-none resize-none overflow-hidden placeholder:text-[var(--color-muted-foreground)]/50 font-light flex-1 py-3 leading-snug ${isProcessing ? 'opacity-50' : ''}`}
          rows={1}
          autoFocus
        />
        {showClose && onToggle && (
          <button 
            onClick={onToggle}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] flex-shrink-0 p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-sm font-medium px-4 pb-2"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
