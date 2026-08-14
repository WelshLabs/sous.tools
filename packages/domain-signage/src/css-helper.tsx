"use client";

import { useRef } from "react";
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
    <div className="grid h-[400px] grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="bg-background flex h-full flex-col overflow-hidden rounded-xl border border-zinc-900 lg:col-span-2">
        <div className="bg-card border-border flex items-center justify-between border-b px-4 py-2">
          <span className="text-muted-foreground text-xs font-semibold">
            Custom CSS Editor
          </span>
          <span className="text-muted-foreground text-[10px]">
            Auto-injects styles
          </span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/* Write custom CSS here */"
          className="bg-background text-foreground flex-1 resize-none p-3 font-mono text-xs focus:outline-none"
        />
      </div>

      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Class Dictionary Accordion */}
        <div className="bg-background/50 border-border rounded-xl border p-3">
          <h3 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5" /> Class Dictionary
          </h3>
          <div className="space-y-2">
            {Object.entries(CSS_DICTIONARY).map(([category, classes]) => (
              <details
                key={category}
                className="group border-border bg-card overflow-hidden rounded-lg border"
              >
                <summary className="text-muted-foreground hover:bg-secondary flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11px] font-bold transition-colors">
                  {category}
                  <span className="transition-transform group-open:rotate-180">
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </span>
                </summary>
                <div className="border-border bg-background/30 space-y-1.5 border-t px-2 pt-1 pb-2">
                  {classes.map((d) => (
                    <div
                      key={d.className}
                      className="hover:bg-secondary flex flex-col gap-0.5 rounded p-1.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-blue-400">
                          {d.className}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() =>
                              insertText(`${d.className} {\n  \n}`)
                            }
                            className="bg-secondary text-muted-foreground cursor-pointer rounded px-1.5 py-0.5 text-[10px] hover:bg-zinc-700"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() => copyToClipboard(d.className)}
                            className="text-muted-foreground hover:text-muted-foreground cursor-pointer p-0.5"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-[10px] leading-tight">
                        {d.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[oklch(0.26_0.03_180)] bg-[oklch(0.16_0.02_180)] p-3">
          <h3 className="text-muted-foreground mb-2 flex items-center gap-1 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> Preset Recipes
          </h3>
          <div className="space-y-2">
            {CSS_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => insertText(p.css)}
                className="hover:bg-card border-border bg-background w-full cursor-pointer rounded border p-2 text-left transition-colors"
              >
                <div className="text-foreground text-[11px] font-bold">
                  {p.name}
                </div>
                <div className="text-muted-foreground mt-0.5 truncate font-mono text-[9px]">
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
