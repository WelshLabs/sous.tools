"use client";

import { type MenuItemStyles, SignageBlock, PosItem } from "@soustools/api-types";
import { buildCardStyle, buildDescriptionStyle, resolveItemState, buildTitleStyle, buildPriceStyle } from "./menu-item-style-utils";

interface ComplexPreviewProps {
  block: SignageBlock;
  items: PosItem[];
  styles: MenuItemStyles;
}

export function PreviewNestedItem({ block, items, styles }: ComplexPreviewProps) {
  if (block.type !== "NestedItemBlock") return null;

  const baseItem = items.find((i) => i.id === block.basePosItemId || i.externalId === block.basePosItemId);
  const baseName = baseItem ? baseItem.name : (block.basePosItemId ? block.basePosItemId.replace("dummy-", "").split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Unknown Item");
  const basePrice = baseItem ? Number(baseItem.price) : 0;
  const isGroupHeader = basePrice === 0;
  
  const b = block as any;
  const baseDesc = b.baseDescriptionOverride || (baseItem?.description ?? "");

  const blockStyles = block.styles ?? styles;
  const optStyle = baseItem ? resolveItemState(baseItem, false, blockStyles) : blockStyles.regular;

  const isGlass = block.panelStyle === "glass";
  const isFlat = block.panelStyle === "none" || !blockStyles.regular.backgroundColor || blockStyles.regular.backgroundColor === "transparent";

  const containerClasses = [
    "p-2 rounded flex flex-col gap-1 text-[9px]",
    isFlat ? "bg-transparent border-transparent" : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5",
    isGlass ? "" : "st-nested-item",
    isGlass ? "" : block.className
  ].filter(Boolean).join(" ");

  const element = (
    <div className={containerClasses} style={isFlat ? undefined : buildCardStyle(optStyle)}>
      <div className="flex justify-between font-bold">
        <span style={buildTitleStyle(optStyle)} className={isGroupHeader ? "text-[#00f0ff] font-brand st-menu-glow-text text-[10px] tracking-widest uppercase st-category-header" : "st-menu-item-title"}>
          {baseName}
        </span>
        {!isGroupHeader && basePrice > 0 && <span style={buildPriceStyle(optStyle)} className="st-price-tag">${basePrice.toFixed(2)}</span>}
      </div>
      {baseDesc && (
        <div style={buildDescriptionStyle(optStyle)} className="text-[8px] opacity-80 -mt-0.5 mb-1 leading-snug">{baseDesc}</div>
      )}
      <ul className={`flex flex-col gap-0.5 text-[8px] opacity-80 ${isGroupHeader ? "" : "pl-2 border-l border-black/10 dark:border-white/10"}`}>
        {(b.upgradeItems || []).map((up: any, idx: number) => {
          const upItem = items.find((i) => i.id === up.posItemId || i.externalId === up.posItemId);
          const upName = upItem ? upItem.name : up.posItemId.replace("dummy-", "").split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          const upPrice = upItem ? Number(upItem.price) : null;
          const upDesc = up.overrideDescription || (upItem?.description ?? "");
          const upOptStyle = upItem ? resolveItemState(upItem, false, blockStyles) : blockStyles.regular;
          
          return (
            <li key={idx} className="flex flex-col mb-1">
              <div className="flex justify-between items-center">
                <span style={buildTitleStyle(upOptStyle)}>{isGroupHeader ? upName : `• ${upName}`}</span>
                {upPrice !== null && upPrice > 0 && (
                  <span style={buildPriceStyle(upOptStyle)} className="font-mono st-price-tag">{isGroupHeader ? `$${upPrice.toFixed(2)}` : `+$${upPrice.toFixed(2)}`}</span>
                )}
              </div>
              {upDesc && <div style={buildDescriptionStyle(upOptStyle)} className="text-[7px] opacity-70 pl-2 leading-tight">{upDesc}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return isGlass ? (
    <div className={["st-glass-panel p-2 rounded st-nested-item", block.className].filter(Boolean).join(" ")} data-unique-id={block.uniqueSelector}>{element}</div>
  ) : (
    <div data-unique-id={block.uniqueSelector} className="w-full">
      {element}
    </div>
  );
}
