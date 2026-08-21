import { type SignageBlock } from "./signage-blocks.js";
import {
  type BaseSlide,
  type HighlightItemConfig,
  type MenuItemStyles,
} from "./signage-base.js";

export * from "./signage-base.js";

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
  menuItemTitleColor?: string;
  menuItemPriceColor?: string;
  menuItemDescriptionColor?: string;
  marketingTextColor?: string;
}

export interface ColumnConfig {
  type: "MENU" | "IMAGE" | "VIDEO" | "IFRAME" | "TEXT" | "EMPTY";
  itemIds?: string[];
  highlightItems?: (string | HighlightItemConfig)[];
  imageUrl?: string;
  fit?: "cover" | "contain";
  videoUrl?: string;
  loop?: boolean;
  mute?: boolean;
  iframeUrl?: string;
  title?: string;
  content?: string;
  blocks?: SignageBlock[];
}

export interface ColumnLayoutSlide extends BaseSlide {
  type: "COLUMN_LAYOUT";
  columns: ColumnConfig[];
  splitRatio?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  auroraBackground?: boolean;
  backgroundEffect?: "none" | "aurora" | "glow";
}

export type SignageSlide =
  ImageSlide | VideoSlide | IframeSlide | ColumnLayoutSlide;

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
  zIndex?: number;
}
export interface GlobalDesignTokens {
  primaryColor?: string;
  accentColor?: string;
  headingFont?: string;
  headingColor?: string;
  headingWeight?: string;
  subtitleFont?: string;
  subtitleColor?: string;
  subtitleWeight?: string;
  bodyFont?: string;
  bodyColor?: string;
  bodyWeight?: string;
  globalCss?: string;
}

export interface SignageLayoutConfig {
  designTokens?: GlobalDesignTokens;
  auroraBackground?: boolean;
  backgroundEffect?: "none" | "aurora" | "glow";
  googleFont?: string;
  customCss?: string;
  /** @deprecated Use menuItemStyles.soldOut instead. */
  soldOutBehavior?: "HIDE" | "LABEL" | "STRIKE" | "GRAY_OUT";
  slides: SignageSlide[];
  overlays?: SignageOverlay[];
  /** @deprecated Use menuItemStyles.regular instead. */
  typography?: TypographyConfig;
  menuItemStyles?: MenuItemStyles;
  aspectRatio?: "16:9" | "responsive";
  scaleToFit?: boolean;
}

export interface LegacyMenuSlide extends Omit<BaseSlide, "type"> {
  type: "MENU";
  layoutTemplate: "GRID" | "SPLIT" | "COLUMNS";
  itemIds?: string[];
  highlightItems: (string | HighlightItemConfig)[];
}

export interface RawSignageLayoutConfig extends Omit<
  SignageLayoutConfig,
  "slides"
> {
  slides: (SignageSlide | LegacyMenuSlide)[];
}
