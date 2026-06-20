/** Foundational signage structures and state styling definitions. */

export type SlideType = "IMAGE" | "VIDEO" | "IFRAME" | "COLUMN_LAYOUT";

export interface BaseSlide {
  id: string;
  type: SlideType;
  durationSeconds: number;
}

export interface HighlightItemConfig {
  itemId: string;
  style?: string;
}

/** CSS animation preset for a highlighted menu item card. */
export type HighlightAnimation =
  | "none"
  | "pulse-glow"
  | "shimmer"
  | "bounce-scale"
  | "border-flash";

/** A small badge/label shown on a menu item card (any state). */
export interface MenuItemBadge {
  text: string;
  color: string;
  textColor: string;
  borderRadius?: string;
}

/**
 * Styling for a single menu item display state
 * (regular, highlighted, or sold-out).
 */
export interface MenuItemStateStyle {
  // --- Card ---
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: string;
  shadow?: string;
  /** Inner padding of the card, e.g. "16px" or "12px 20px". Gives shadows room to breathe. */
  cardPadding?: string;
  animation?: HighlightAnimation;
  // --- Title atom ---
  titleFont?: string;
  titleColor?: string;
  titleSize?: number;
  titleWeight?: string;
  // --- Price atom ---
  priceFont?: string;
  priceColor?: string;
  priceSize?: number;
  priceWeight?: string;
  // --- Description atom ---
  descriptionFont?: string;
  descriptionColor?: string;
  descriptionSize?: number;
  // --- Badge (optional on any state) ---
  badge?: MenuItemBadge;
  // --- Icon (optional on any state) ---
  icon?: string;
  iconPosition?: "before-title" | "after-title" | "top-right-corner";
  // --- Sold-out specific ---
  hidden?: boolean;
  strikethrough?: boolean;
  dimOpacity?: number;
  grayscale?: boolean;
}

/** Per-deck menu item styles covering all three display states. */
export interface MenuItemStyles {
  regular: MenuItemStateStyle;
  highlighted: MenuItemStateStyle;
  soldOut: MenuItemStateStyle;
}

