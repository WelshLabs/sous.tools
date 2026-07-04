"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

export interface OmniBarPresentationProps {
  isExpanded: boolean;
  isListening: boolean;
  inputText: string;
  volume: number; // 0 to 1
  isFocusPage?: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function OmniBarPresentation({
  isExpanded,
  isListening,
  inputText,
  volume,
  isFocusPage = false,
  onToggle,
  onChange,
  onKeyDown,
}: OmniBarPresentationProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-grow textarea and detect multiline
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
      
      // If height is greater than roughly a single line (e.g. > 48px depending on padding/font-size), it's multiline
      setIsMultiLine(scrollHeight > 50);
    }
  }, [inputText, isExpanded]);

  return (
    <>
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 backdrop-blur-md bg-black/60 pointer-events-auto"
              onClick={onToggle}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      <motion.div
        layout
        className={`fixed z-50 overflow-hidden cursor-pointer flex items-center
          ${isExpanded 
            ? `top-1/4 left-[10%] right-[10%] md:left-[20%] md:right-[20%] lg:left-[25%] lg:right-[25%] bg-[var(--color-card)] border shadow-2xl transition-all duration-300 ${isMultiLine ? 'rounded-[32px] p-6' : 'rounded-full p-4 px-6'}`
            : "top-2 right-4 md:right-1/2 md:translate-x-1/2 w-12 h-12 rounded-full bg-[var(--color-card)] border"
          }
        `}
        style={{
          boxShadow: isListening ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
          borderColor: isListening ? "var(--color-primary)" : "var(--color-border)",
          transition: "border-color 0.2s ease-out, box-shadow 0.1s linear, border-radius 0.2s ease-in-out"
        }}
        onClick={!isExpanded ? onToggle : undefined}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full h-full text-muted-foreground hover:text-white transition-colors"
            >
              <Mic className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center gap-4 pointer-events-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <Mic className={`w-6 h-6 flex-shrink-0 ${isListening ? 'text-[var(--color-primary)]' : 'text-muted-foreground'}`} />
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder="ask your sous chef"
                className="w-full bg-transparent border-none text-white text-xl md:text-2xl outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light flex-1"
                rows={1}
                autoFocus
              />
              {!isFocusPage && (
                <button 
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-white flex-shrink-0 p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
