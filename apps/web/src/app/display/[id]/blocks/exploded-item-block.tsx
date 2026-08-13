import React from "react";
import { type PosItem } from "@soustools/api-types";

interface ExplodedItemBlockProps {
  menuItemId?: string;
  items: PosItem[];
  panelStyle?: string;
  className?: string;
  children?: React.ReactNode;
  hideTitle?: boolean;
  hidePrice?: boolean;
  hideDescription?: boolean;
}

export function ExplodedItemBlock({
  menuItemId,
  items,
  panelStyle,
  className,
  children,
  hideTitle,
  hidePrice,
  hideDescription,
}: ExplodedItemBlockProps) {
  const isGlass = panelStyle === "glass" || !panelStyle;
  const containerClasses = [
    isGlass ? "" : "border-transparent bg-transparent",
    "rounded-2xl p-6 flex flex-col gap-6 text-zinc-100 my-4",
    "st-exploded-item",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const explodedItem = menuItemId
    ? items.find((i) => i.id === menuItemId || i.externalId === menuItemId)
    : null;

  return (
    <div className={containerClasses}>
      {/* Header */}
      {explodedItem && (
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
          {(!hideTitle || !hidePrice) && (
            <div className="flex justify-between items-center flex-wrap gap-2">
              {!hideTitle && (
                <h3 className="text-3xl font-extrabold uppercase tracking-widest font-brand st-menu-glow-text">
                  {explodedItem.name}
                </h3>
              )}
              {!hidePrice && (
                <div className="text-[14px] font-medium text-muted-foreground tracking-wider uppercase ml-auto">
                  BASE{" "}
                  <span className="font-extrabold text-[#00f0ff] ml-1 st-menu-glow-text">
                    ${Number(explodedItem.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
          {!hideDescription && explodedItem.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {explodedItem.description}
            </p>
          )}
        </div>
      )}

      {/* Children Drop Zone */}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
