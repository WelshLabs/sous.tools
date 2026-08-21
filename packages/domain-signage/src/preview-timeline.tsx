"use client";

import { getTypoStyle } from "./preview-utils";

export function PreviewTimeline({ block }: { block: any }) {
  const b = block as any;
  const steps = b.steps || [];
  const markerType = b.markerType || "numbers";
  const isHorizontal = b.layout === "horizontal";

  const isGlass = block.panelStyle === "glass";
  const containerClasses = [
    "w-full flex p-3 relative st-timeline transition-all",
    isHorizontal
      ? "flex-row gap-3 overflow-x-auto items-stretch"
      : "flex-col gap-3",
    isGlass ? "st-glass-panel border border-border rounded-xl" : "",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");

  const typoStyle = getTypoStyle(block, "body", "typography");

  if (steps.length === 0) {
    return (
      <div className="border-border flex items-center justify-center rounded-xl border border-dashed p-4 text-center">
        <span className="text-muted-foreground text-[10px] italic">
          No timeline steps configured. Add steps in the block inspector.
        </span>
      </div>
    );
  }

  return (
    <div className={containerClasses} data-unique-id={block.uniqueSelector}>
      {steps.map((step: any, idx: number) => (
        <div
          key={step.id || idx}
          className={`relative z-10 flex ${
            isHorizontal
              ? "bg-card/40 border-border flex-1 flex-col items-center rounded-xl border p-2 text-center"
              : "items-start gap-3.5 py-1"
          }`}
        >
          {/* Timeline Connector Line for vertical */}
          {!isHorizontal && idx < steps.length - 1 && (
            <div className="absolute top-[26px] bottom-[-8px] left-[13px] w-0.5 bg-gradient-to-b from-cyan-400/60 to-cyan-500/20" />
          )}

          {/* Marker */}
          {markerType === "numbers" ? (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-cyan-400 bg-cyan-950 font-mono text-xs font-black text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]">
              {idx + 1}
            </div>
          ) : markerType === "glowing-dots" ? (
            <div className="mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-cyan-400 bg-cyan-950 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          ) : markerType === "step-cards" ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-[10px] font-bold text-cyan-400">
              #{idx + 1}
            </div>
          ) : (
            <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
          )}

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="text-foreground truncate text-xs font-bold tracking-wide"
                  style={{
                    fontFamily: "var(--global-heading-font)",
                    color: typoStyle.color,
                  }}
                >
                  {step.text}
                </span>
                {step.badge && (
                  <span className="py-0.2 shrink-0 rounded border border-cyan-500/30 bg-cyan-950/80 px-1.5 text-[8px] font-bold text-cyan-400 uppercase">
                    {step.badge}
                  </span>
                )}
              </div>
              {step.price && (
                <span className="shrink-0 font-mono text-xs font-bold text-cyan-400">
                  {step.price}
                </span>
              )}
            </div>

            {step.subtitle && (
              <p
                className="text-muted-foreground mt-0.5 text-[9px] leading-relaxed opacity-85"
                style={{
                  ...typoStyle,
                  fontSize: typoStyle.fontSize
                    ? `calc(${typoStyle.fontSize} * 0.8)`
                    : undefined,
                }}
              >
                {step.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
