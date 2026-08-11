import type React from "react";
import { type BlockSizing } from "@soustools/api-types";

export function getSizingStyles(sizing?: BlockSizing): React.CSSProperties {
  if (!sizing) return {};
  const { width, height, flexBasis, flexGrow, flexShrink, gap, padding, margin } = sizing;
  return {
    ...(width && { width }),
    ...(height && { height }),
    ...(flexBasis && { flexBasis }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(gap && { gap }),
    ...(padding && { padding }),
    ...(margin && { margin }),
  };
}

export function getLayoutClass(direction: "column" | "row" | "grid", panelStyle?: string, className?: string) {
  return [
    direction === "grid"
      ? "grid gap-3 w-full h-full min-h-[100px] min-w-[250px] st-layout-grid p-3 bg-background/20"
      : `flex flex-${direction === "column" ? "col" : "row"} flex-wrap gap-3 w-full h-full min-h-[100px] min-w-[250px] st-layout-${direction} p-3 bg-background/20`,
    panelStyle === "glass" ? "st-glass-panel p-4 rounded-2xl" : "",
    className
  ].filter(Boolean).join(" ");
}
