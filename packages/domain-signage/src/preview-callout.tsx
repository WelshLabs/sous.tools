"use client";

import * as LucideIcons from "lucide-react";
import { getTypoStyle } from "./preview-utils";

export function PreviewCallout({ block }: { block: any }) {
  const b = block as any;
  const isGlass = block.panelStyle === "glass";

  const accentColor = b.accentColor || "var(--global-accent, #22d3ee)";
  const accentPos = b.accentPosition || (b.accentBorder ? "top" : "left");
  const hasAccent = b.accentBorder !== false;

  let accentClasses = "";
  if (hasAccent) {
    if (accentPos === "left") accentClasses = "border-l-4";
    else if (accentPos === "top") accentClasses = "border-t-4";
    else if (accentPos === "bottom") accentClasses = "border-b-4";
    else if (accentPos === "right") accentClasses = "border-r-4";
    else if (accentPos === "all")
      accentClasses = "border-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]";
  }

  const classes = [
    "p-4 rounded-xl flex flex-col gap-2 st-callout w-full transition-all shadow-xl",
    isGlass
      ? "st-glass-panel border border-border"
      : block.panelStyle !== "none"
        ? "bg-card/70 border border-border"
        : "",
    accentClasses,
    block.className,
  ]
    .filter(Boolean)
    .join(" ");

  const IconComponent =
    b.iconName && b.iconName !== "none"
      ? (LucideIcons as any)[b.iconName] || LucideIcons.Info
      : null;

  const typoStyle = getTypoStyle(block, "body", "typography");

  return (
    <div
      className={classes}
      data-unique-id={block.uniqueSelector}
      style={{
        borderColor: hasAccent && accentPos !== "all" ? accentColor : undefined,
        ...block.visuals?.background,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {IconComponent && (
            <div className="shrink-0 rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
              <IconComponent
                className="h-5 w-5"
                style={{ color: accentColor }}
              />
            </div>
          )}
          {b.title && (
            <h4
              className="text-foreground text-sm font-bold tracking-wide"
              style={{
                fontFamily: "var(--global-heading-font)",
                color: typoStyle.color,
                fontSize: typoStyle.fontSize || undefined,
              }}
            >
              {b.title}
            </h4>
          )}
        </div>
        {b.badge && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black tracking-wider text-zinc-950 uppercase shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            {b.badge}
          </span>
        )}
      </div>

      {(b.message || b.subtitle) && (
        <p
          className="text-muted-foreground text-xs leading-relaxed opacity-90"
          style={{
            ...typoStyle,
            fontSize: typoStyle.fontSize
              ? `calc(${typoStyle.fontSize} * 0.85)`
              : undefined,
          }}
        >
          {b.message || b.subtitle}
        </p>
      )}
    </div>
  );
}
