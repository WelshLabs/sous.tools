import {
  RawSignageLayoutConfig,
  SignageLayoutConfig,
  LegacyMenuSlide,
  ColumnLayoutSlide,
  SignageSlide,
} from "@soustools/api-types";

export const DEFAULT_CONFIG: SignageLayoutConfig = {
  googleFont: "Outfit",
  soldOutBehavior: "LABEL",
  slides: [],
  overlays: [],
  customCss: "",
};

/**
 * Converts a RawSignageLayoutConfig (which may contain legacy MENU slides)
 * into the current SignageLayoutConfig shape using COLUMN_LAYOUT for all slides.
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

  return {
    ...rawConfig,
    slides: migratedSlides,
  };
}
