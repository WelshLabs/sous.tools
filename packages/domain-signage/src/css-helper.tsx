"use client";

import React, { useRef } from "react";
import { Copy, Sparkles, BookOpen, ChevronDown } from "lucide-react";

interface CssHelperProps {
  value: string;
  onChange: (val: string) => void;
}

import { CSS_DICTIONARY, CSS_PRESETS } from "./css-reference-data";

/**
 * CssHelper is a utility component providing a custom CSS text area editor,
 * preset stylesheets, and a dictionary of common CSS classes used in signage styling.
 *
 * @tenant-docs-export
 * Use the CSS Helper to browse available selector classes and apply presets to your digital menu layout.
 */
export const CssHelper: React.FC<CssHelperProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (text: string): void => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + "\n" + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = value.substring(0, start) + text + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
      <div className="lg:col-span-2 flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-zinc-300">
            Custom CSS Editor
          </span>
          <span className="text-[10px] text-zinc-500">
            Auto-injects styles
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/* Write custom CSS here */"
          className="flex-1 p-3 bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none focus:outline-none"
        />
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Class Dictionary Accordion */}
        <div className="bg-zinc-950/50 border border-black/5 dark:border-white/5 rounded-xl p-3">
          <h3 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Class Dictionary
          </h3>
          <div className="space-y-2">
            {Object.entries(CSS_DICTIONARY).map(([category, classes]) => (
              <details
                key={category}
                className="group border border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-card rounded-lg overflow-hidden"
              >
                <summary className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-800 transition-colors list-none">
                  {category}
                  <span className="group-open:rotate-180 transition-transform">
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </span>
                </summary>
                <div className="px-2 pb-2 space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5 bg-zinc-950/30">
                  {classes.map((d) => (
                    <div
                      key={d.className}
                      className="flex flex-col gap-0.5 p-1.5 rounded hover:bg-zinc-800 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-blue-400 font-semibold">
                          {d.className}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() =>
                              insertText(`${d.className} {\n  \n}`)
                            }
                            className="text-[10px] bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-700 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() => copyToClipboard(d.className)}
                            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 cursor-pointer p-0.5"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-zinc-400 dark:text-zinc-500 text-[10px] leading-tight">
                        {d.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] rounded-xl p-3">
          <h3 className="text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Preset Recipes
          </h3>
          <div className="space-y-2">
            {CSS_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => insertText(p.css)}
                className="w-full text-left p-2 rounded hover:bg-zinc-900 border border-zinc-800 bg-zinc-950 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-zinc-200">
                  {p.name}
                </div>
                <div className="text-[9px] text-zinc-500 truncate font-mono mt-0.5">
                  {p.css.split("\n")[0]}...
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
