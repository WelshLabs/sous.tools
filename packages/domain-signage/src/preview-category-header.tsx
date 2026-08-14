"use client";

import { getTypoStyle } from "./preview-utils";

export function PreviewCategoryHeader({ block }: { block: any }) {
  const isGlass = block.panelStyle === "glass";
  const classes = [
    "w-full p-2 rounded flex flex-col gap-0.5 st-category-header",
    isGlass ? "st-glass-panel" : "",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");
  const typoStyle = getTypoStyle(block, "heading", "typography");
  return (
    <div className={classes} data-unique-id={block.uniqueSelector}>
      <div className="flex w-full items-center justify-between gap-2">
        <h5
          className="flex-1 text-[10px] tracking-wider uppercase"
          style={{
            ...typoStyle,
            fontSize: typoStyle.fontSize || block.fontSize,
          }}
        >
          {block.title}
        </h5>
        {block.badge && (
          <span
            className={`text-foreground shrink-0 rounded bg-red-600 px-1 text-[6px] font-bold ${block.animateBadge ? "animate-pulse" : ""}`}
          >
            {block.badge}
          </span>
        )}
      </div>
      {block.subtitle && (
        <p
          className="text-[8px] opacity-80"
          style={getTypoStyle(block, "subtitle", "subtitleTypography")}
        >
          {block.subtitle}
        </p>
      )}
    </div>
  );
}
