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
      className={`flex flex-col border-l border-border bg-card transition-all duration-300 overflow-hidden ${isCollapsed ? "w-10" : "w-72"} shrink-0`}
    >
      <div className="flex items-center justify-between px-2 py-2.5 border-b border-border shrink-0">
        {!isCollapsed && (
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            Reference
          </span>
        )}
        <button
          onClick={() => setIsCollapsed((c) => !c)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer ml-auto"
          title={isCollapsed ? "Expand reference" : "Collapse reference"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="bg-background/50 border border-border rounded-xl p-3">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Class Dictionary
            </h3>
            <div className="space-y-2">
              {Object.entries(CSS_DICTIONARY).map(([category, classes]) => (
                <details
                  key={category}
                  className="group border border-border bg-card rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-3 py-2 text-[11px] font-bold text-muted-foreground cursor-pointer hover:bg-secondary transition-colors list-none">
                    {category}
                    <span className="group-open:rotate-180 transition-transform">
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </span>
                  </summary>
                  <div className="px-2 pb-2 space-y-1.5 pt-1 border-t border-border bg-background/30">
                    {classes.map((d) => (
                      <div
                        key={d.className}
                        className="flex justify-between items-start gap-1 p-1.5 rounded hover:bg-secondary text-[11px]"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-blue-400 font-semibold truncate block">
                            {d.className}
                          </span>
                          <span className="text-muted-foreground text-[10px] block">
                            {d.desc}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() =>
                              onInsertText(`${d.className} {\n  \n}`)
                            }
                            className="text-[10px] bg-secondary text-muted-foreground hover:bg-zinc-700 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(d.className)
                            }
                            className="text-muted-foreground hover:text-muted-foreground cursor-pointer p-0.5"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-background/50 border border-border rounded-xl p-3">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Preset Recipes
            </h3>
            <div className="space-y-2">
              {CSS_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => onInsertText(p.css)}
                  className="w-full text-left p-2 rounded hover:bg-secondary border border-border bg-card transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-bold text-foreground">
                    {p.name}
                  </div>
                  <div className="text-[9px] text-muted-foreground truncate font-mono mt-0.5">
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
