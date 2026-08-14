import React from "react";
import {
  type PosItem,
  type MenuItemStyles,
  type UpgradeItem,
} from "@soustools/api-types";
import {
  resolveItemState,
  buildTitleStyle,
  buildPriceStyle,
  buildCardStyle,
} from "@/app/display/[id]/menu-item-style-utils";

interface NestedItemBlockProps {
  basePosItemId?: string;
  upgradeItems?: UpgradeItem[];
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
  panelStyle?: string;
  className?: string;
}

export function NestedItemBlock({
  basePosItemId,
  upgradeItems = [],
  items,
  menuItemStyles,
  panelStyle,
  className,
}: NestedItemBlockProps) {
  const baseItem = items.find(
    (i) => i.id === basePosItemId || i.externalId === basePosItemId,
  );

  // Fallback if base item is a seeded mock/dummy not in DB
  const baseName = baseItem
    ? baseItem.name
    : basePosItemId
      ? basePosItemId
          .replace("dummy-", "")
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Unknown Item";
  const basePrice = baseItem ? Number(baseItem.price) : 0;
  const isBaseSoldOut = baseItem ? baseItem.isSoldOut : false;

  const baseStateStyle = baseItem
    ? resolveItemState(baseItem, false, menuItemStyles)
    : menuItemStyles.regular;

  const cardStyle = buildCardStyle(baseStateStyle);
  const titleStyle = buildTitleStyle(baseStateStyle);
  const priceStyle = buildPriceStyle(baseStateStyle);

  const isFlat =
    panelStyle === "none" ||
    baseStateStyle.backgroundColor === "transparent" ||
    !baseStateStyle.backgroundColor;

  let borderClass = "border";
  if (isFlat) {
    borderClass = "border-transparent bg-transparent";
    delete cardStyle.backgroundColor;
    delete cardStyle.borderColor;
    delete cardStyle.borderWidth;
    delete cardStyle.boxShadow;
  }

  const isGroupHeader = basePrice === 0;

  const containerClasses = [
    `p-6 rounded-2xl ${borderClass} flex flex-col gap-3 transition-all duration-300 relative`,
    panelStyle === "glass" ? "" : "st-nested-item",
    panelStyle === "glass" ? "" : className,
  ]
    .filter(Boolean)
    .join(" ");

  const element = (
    <div
      className={containerClasses}
      style={{
        ...cardStyle,
        opacity: isBaseSoldOut ? (menuItemStyles.soldOut.dimOpacity ?? 0.5) : 1,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h3
          className={
            isGroupHeader
              ? "font-brand st-menu-glow-text st-category-header text-[22px] font-extrabold tracking-widest text-[#00f0ff] uppercase"
              : "text-xl font-bold tracking-tight"
          }
          style={titleStyle}
        >
          {baseName}
        </h3>
        {basePrice > 0 && (
          <span
            className="st-price-tag text-lg font-extrabold whitespace-nowrap"
            style={priceStyle}
          >
            ${basePrice.toFixed(2)}
          </span>
        )}
      </div>

      <ul
        className={`flex flex-col gap-2 ${isGroupHeader ? "" : "border-l border-zinc-800 pl-4"}`}
      >
        {upgradeItems.map((upgrade, idx) => {
          const upItem = items.find(
            (i) =>
              i.id === upgrade.posItemId || i.externalId === upgrade.posItemId,
          );
          const upName = upItem
            ? upItem.name
            : upgrade.posItemId
                .replace("dummy-", "")
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
          const upPrice = upItem ? Number(upItem.price) : null;
          const isUpSoldOut = upItem ? upItem.isSoldOut : false;

          const upStateStyle = upItem
            ? resolveItemState(upItem, false, menuItemStyles)
            : menuItemStyles.regular;

          const upTitleStyle = buildTitleStyle(upStateStyle);
          const upPriceStyle = buildPriceStyle(upStateStyle);

          if (upStateStyle.hidden && isUpSoldOut) return null;

          return (
            <li
              key={idx}
              className="flex items-center justify-between text-sm transition-opacity duration-300"
              style={{
                opacity: isUpSoldOut
                  ? (menuItemStyles.soldOut.dimOpacity ?? 0.5)
                  : 1,
              }}
            >
              <div className="flex flex-col">
                <span
                  className="font-semibold text-zinc-300"
                  style={upTitleStyle}
                >
                  {isGroupHeader ? upName : `• ${upName}`}
                  {isUpSoldOut && menuItemStyles.soldOut.badge && (
                    <span className="st-sold-out-badge ml-2 rounded bg-red-500 px-1 text-[8px] font-bold text-white uppercase">
                      {menuItemStyles.soldOut.badge.text}
                    </span>
                  )}
                </span>
                {upgrade.modifierDescription && (
                  <span className="pl-3 font-sans text-xs text-zinc-500 italic">
                    {upgrade.modifierDescription}
                  </span>
                )}
              </div>
              {upPrice !== null && upPrice > 0 && (
                <span
                  className="text-muted-foreground st-price-tag pl-4 font-bold"
                  style={upPriceStyle}
                >
                  {isGroupHeader
                    ? `$${upPrice.toFixed(2)}`
                    : `+$${upPrice.toFixed(2)}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  if (panelStyle === "glass") {
    return (
      <div
        className={["st-nested-item p-4", className].filter(Boolean).join(" ")}
      >
        {element}
      </div>
    );
  }
  return element;
}
