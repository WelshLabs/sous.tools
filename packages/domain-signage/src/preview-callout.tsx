"use client";

import * as LucideIcons from "lucide-react";
import { getTypoStyle } from "./menu-item-style-utils";

export function PreviewCallout({ block }: { block: any }) {
  const b = block as any;
  const isGlass = block.panelStyle === "glass";
  const classes = [
    "p-5 rounded-xl flex flex-col items-center text-center gap-3 st-callout w-full",
    isGlass
      ? "st-glass-panel border border-border"
      : block.panelStyle !== "none"
        ? "bg-card border border-border"
        : "",
    block.accentBorder ? "border-t-4 border-t-cyan-400" : "",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");

  const IconComponent = b.iconName
    ? (LucideIcons as any)[b.iconName] || LucideIcons.Info
    : LucideIcons.Info;
  const bgStyle =
    b.backgroundOpacity !== undefined && !isGlass && block.panelStyle !== "none"
      ? { backgroundColor: `rgba(24, 24, 27, ${b.backgroundOpacity})` }
      : {};
  const typoStyle = getTypoStyle(block, "body");

  return (
    <div
      className={classes}
      data-unique-id={block.uniqueSelector}
      style={bgStyle}
    >
      <div className="shrink-0">
        <IconComponent className="h-6 w-6 text-cyan-400" />
      </div>
      <div
        className="flex w-full flex-col items-center justify-center gap-1"
        style={{
          ...typoStyle,
          fontSize: typoStyle.fontSize || b.fontSize,
          color: typoStyle.color || b.textColor,
        }}
      >
        {b.title && (
          <span
            className="text-lg font-bold tracking-wide"
            style={{ fontFamily: `var(--global-heading-font)` }}
          >
            {b.title}
          </span>
        )}
        {b.message && (
          <span
            className="leading-snug"
            style={{
              fontSize: typoStyle.fontSize
                ? `calc(${typoStyle.fontSize} * 0.75)`
                : b.fontSize
                  ? `calc(${b.fontSize} * 0.75)`
                  : undefined,
            }}
          >
            {b.message}
          </span>
        )}
      </div>
    </div>
  );
}
