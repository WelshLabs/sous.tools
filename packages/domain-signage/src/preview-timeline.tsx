"use client";

import { getTypoStyle } from "./menu-item-style-utils";

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
      <div className="bg-background/20 absolute top-4 bottom-4 left-[15px] z-0 w-px"></div>
      {steps.length === 0 ? (
        <span className="text-muted-foreground bg-background relative z-10 pl-2 text-[10px] italic">
          No timeline steps configured.
        </span>
      ) : (
        steps.map((step: any) => (
          <div
            key={step.id}
            className="relative z-10 flex items-start gap-4 py-2"
          >
            <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-cyan-400 bg-cyan-900 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
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
