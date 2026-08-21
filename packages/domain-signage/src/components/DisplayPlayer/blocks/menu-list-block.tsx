import {
  type PosItem,
  type MenuItemStyles,
  type SignageBlock,
} from "@soustools/api-types";
import {
  resolveItemState,
  buildTitleStyle,
  buildPriceStyle,
  buildCardStyle,
  buildDescriptionStyle,
} from "../menu-item-style-utils";

type MenuListBlockProps = Extract<SignageBlock, { type: "MenuListBlock" }> & {
  items: PosItem[];
  menuItemStyles: MenuItemStyles;
};

export function MenuListBlock({
  itemIds,
  styles,
  panelStyle,
  className,
  items,
  menuItemStyles,
  itemModifiers,
  modifierLayout,
  hideDescriptions,
}: MenuListBlockProps) {
  if (!itemIds || itemIds.length === 0) return null;

  const isGlass = panelStyle === "glass";
  const containerClasses = [
    "flex flex-col gap-2 w-full st-menu-list",
    isGlass ? " p-2 border border-white/10 bg-white/5 rounded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {itemIds.map((itemId) => {
        const item = items.find(
          (i) => i.id === itemId || i.externalId === itemId,
        );
        if (!item) return null;

        const blockStyles = styles ?? menuItemStyles;
        const optStyle = resolveItemState(item, false, blockStyles);
        if (optStyle.hidden && item.isSoldOut) return null;

        const isFlatItem =
          panelStyle === "none" ||
          ((!blockStyles.regular.backgroundColor ||
            blockStyles.regular.backgroundColor === "transparent" ||
            blockStyles.regular.backgroundColor.includes("0,0,0,0")) &&
            (!blockStyles.regular.borderWidth ||
              !blockStyles.regular.borderColor ||
              blockStyles.regular.borderColor === "transparent"));

        let borderClass = "border";
        const cardStyle = buildCardStyle(optStyle);
        if (isFlatItem) {
          borderClass = "border-transparent bg-transparent px-2 py-1.5";
          delete cardStyle.backgroundColor;
          delete cardStyle.borderColor;
          delete cardStyle.borderWidth;
          delete cardStyle.boxShadow;
        }

        const titleStyle = buildTitleStyle(optStyle);
        const priceStyle = buildPriceStyle(optStyle);
        const descStyle = buildDescriptionStyle(optStyle);

        const overrides = itemModifiers?.[itemId] || [];
        const isInlineMod = modifierLayout === "inline";

        return (
          <div
            key={item.id}
            className={`flex w-full flex-col items-start justify-between gap-1 rounded-xl ${borderClass} st-menu-item relative transition-all duration-300`}
            style={{
              ...cardStyle,
              opacity: item.isSoldOut
                ? (blockStyles.soldOut.dimOpacity ?? 0.5)
                : 1,
            }}
          >
            <div className="flex w-full items-start justify-between">
              <div className="flex flex-col">
                <span
                  className="st-item-title leading-snug font-bold tracking-tight"
                  style={titleStyle}
                >
                  {item.name}
                </span>
                {!hideDescriptions && item.description && (
                  <span
                    className="st-item-description mt-0.5 text-[0.8rem] leading-tight"
                    style={descStyle}
                  >
                    {item.description}
                  </span>
                )}
              </div>
              {Number(item.price) > 0 && (
                <span
                  className="st-price-tag shrink-0 font-extrabold whitespace-nowrap"
                  style={priceStyle}
                >
                  ${Number(item.price).toFixed(2)}
                </span>
              )}
            </div>

            {/* Modifiers List */}
            {overrides.length > 0 && (
              <div
                className={`mt-1 w-full ${isInlineMod ? "flex flex-row flex-wrap gap-x-3 gap-y-1" : "flex flex-col gap-1 border-l border-white/10 pl-2"}`}
              >
                {overrides.map((override, idx) => {
                  return (
                    <div
                      key={idx}
                      className="flex items-center text-[0.85rem] text-zinc-300"
                    >
                      <span className="st-item-modifier font-medium text-cyan-400">
                        {override.text ||
                          override.displayNameOverride ||
                          (override.modifierIds &&
                          override.modifierIds.length > 0
                            ? `Modifier Group (${override.modifierIds.length} items)`
                            : "")}
                        {override.price && (
                          <span className="ml-1.5 font-mono font-bold text-cyan-300">
                            {override.price.startsWith("$")
                              ? override.price
                              : `+${override.price}`}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {item.isSoldOut && optStyle.strikethrough && (
              <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 transform bg-red-500 opacity-75 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
