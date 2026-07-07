"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X } from "lucide-react";

export interface OmniBarPresentationProps {
  isExpanded: boolean;
  isListening: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  inputText: string;
  volume: number; // 0 to 1
  isFocusPage?: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onMicClick: () => void;
}

export function OmniBarPresentation({
  isExpanded,
  isListening,
  isSubmitting = false,
  errorMessage = null,
  inputText,
  volume,
  isFocusPage = false,
  onToggle,
  onChange,
  onKeyDown,
  onMicClick,
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
      {/* Portal the backdrop AND the expanded OmniBar so they escape the App Bar's stacking context */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 w-screen h-screen backdrop-blur-md bg-black/60 pointer-events-auto"
              style={{ zIndex: 9999 }}
              onClick={() => onToggle()}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Expanded OmniBar (Portaled to escape App Bar z-index 50) */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="expanded-omnibar"
              layoutId="omnibar-container"
              className={`fixed overflow-hidden flex items-center
                top-1/4 left-[10%] right-[10%] md:left-[20%] md:right-[20%] lg:left-[25%] lg:right-[25%] bg-[var(--color-card)] border shadow-2xl transition-all duration-300 ${isMultiLine ? 'rounded-[32px] p-6' : 'rounded-full p-4 px-6'}`}
              style={{
                zIndex: 10000,
                boxShadow: (isListening || isSubmitting) ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
                borderColor: (isListening || isSubmitting) ? "var(--color-primary)" : "var(--color-border)",
                transition: "border-color 0.2s ease-out, box-shadow 0.1s linear, border-radius 0.2s ease-in-out"
              }}
            >
              <div className="w-full flex flex-col pointer-events-auto cursor-default">
                <div className="w-full flex items-center gap-4">
                  <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0" disabled={isSubmitting}>
                    <Mic className={`w-6 h-6 ${isListening ? 'text-[var(--color-primary)]' : 'text-muted-foreground'}`} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={isSubmitting}
                    placeholder={isSubmitting ? "Working..." : "ask your sous chef"}
                    className={`w-full bg-transparent border-none text-foreground text-xl md:text-2xl outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light flex-1 ${isSubmitting ? 'opacity-50' : ''}`}
                    rows={1}
                    autoFocus
                  />
                  <button 
                    onClick={onToggle}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 p-2 hover:bg-card rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-medium mt-2 ml-10">
                    {errorMessage}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Collapsed OmniBar (or /home Focus Page OmniBar which is inline) */}
      {(!isExpanded || isFocusPage) && (
        <motion.div
          layoutId="omnibar-container"
          className={`relative z-10 overflow-hidden cursor-pointer flex items-center
            ${isFocusPage 
              ? `w-full max-w-3xl bg-[var(--color-card)] border shadow-2xl transition-all duration-300 ${isMultiLine ? 'rounded-[32px] p-6' : 'rounded-full p-4 px-6'}`
              : "w-12 h-12 rounded-full bg-[var(--color-card)] border"
            }
          `}
          style={{
            boxShadow: (isListening || isSubmitting) ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
            borderColor: (isListening || isSubmitting) ? "var(--color-primary)" : "var(--color-border)",
            transition: "border-color 0.2s ease-out, box-shadow 0.1s linear, border-radius 0.2s ease-in-out"
          }}
          onClick={!isFocusPage && !isExpanded ? onToggle : undefined}
        >
          <AnimatePresence mode="wait">
            {!isFocusPage && !isExpanded ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-full flex flex-col pointer-events-auto cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-full flex items-center gap-4">
                  <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0" disabled={isSubmitting}>
                    <Mic className={`w-6 h-6 ${isListening ? 'text-[var(--color-primary)]' : 'text-muted-foreground'}`} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={isSubmitting}
                    placeholder={isSubmitting ? "Working..." : "ask your sous chef"}
                    className={`w-full bg-transparent border-none text-foreground text-xl md:text-2xl outline-none resize-none overflow-hidden placeholder:text-muted-foreground/50 font-light flex-1 ${isSubmitting ? 'opacity-50' : ''}`}
                    rows={1}
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-medium mt-2 ml-10">
                    {errorMessage}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
