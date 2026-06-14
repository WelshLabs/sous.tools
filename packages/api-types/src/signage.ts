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

export interface ImageSlide extends BaseSlide {
  type: "IMAGE";
  imageUrl: string;
  fit: "cover" | "contain";
}

export interface VideoSlide extends BaseSlide {
  type: "VIDEO";
  videoUrl: string;
  loop: boolean;
  mute: boolean;
}

export interface IframeSlide extends BaseSlide {
  type: "IFRAME";
  url: string;
}

export interface TypographyConfig {
  menuItemTitle?: string;
  menuItemPrice?: string;
  menuItemDescription?: string;
  marketingText?: string;
}

/**
 * Represents the content in a single zone/column of a COLUMN_LAYOUT slide.
 * type="MENU" uses itemIds/highlightItems, type="IMAGE" uses imageUrl,
 * type="VIDEO" uses videoUrl, type="IFRAME" uses iframeUrl,
 * type="TEXT" uses title/content, type="EMPTY" is a placeholder.
 */
export interface ColumnConfig {
  type: "MENU" | "IMAGE" | "VIDEO" | "IFRAME" | "TEXT" | "EMPTY";
  // Menu content
  itemIds?: string[];
  highlightItems?: (string | HighlightItemConfig)[];
  // Image content
  imageUrl?: string;
  fit?: "cover" | "contain";
  // Video content
  videoUrl?: string;
  loop?: boolean;
  mute?: boolean;
  // Iframe content
  iframeUrl?: string;
  // Text / marketing content
  title?: string;
  content?: string;
}

/**
 * COLUMN_LAYOUT is the universal slide container.
 * - 1 column = Full Screen layout
 * - 2 columns (no splitRatio) = equal-width split
 * - 2 columns with splitRatio = e.g. "60/40" weighted split
 * - 2–4 columns = column grid
 */
export interface ColumnLayoutSlide extends BaseSlide {
  type: "COLUMN_LAYOUT";
  columns: ColumnConfig[];
  /** Optional ratio for 2-column split layouts, e.g. "60/40" or "50/50" */
  splitRatio?: string;
  /** Slide background color (CSS color string, e.g. "#1a1a2e") */
  backgroundColor?: string;
  /** Slide background image URL (applied as CSS background-image) */
  backgroundImageUrl?: string;
}

export type SignageSlide = ImageSlide | VideoSlide | IframeSlide | ColumnLayoutSlide;

export interface SignageOverlay {
  id: string;
  type: "TEXT" | "BADGE" | "IMAGE";
  content: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  customCssClass?: string;
  /** Z-index for layering overlays above or below content. Defaults to 10. */
  zIndex?: number;
}

/**
 * Configuration for a digital TV signage layout.
 * Includes styling, transitions, slide playlist, and overlays.
 */
export interface SignageLayoutConfig {
  /** The selected Google Font family to load. */
  googleFont?: string;
  /** Custom CSS overrides block injected in player. */
  customCss?: string;
  /** Action style when a menu item is sold out. */
  soldOutBehavior: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
  /** Playlist of signage slides to display in carousel. */
  slides: SignageSlide[];
  /** Absolutely positioned layers overlayed on slides. */
  overlays?: SignageOverlay[];
  /** Typography overrides for individual element types. */
  typography?: TypographyConfig;
}

/**
 * Representation of a paired signage display hardware node.
 */
export interface SignageDisplay {
  id: string;
  organizationId: string;
  name: string;
  layoutId: string | null;
  pairingCode: string | null;
  isPaired: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

/**
 * A legacy MenuSlide shape (from before the COLUMN_LAYOUT migration).
 * Used only by the migration function in the editor — not stored in the DB.
 */
export interface LegacyMenuSlide extends Omit<BaseSlide, "type"> {
  type: "MENU";
  layoutTemplate: "GRID" | "SPLIT" | "COLUMNS";
  itemIds?: string[];
  highlightItems: (string | HighlightItemConfig)[];
}

/**
 * Raw record shape stored in DB (may include legacy MENU type).
 * The editor migrates this on load to the current SignageLayoutConfig shape.
 */
export interface RawSignageLayoutConfig extends Omit<SignageLayoutConfig, "slides"> {
  slides: (SignageSlide | LegacyMenuSlide)[];
}


