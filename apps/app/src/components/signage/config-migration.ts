import {
  RawSignageLayoutConfig,
  SignageLayoutConfig,
  LegacyMenuSlide,
  ColumnLayoutSlide,
  SignageSlide,
  MenuItemStyles,
  MenuItemStateStyle,
} from "@soustools/api-types";

export const DEFAULT_REGULAR_STYLE: MenuItemStateStyle = {
  backgroundColor: "rgba(255,255,255,0.05)",
  borderColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderRadius: "16px",
  titleColor: "#ffffff",
  priceColor: "oklch(0.70 0.25 150)",
  descriptionColor: "#94a3b8",
};

export const DEFAULT_HIGHLIGHTED_STYLE: MenuItemStateStyle = {
  backgroundColor: "rgba(255,255,255,0.10)",
  borderColor: "oklch(0.60 0.25 250)",
  borderWidth: 1,
  borderRadius: "16px",
  shadow: "0 0 20px -3px oklch(0.60 0.25 250)",
  animation: "pulse-glow",
  icon: "⭐",
  iconPosition: "top-right-corner",
};

export const DEFAULT_SOLD_OUT_STYLE: MenuItemStateStyle = {
  dimOpacity: 0.45,
  strikethrough: false,
  grayscale: false,
  badge: { text: "SOLD OUT", color: "oklch(0.60 0.25 25)", textColor: "#ffffff", borderRadius: "4px" },
};

export const DEFAULT_MENU_ITEM_STYLES: MenuItemStyles = {
  regular: DEFAULT_REGULAR_STYLE,
  highlighted: DEFAULT_HIGHLIGHTED_STYLE,
  soldOut: DEFAULT_SOLD_OUT_STYLE,
};

export const DEFAULT_CONFIG: SignageLayoutConfig = {
  googleFont: "Outfit",
  slides: [],
  overlays: [],
  customCss: "",
  menuItemStyles: DEFAULT_MENU_ITEM_STYLES,
};

/**
 * Converts a RawSignageLayoutConfig (which may contain legacy MENU slides
 * or old typography/soldOutBehavior fields) into the current
 * SignageLayoutConfig shape.
 */
export function migrateConfig(rawConfig: RawSignageLayoutConfig): SignageLayoutConfig {
  const migratedSlides: SignageSlide[] = rawConfig.slides.map((slide) => {
    if (slide.type === "MENU") {
      const legacy = slide as LegacyMenuSlide;
      const converted: ColumnLayoutSlide = {
        id: legacy.id,
        type: "COLUMN_LAYOUT",
        durationSeconds: legacy.durationSeconds,
        columns: [
          {
            type: "MENU",
            itemIds: legacy.itemIds ?? [],
            highlightItems: legacy.highlightItems ?? [],
          },
        ],
      };
      return converted;
    }
    return slide as SignageSlide;
  });

  // If no menuItemStyles yet, bootstrap from legacy typography + soldOutBehavior
  let menuItemStyles = rawConfig.menuItemStyles;
  if (!menuItemStyles) {
    const typo = rawConfig.typography ?? {};
    const sob = rawConfig.soldOutBehavior;
    const regular: MenuItemStateStyle = {
      ...DEFAULT_REGULAR_STYLE,
      ...(typo.menuItemTitle ? { titleFont: typo.menuItemTitle } : {}),
      ...(typo.menuItemTitleColor ? { titleColor: typo.menuItemTitleColor } : {}),
      ...(typo.menuItemPrice ? { priceFont: typo.menuItemPrice } : {}),
      ...(typo.menuItemPriceColor ? { priceColor: typo.menuItemPriceColor } : {}),
      ...(typo.menuItemDescription ? { descriptionFont: typo.menuItemDescription } : {}),
      ...(typo.menuItemDescriptionColor ? { descriptionColor: typo.menuItemDescriptionColor } : {}),
    };
    const soldOut: MenuItemStateStyle = {
      ...DEFAULT_SOLD_OUT_STYLE,
      hidden: sob === "HIDE",
      strikethrough: sob === "STRIKE",
      grayscale: sob === "GRAY_OUT",
      dimOpacity: sob === "GRAY_OUT" || sob === "STRIKE" ? 0.45 : undefined,
      badge: sob === "LABEL" ? DEFAULT_SOLD_OUT_STYLE.badge : undefined,
    };
    menuItemStyles = { regular, highlighted: DEFAULT_HIGHLIGHTED_STYLE, soldOut };
  }

  return {
    ...rawConfig,
    slides: migratedSlides,
    menuItemStyles,
  };
}
