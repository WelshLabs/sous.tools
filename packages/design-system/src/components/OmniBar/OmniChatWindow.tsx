import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type OmniMessage } from "@soustools/api-types";
import { UnifiedReviewPanel } from "./UnifiedReviewPanel";
import { useOmniActions } from "./use-omni-actions.hook";
import { api } from "@soustools/api-client";
import Link from "next/link";

export interface OmniChatWindowProps {
  chatHistory: OmniMessage[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function OmniChatWindow({ chatHistory, scrollRef }: OmniChatWindowProps) {
  const [masterIngredients, setMasterIngredients] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await api.GET("/items", { params: { query: { search: "" } } });
        if (error) throw new Error(String(error));
        if (data && data.data) {
          const items = data.data as Array<{ id: string; name: string }>;
          setMasterIngredients(items.map(d => ({ id: d.id, name: d.name })));
        }
      } catch (err) {
        console.error("Failed to load items in OmniChatWindow", err);
      }
    };
    fetchItems();
  }, []);

  const {
    handleConfirmAlias,
    handleUpdateIngredient,
    handleUpdateInvoiceItem,
    handleSaveInvoice,
    handleSaveRecipe,
  } = useOmniActions();

  if (chatHistory.length === 0) return null;

  const hasRecipeOrInvoice = chatHistory.some((m) => !!m.recipeData || !!m.invoiceData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="w-full bg-card border border-border shadow-2xl rounded-[32px] p-4 pointer-events-auto flex flex-col"
    >
      <div 
        ref={scrollRef}
        className={`w-full flex flex-col gap-2.5 ${hasRecipeOrInvoice ? 'max-h-[60vh]' : 'max-h-[35vh]'} overflow-y-auto pr-2
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-cyan-500/50 
          [&::-webkit-scrollbar-thumb]:shadow-[0_0_8px_rgba(0,255,255,0.5)]
          [&::-webkit-scrollbar-thumb]:rounded-full 
          hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/80 
          transition-colors`}
      >
        {chatHistory.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isAgentStep = msg.role === 'agent_step';
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id || index}
              className={`flex flex-col ${(msg.recipeData || msg.invoiceData) ? 'w-full max-w-none' : 'max-w-[85%]'} ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {isAgentStep ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-70 font-mono bg-card rounded-xl px-3 py-1.5 border border-border">
                  {msg.isLoading !== false && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                  {msg.content}
                </div>
              ) : (msg.recipeData || msg.invoiceData) ? (
                <div className="w-full p-2">
                  <UnifiedReviewPanel
                    payload={msg.recipeData || msg.invoiceData}
                    masterIngredients={masterIngredients}
                    onConfirmAlias={(rawString, masterId) => handleConfirmAlias(rawString, masterId)}
                    onUpdateItem={(itemIndex, updates) => {
                      if (msg.recipeData) {
                        handleUpdateIngredient(index, itemIndex, updates);
                      } else {
                        handleUpdateInvoiceItem(index, itemIndex, updates);
                      }
                    }}
                    onSaveRecipe={handleSaveRecipe}
                    onSaveInvoice={handleSaveInvoice}
                    onItemCreated={(newItem) => {
                      setMasterIngredients((prev) => [...prev, newItem]);
                    }}
                  />
                </div>
              ) : (
                <div className={`px-4 py-2 rounded-2xl flex flex-col gap-1.5 ${
                  isUser 
                    ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm' 
                    : 'bg-card border border-border text-foreground rounded-tl-sm'
                }`}>
                  {msg.content.match(/(https?|blob|data):[^\s]+/) ? (
                    <motion.div layoutId={`active-task-container-${msg.id}`} className="w-48 h-32 rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative">
                      <img src={msg.content.match(/(https?|blob|data):[^\s]+/)![0]} alt="Uploaded file" className="w-full h-full object-cover" />
                    </motion.div>
                  ) : null}
                  <span>
                    {msg.content.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
                      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
                      if (match) {
                        return (
                          <Link key={i} href={match[2]} className="text-cyan-400 hover:underline font-medium">
                            {match[1]}
                          </Link>
                        );
                      }
                      return <span key={i}>{part.replace(/(https?|blob|data):[^\s]+/, '')}</span>;
                    })}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
