"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Copy, Sparkles, BookOpen } from "lucide-react";
import { CSS_DICTIONARY, CSS_PRESETS } from "./css-reference-data";

interface CssEditorModalProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

/**
 * CssEditorModal renders a two-pane CSS editor modal.
 * Left: textarea editor. Right: collapsible class dictionary + presets.
 */
export const CssEditorModal: React.FC<CssEditorModalProps> = ({ value, onChange, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const insertText = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) { onChange(value + "\n" + text); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = value.substring(0, start) + text + value.substring(end);
    onChange(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + text.length, start + text.length); }, 0);
  }, [value, onChange]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative flex flex-col bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl mx-4 w-full max-w-6xl overflow-hidden"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Custom CSS Editor</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Styles inject into the signage canvas. Press ESC or click outside to close.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-pane body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Editor */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 border-b border-slate-800 shrink-0">
              <span className="text-xs font-semibold text-slate-300">CSS Editor</span>
              <span className="text-[10px] text-slate-500">Auto-injects on save</span>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="/* Write custom CSS here */"
              className="flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none"
            />
          </div>

          {/* Right: Collapsible Reference */}
          <div className={`flex flex-col border-l border-white/5 bg-zinc-900 transition-all duration-300 overflow-hidden ${isCollapsed ? "w-10" : "w-72"} shrink-0`}>
            <div className="flex items-center justify-between px-2 py-2.5 border-b border-white/5 shrink-0">
              {!isCollapsed && <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Reference</span>}
              <button onClick={() => setIsCollapsed((c) => !c)} className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer ml-auto" title={isCollapsed ? "Expand reference" : "Collapse reference"}>
                {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Class Dictionary */}
                <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-3">
                  <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Class Dictionary</h3>
                  <div className="space-y-1.5">
                    {CSS_DICTIONARY.map((d) => (
                      <div key={d.className} className="flex justify-between items-start gap-1 p-1.5 rounded hover:bg-zinc-800 text-[11px]">
                        <div className="min-w-0">
                          <span className="font-mono text-blue-400 font-semibold truncate block">{d.className}</span>
                          <span className="text-zinc-500 text-[10px] block">{d.desc}</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => insertText(`${d.className} {\n  \n}`)} className="text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 px-1.5 py-0.5 rounded cursor-pointer">Insert</button>
                          <button onClick={() => navigator.clipboard.writeText(d.className)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer p-0.5"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Presets */}
                <div className="bg-zinc-950/50 border border-white/5 rounded-xl p-3">
                  <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Preset Recipes</h3>
                  <div className="space-y-2">
                    {CSS_PRESETS.map((p) => (
                      <button key={p.name} onClick={() => insertText(p.css)} className="w-full text-left p-2 rounded hover:bg-zinc-800 border border-zinc-800 bg-zinc-900 transition-colors cursor-pointer">
                        <div className="text-[11px] font-bold text-zinc-200">{p.name}</div>
                        <div className="text-[9px] text-zinc-500 truncate font-mono mt-0.5">{p.css.split("\n")[0]}...</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
