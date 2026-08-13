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
      <div className="flex justify-between items-start gap-4">
        <h3
          className={
            isGroupHeader
              ? "text-[22px] font-extrabold uppercase tracking-widest text-[#00f0ff] font-brand st-menu-glow-text st-category-header"
              : "text-xl font-bold tracking-tight"
          }
          style={titleStyle}
        >
          {baseName}
        </h3>
        {basePrice > 0 && (
          <span
            className="text-lg font-extrabold whitespace-nowrap st-price-tag"
            style={priceStyle}
          >
            ${basePrice.toFixed(2)}
          </span>
        )}
      </div>

      <ul
        className={`flex flex-col gap-2 ${isGroupHeader ? "" : "pl-4 border-l border-zinc-800"}`}
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
              className="flex justify-between items-center text-sm transition-opacity duration-300"
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
                    <span className="ml-2 text-[8px] px-1 bg-red-500 text-white rounded font-bold uppercase st-sold-out-badge">
                      {menuItemStyles.soldOut.badge.text}
                    </span>
                  )}
                </span>
                {upgrade.modifierDescription && (
                  <span className="text-xs text-zinc-500 font-sans italic pl-3">
                    {upgrade.modifierDescription}
                  </span>
                )}
              </div>
              {upPrice !== null && upPrice > 0 && (
                <span
                  className="font-bold text-muted-foreground pl-4 st-price-tag"
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
        className={[" p-4 st-nested-item", className].filter(Boolean).join(" ")}
      >
        {element}
      </div>
    );
  }
  return element;
}
