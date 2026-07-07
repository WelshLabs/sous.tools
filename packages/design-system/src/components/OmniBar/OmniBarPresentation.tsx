"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Loader2 } from "lucide-react";
import { OmniMessage } from "@soustools/api-types";

export interface OmniBarPresentationProps {
  isOpen: boolean;
  isListening: boolean;
  isProcessing?: boolean;
  chatHistory: OmniMessage[];
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
  isOpen,
  isListening,
  isProcessing = false,
  chatHistory = [],
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
  const scrollRef = useRef<HTMLDivElement>(null);
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
    }
  }, [inputText, isOpen]);

  // Auto-scroll chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  // A helper component to render the chat history
  const ChatHistoryList = () => (
    <div 
      ref={scrollRef}
      className={`w-full flex flex-col gap-4 max-h-[60vh] overflow-y-auto mb-4 
        [&::-webkit-scrollbar]:w-1.5 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-[var(--color-border)] 
        [&::-webkit-scrollbar-thumb]:rounded-full 
        hover:[&::-webkit-scrollbar-thumb]:bg-white/20 
        transition-colors pr-2`}
    >
      {chatHistory.map((msg, index) => {
        const isUser = msg.role === 'user';
        const isAgentStep = msg.role === 'agent_step';
        
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id || index}
            className={`flex flex-col max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
          >
            {isAgentStep ? (
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] font-mono bg-black/20 rounded-xl px-4 py-2 border border-[var(--color-border)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
                {msg.content}
              </div>
            ) : (
              <div className={`px-5 py-3 rounded-2xl ${
                isUser 
                  ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-foreground)] rounded-tr-sm' 
                  : 'bg-black/30 border border-[var(--color-border)] text-[var(--color-foreground)] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Portal the backdrop AND the expanded OmniBar so they escape the App Bar's stacking context */}
      {mounted && !isFocusPage && createPortal(
        <AnimatePresence>
          {isOpen && (
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
          {isOpen && (
            <motion.div
              key="expanded-omnibar"
              layoutId="omnibar-container"
              className={`fixed flex flex-col top-[15%] md:top-1/4 left-[5%] right-[5%] md:left-[15%] md:right-[15%] lg:left-[25%] lg:right-[25%] bg-[var(--color-card)] border shadow-2xl transition-all duration-300 rounded-[32px] p-6`}
              style={{
                zIndex: 10000,
                boxShadow: (isListening || isProcessing) ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
                borderColor: (isListening || isProcessing) ? "var(--color-primary)" : "var(--color-border)",
                transition: "border-color 0.2s ease-out, box-shadow 0.1s linear, border-radius 0.2s ease-in-out"
              }}
            >
              <div className="w-full flex flex-col pointer-events-auto cursor-default h-full">
                {chatHistory.length > 0 && <ChatHistoryList />}
                
                <div className="w-full flex items-center gap-4 bg-black/20 p-2 px-4 rounded-full border border-white/5">
                  <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0 transition-transform hover:scale-110" disabled={isProcessing}>
                    <Mic className={`w-5 h-5 ${isListening ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={isProcessing}
                    placeholder={isProcessing ? "Chef is thinking..." : "Ask your sous chef"}
                    className={`w-full bg-transparent border-none text-[var(--color-foreground)] text-lg md:text-xl outline-none resize-none overflow-hidden placeholder:text-[var(--color-muted-foreground)]/50 font-light flex-1 py-1 leading-snug ${isProcessing ? 'opacity-50' : ''}`}
                    rows={1}
                    autoFocus
                  />
                  <button 
                    onClick={onToggle}
                    className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] flex-shrink-0 p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm font-medium mt-3 ml-2">
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
      {(!isOpen || isFocusPage) && (
        <motion.div
          layoutId="omnibar-container"
          className={`relative z-10 flex flex-col cursor-pointer
            ${isFocusPage 
              ? `w-full max-w-4xl mx-auto bg-[var(--color-card)] border shadow-2xl transition-all duration-300 rounded-[32px] p-6`
              : "w-12 h-12 rounded-full bg-[var(--color-card)] border items-center justify-center overflow-hidden"
            }
          `}
          style={{
            boxShadow: (isListening || isProcessing) ? `0 0 ${20 + volume * 60}px var(--color-primary)` : undefined,
            borderColor: (isListening || isProcessing) ? "var(--color-primary)" : "var(--color-border)",
            transition: "border-color 0.2s ease-out, box-shadow 0.1s linear, border-radius 0.2s ease-in-out"
          }}
          onClick={!isFocusPage && !isOpen ? onToggle : undefined}
        >
          <AnimatePresence mode="wait">
            {!isFocusPage && !isOpen ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-full h-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
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
                {chatHistory.length > 0 && <ChatHistoryList />}

                <div className="w-full flex items-center gap-4 bg-black/20 p-2 px-4 rounded-full border border-white/5 mt-auto">
                  <button onClick={onMicClick} type="button" className="focus:outline-none flex-shrink-0 transition-transform hover:scale-110" disabled={isProcessing}>
                    <Mic className={`w-5 h-5 ${isListening ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    disabled={isProcessing}
                    placeholder={isProcessing ? "Chef is thinking..." : "Ask your sous chef"}
                    className={`w-full bg-transparent border-none text-[var(--color-foreground)] text-lg md:text-xl outline-none resize-none overflow-hidden placeholder:text-[var(--color-muted-foreground)]/50 font-light flex-1 py-1 leading-snug ${isProcessing ? 'opacity-50' : ''}`}
                    rows={1}
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm font-medium mt-3 ml-2">
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
