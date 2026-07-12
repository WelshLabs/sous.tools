"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type OmniMessage } from "@soustools/api-types";

export interface OmniChatWindowProps {
  chatHistory: OmniMessage[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function OmniChatWindow({ chatHistory, scrollRef }: OmniChatWindowProps) {
  if (chatHistory.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="w-full bg-card border border-border shadow-2xl rounded-[32px] p-4 pointer-events-auto flex flex-col"
    >
      <div 
        ref={scrollRef}
        className="w-full flex flex-col gap-2.5 max-h-[35vh] overflow-y-auto pr-2
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-cyan-500/50 
          [&::-webkit-scrollbar-thumb]:shadow-[0_0_8px_rgba(0,255,255,0.5)]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/80 
          transition-colors"
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-70 font-mono bg-card rounded-xl px-3 py-1.5 border border-border">
                  {msg.isLoading !== false && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {msg.content}
                </div>
              ) : (
                <div className={`px-4 py-2 rounded-2xl flex flex-col gap-1.5 ${
                  isUser 
                    ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm' 
                    : 'bg-card border border-border text-foreground rounded-tl-sm'
                }`}>
                  {msg.content.match(/https?:\/\/[^\s]+/) ? (
                    <motion.div layoutId={`file-${msg.id}`} className="w-48 h-32 rounded-xl overflow-hidden border border-border relative">
                      <img src={msg.content.match(/https?:\/\/[^\s]+/)![0]} alt="Uploaded file" className="w-full h-full object-cover" />
                    </motion.div>
                  ) : null}
                  <span>{msg.content.replace(/https?:\/\/[^\s]+/, '')}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
