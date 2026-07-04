"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

export interface OmniBarPresentationProps {
  isExpanded: boolean;
  isListening: boolean;
  inputText: string;
  volume: number; // 0 to 1
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function OmniBarPresentation({
  isExpanded,
  isListening,
  inputText,
  volume,
  onToggle,
  onChange,
}: OmniBarPresentationProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText, isExpanded]);

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] backdrop-blur-md bg-black/60 pointer-events-auto"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        className={`fixed z-[101] overflow-hidden cursor-pointer flex flex-col
          ${isExpanded 
            ? "top-[20%] left-[5%] right-[5%] md:left-[15%] md:right-[15%] lg:left-[25%] lg:right-[25%] min-h-[200px] rounded-[32px] bg-[var(--color-card)] border shadow-2xl" 
            : "top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--color-card)] border"
          }
        `}
        style={{
          boxShadow: isListening ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
          borderColor: isListening ? "var(--color-primary)" : "var(--color-border)",
          transition: "border-color 0.2s ease-out, box-shadow 0.1s linear"
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
              className="w-full h-full p-6 md:p-8 flex flex-col pointer-events-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-muted-foreground tracking-wide">AI OMNI-BAR</span>
                <button 
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-white text-xs px-2 py-1 bg-white/5 rounded"
                >
                  ESC
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={onChange}
                placeholder="What do you need done?"
                className="w-full bg-transparent border-none text-white text-2xl md:text-3xl lg:text-4xl outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light"
                rows={1}
                autoFocus
              />
              <div className="mt-auto pt-6 flex justify-between items-center">
                <div className={`w-3 h-3 rounded-full ${isListening ? "bg-[var(--color-primary)] animate-pulse" : "bg-white/20"}`} />
                <button className="bg-[var(--color-primary)] text-black font-semibold px-6 py-2 rounded-full text-sm">
                  Execute
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
