/**
 * Interface representing the structure of programmatic theme color tokens.
 * All values are specified in OKLCH format.
 */
export interface ThemeColorTokens {
  /** Base background layer avoiding tablet glare in commercial kitchens. */
  background: string;
  /** Foreground content/text color. */
  foreground: string;
  /** Brand primary blue equivalent color. */
  primary: string;
  /** Success status color, e.g. active checklist items, items in stock. */
  success: string;
  /** Warning status color, e.g. low stock alerts, pending orders. */
  warning: string;
  /** Interface highlight interaction accent color. */
  accent: string;
  /** Destructive status color, e.g. sold out states, interrupt actions. */
  destructive: string;
  /** Muted color for secondary descriptions or subtle borders. */
  muted: string;
}

/**
 * Programmatic design token engine mappings using OKLCH colors.
 * Designed to optimize contrast and prevent screen glare in high-intensity kitchen environments.
 */
export const themeTokens = {
  colors: {
    background: "oklch(0.98 0.005 240)",
    foreground: "oklch(0.12 0.02 240)",
    primary: "oklch(0.60 0.25 250)",
    success: "oklch(0.70 0.25 150)",
    warning: "oklch(0.85 0.20 85)",
    accent: "oklch(0.65 0.25 45)",
    destructive: "oklch(0.60 0.25 25)",
    muted: "oklch(0.5 0.01 240)",
  } as ThemeColorTokens,
};
