/**
 * @file signage-content-blocks.ts
 * @description Content block components (leaves) for the signage visual editor.
 */

import { type BaseBlock } from "./signage-blocks.js";

/**
 * An item upgrade or variation configuration for NestedItemBlock.
 */
export interface UpgradeItem {
  posItemId: string;
  modifierDescription?: string;
}

/**
 * A slide or media node within the MediaCarouselBlock.
 */
export interface MediaSlide {
  imageUrl?: string;
  videoUrl?: string;
  captionTitle?: string;
  captionSubtitle?: string;
  captionPrice?: string;
  description?: string;
}

/**
 * Displays a category title, optional subtitle, and status badges.
 */
export interface CategoryHeaderBlock extends BaseBlock {
  type: "CategoryHeaderBlock";
  title: string;
  subtitle?: string;
  badge?: string;
  animateBadge?: boolean;
}

/**
 * Displays a single POS menu item (Name, Description, Price).
 */
export interface PosItemBlock extends BaseBlock {
  type: "PosItemBlock";
  posItemId: string;
}

export interface ItemModifierOverride {
  modifierIds: string[];
  displayNameOverride?: string;
}

/**
 * Displays a dynamic list of POS items assigned via itemIds.
 */
export interface MenuListBlock extends BaseBlock {
  type: "MenuListBlock";
  hideDescriptions?: boolean;
  itemModifiers?: Record<string, ItemModifierOverride[]>;
  modifierLayout?: "stacked" | "inline";
}

/**
 * Displays a POS modifier group dynamically synced from POS.
 */
export interface ModifierGroupBlock extends BaseBlock {
  type: "ModifierGroupBlock";
  modifierGroupId?: string;
}

/**
 * Displays emphasizing text blocks with custom borders and icons.
 */
export interface CalloutBlock extends BaseBlock {
  type: "CalloutBlock";
  icon: string;
  text: string;
  accentBorder?: boolean;
}

/**
 * Auto-advancing image/video slider with Ken Burns transition support.
 */
export interface MediaCarouselBlock extends BaseBlock {
  type: "MediaCarouselBlock";
  slides: MediaSlide[];
  style?: { imageEffect?: string };
}

/**
 * Displays a base POS item and a list of upgrades/modifiers.
 */
export interface NestedItemBlock extends BaseBlock {
  type: "NestedItemBlock";
  basePosItemId?: string;
  upgradeItems?: UpgradeItem[];
  descriptionOverride?: string;
}

export interface ImageBlock extends BaseBlock {
  type: "ImageBlock";
  imageUrl?: string;
}

export interface VideoBlock extends BaseBlock {
  type: "VideoBlock";
  videoUrl?: string;
}

export interface TimelineStep {
  id: string;
  text: string;
  subtitle?: string;
}

export interface TimelineBlock extends BaseBlock {
  type: "TimelineBlock";
  steps?: TimelineStep[];
}

/**
 * Union type of all content components.
 */
export type ContentComponent =
  | CategoryHeaderBlock
  | PosItemBlock
  | MenuListBlock
  | ModifierGroupBlock
  | CalloutBlock
  | MediaCarouselBlock
  | NestedItemBlock
  | ImageBlock
  | VideoBlock
  | TimelineBlock;
