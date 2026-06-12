"use client";

import React, { useRef } from "react";
import { Copy, Sparkles, BookOpen } from "lucide-react";

interface CssHelperProps {
  value: string;
  onChange: (val: string) => void;
}

const DICTIONARY = [
  { className: ".menu-item", desc: "Container for a menu item card" },
  { className: ".category-title", desc: "Headers for menu sections" },
  { className: ".price-tag", desc: "Pricing bubble or label text" },
  { className: ".item-description", desc: "Detail description subtext" },
  { className: ".sold-out-badge", desc: "Overlay badge on sold-out state" },
  { className: ".slide-container", desc: "Main slide canvas container" },
  { className: ".signage-overlay", desc: "Floating absolute layers container" },
];

const PRESETS = [
  {
    name: "Neon Glow",
    css: `.menu-item {\n  color: #fff;\n  text-shadow: 0 0 5px #0091FF, 0 0 10px #0091FF;\n  border: 2px solid #0091FF;\n  box-shadow: 0 0 10px #0091FF, inset 0 0 10px #0091FF;\n}`,
  },
  {
    name: "Retro Chalkboard",
    css: `.slide-container {\n  background: #1e281e;\n  font-family: 'Caveat', cursive;\n  color: #f4ebd0;\n  border: 10px dashed #f4ebd0;\n}\n.category-title {\n  border-bottom: 2px dashed #f4ebd0;\n}`,
  },
  {
    name: "Sliding Animations",
    css: `@keyframes slideIn {\n  from { transform: translateX(100%); opacity: 0; }\n  to { transform: translateX(0); opacity: 1; }\n}\n.menu-item {\n  animation: slideIn 0.5s ease-out;\n}`,
  },
];

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
      <div className="lg:col-span-2 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-300">
            Custom CSS Editor
          </span>
          <span className="text-[10px] text-slate-500">
            Auto-injects styles
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/* Write custom CSS here */"
          className="flex-1 p-3 bg-slate-950 text-slate-100 font-mono text-xs resize-none focus:outline-none"
        />
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        <div className="bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] rounded-xl p-3">
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Class Dictionary
          </h3>
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {DICTIONARY.map((d) => (
              <div
                key={d.className}
                className="flex justify-between items-start gap-1 p-1.5 rounded hover:bg-slate-800 text-[11px]"
              >
                <div className="min-w-0">
                  <span className="font-mono text-blue-400 font-semibold truncate block">
                    {d.className}
                  </span>
                  <span className="text-slate-400 text-[10px] block">
                    {d.desc}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => insertText(d.className + " {\n  \n}")}
                    className="text-[10px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Insert
                  </button>
                  <button
                    onClick={() => copyToClipboard(d.className)}
                    className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] rounded-xl p-3">
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Preset Recipes
          </h3>
          <div className="space-y-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => insertText(p.css)}
                className="w-full text-left p-2 rounded hover:bg-slate-800 border border-slate-700 bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-200">
                  {p.name}
                </div>
                <div className="text-[9px] text-slate-500 truncate font-mono mt-0.5">
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
