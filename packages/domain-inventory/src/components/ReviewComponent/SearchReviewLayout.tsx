"use client";

import React, { useState, useEffect } from "react";
import { UniversalReviewComponent } from "./UniversalReviewComponent";
import { Mic, Search, Sparkles } from "lucide-react";

export interface SearchReviewLayoutProps {
  initialQuery?: string;
  initialReviewId?: string;
}

export function SearchReviewLayout({
  initialQuery = "",
  initialReviewId,
}: SearchReviewLayoutProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isListening, setIsListening] = useState(false);
  const [isLockedTop, setIsLockedTop] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(
    initialReviewId || null
  );

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          handleSearch(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleSearch = (textToSearch?: string) => {
    const searchText = textToSearch || query;
    if (!searchText.trim()) return;

    setIsLockedTop(true);
    setAiSummary(
      `Heard, Chef. Analyzing search query "${searchText}". Document ingestion review active.`
    );
    if (!activeReviewId) {
      setActiveReviewId("demo-review");
    }
  };

  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center p-4 md:p-8">
      {/* ── Top Nav Locked Omnibar ── */}
      <div
        className={`w-full max-w-4xl transition-all duration-300 ${
          isLockedTop ? "sticky top-4 z-40 mb-6" : "mt-[15vh] mb-8"
        }`}
      >
        <div className="relative flex items-center w-full p-2.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-2xl focus-within:border-emerald-500/50">
          <Search className="w-5 h-5 ml-3 text-zinc-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search recipes, invoices, suppliers, or speak commands..."
            className="flex-1 px-3 py-1.5 bg-transparent text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />

          {/* Microphone button for Voice-to-Text */}
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Voice input"
            className={`p-2.5 rounded-full transition-all ${
              isListening
                ? "bg-red-500/20 text-red-400 animate-pulse border border-red-500/50"
                : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleSearch()}
            className="ml-1 px-4 py-2 text-xs font-bold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
          >
            Action
          </button>
        </div>
      </div>

      {/* ── Main Layout Container ── */}
      <div className="w-full max-w-6xl flex flex-col gap-6">
        {/* SECTION 1: AI Summary */}
        {aiSummary && (
          <div className="w-full p-4 rounded-xl bg-zinc-900/70 border border-emerald-500/20 flex items-start gap-3 text-sm text-zinc-200 shadow-lg">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Section 1 — AI Intelligence Summary
              </span>
              <p>{aiSummary}</p>
            </div>
          </div>
        )}

        {/* SECTION 2: Dynamic React Component (UniversalReviewComponent) */}
        <div className="w-full">
          <UniversalReviewComponent reviewId={activeReviewId || "demo-review"} />
        </div>
      </div>
    </div>
  );
}
