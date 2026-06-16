"use client";

import React from "react";
import { ColumnConfig, PosItem, MenuItemStyles } from "@soustools/api-types";
import { SingleColumn } from "./single-column";

interface ColumnLayoutRendererProps {
  columns: ColumnConfig[];
  splitRatio?: string;
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
}

/** Parse a "60/40" splitRatio into flex-basis values for exactly 2 columns. */
function getSplitStyles(
  splitRatio: string | undefined,
  index: number,
  totalCols: number,
): React.CSSProperties {
  if (!splitRatio || totalCols !== 2) return { flex: 1 };
  const parts = splitRatio.split("/").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const pct = index === 0 ? parts[0] : parts[1];
    return { flex: `0 0 ${pct}%` };
  }
  return { flex: 1 };
}

export function ColumnLayoutRenderer({
  columns,
  splitRatio,
  items,
  menuItemStyles,
}: ColumnLayoutRendererProps) {
  return (
    <div className="w-full h-full min-h-screen bg-transparent flex flex-row p-0 gap-0">
      {columns.map((column, index) => {
        const style = getSplitStyles(splitRatio, index, columns.length);
        return (
          <SingleColumn
            key={index}
            column={column}
            index={index}
            style={style}
            items={items}
            menuItemStyles={menuItemStyles}
          />
        );
      })}
    </div>
  );
}
