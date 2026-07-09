"use client";
import React from "react";

export function PreviewTimeline({ block }: { block: any }) {
    
      const b = block as any;
      const steps = b.steps || [];
      const classes = [
        "w-full flex flex-col p-2 relative st-timeline",
        block.className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div className={classes} data-unique-id={block.uniqueSelector}>
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/20 z-0"></div>
          {steps.length === 0 ? (
            <span className="text-[10px] text-zinc-500 italic relative z-10 bg-zinc-50 dark:bg-zinc-950 pl-2">
              No timeline steps configured.
            </span>
          ) : (
            steps.map((step: any) => (
              <div
                key={step.id}
                className="flex gap-4 items-start relative z-10 py-2"
              >
                <div className="w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-400 shrink-0 mt-0.5 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
                <div
                  className="flex flex-col gap-0.5"
                  style={getTypoStyle(block, "body")}
                >
                  <span className="font-bold">{step.text}</span>
                  {step.subtitle && (
                    <span className="text-[8px]" style={{ opacity: 0.8 }}>
                      {step.subtitle}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      );
    
}
