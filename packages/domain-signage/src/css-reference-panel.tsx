"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { CSS_DICTIONARY, CSS_PRESETS } from "./css-reference-data";

interface CssReferencePanelProps {
  onInsertText: (text: string) => void;
}

/** Molecule: Collapsible CSS reference sidebar with class dictionary + preset snippets. */
export function CssReferencePanel({ onInsertText }: CssReferencePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`border-border bg-card flex flex-col overflow-hidden border-l transition-all duration-300 ${isCollapsed ? "w-10" : "w-72"} shrink-0`}
    >
      <div className="border-border flex shrink-0 items-center justify-between border-b px-2 py-2.5">
        {!isCollapsed && (
          <span className="text-muted-foreground ml-1 text-[11px] font-bold tracking-widest uppercase">
            Reference
          </span>
        )}
        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 ml-auto cursor-pointer rounded p-1 transition"
          title={isCollapsed ? "Expand reference" : "Collapse reference"}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
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
                        className="hover:bg-secondary flex items-start justify-between gap-1 rounded p-1.5 text-[11px]"
                      >
                        <div className="min-w-0">
                          <span className="block truncate font-mono font-semibold text-blue-400">
                            {d.className}
                          </span>
                          <span className="text-muted-foreground block text-[10px]">
                            {d.desc}
                          </span>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() =>
                              onInsertText(`${d.className} {\n  \n}`)
                            }
                            className="bg-secondary text-muted-foreground cursor-pointer rounded px-1.5 py-0.5 text-[10px] hover:bg-zinc-700"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(d.className)
                            }
                            className="text-muted-foreground hover:text-muted-foreground cursor-pointer p-0.5"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-background/50 border-border rounded-xl border p-3">
            <h3 className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" /> Preset Recipes
            </h3>
            <div className="space-y-2">
              {CSS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => onInsertText(p.css)}
                  className="hover:bg-secondary border-border bg-card w-full cursor-pointer rounded border p-2 text-left transition-colors"
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
      )}
    </div>
  );
}
