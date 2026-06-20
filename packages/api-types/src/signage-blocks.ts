/**
 * @file signage-blocks.ts
 * @description Recursive block structure and layout components for the signage visual editor.
 */

import { ContentComponent } from "./signage-content-blocks";
import { MenuItemStyles } from "./signage-base";

export * from "./signage-content-blocks";

/**
 * Sizing configuration for layout and content blocks.
 * Supports dimension-agnostic values (e.g., "50%", "1.5in", "200px", "1fr").
 */
export interface BlockSizing {
  width?: string;
  height?: string;
  flexBasis?: string;
  flexGrow?: number;
  flexShrink?: number;
  gap?: string;
  padding?: string;
  margin?: string;
}

/**
 * Base properties shared by all structural and content blocks.
 */
export interface BaseBlock {
  id?: string;
  uniqueSelector?: string;
  panelStyle?: "glass" | "none";
  className?: string;
  sizing?: BlockSizing;
  styles?: MenuItemStyles;
  itemIds?: string[];
}

// --- Layout Component Types (Containers) ---

/**
 * A vertical layout container block.
 */
export interface ColumnBlock extends BaseBlock {
  type: "ColumnBlock";
  blocks: SignageBlock[];
}

/**
 * A horizontal layout container block.
 */
export interface RowBlock extends BaseBlock {
  type: "RowBlock";
  blocks: SignageBlock[];
}

/**
 * A grid-based layout container block with defined columns and rows.
 */
export interface GridBlock extends BaseBlock {
  type: "GridBlock";
  columns: number;
  rows: number;
  cells: SignageBlock[];
}

/**
 * A layout container for a single POS item and its modifiers.
 */
export interface ExplodedItemBlock extends BaseBlock {
  type: "ExplodedItemBlock";
  menuItemId?: string;
  hideTitle?: boolean;
  hidePrice?: boolean;
  hideDescription?: boolean;
  blocks: SignageBlock[];
}

/**
 * Union type of all layout containers.
 */
export type LayoutComponent = ColumnBlock | RowBlock | GridBlock | ExplodedItemBlock;

/**
 * Recursive union of all layouts and content blocks.
 */
export type SignageBlock = LayoutComponent | ContentComponent;

// --- Canvas/Root Definitions ---

/**
 * Sizing/Dimension config for the root canvas.
 * Supports dimension-agnostic values like physical inches, mm, or pixels.
 */
export interface DisplayDimensions {
  width: number;
  height: number;
  unit: "px" | "in" | "mm";
  /** Dots Per Inch. Crucial for physical print scaling. */
  dpi?: number;
  /** Aspect ratio indicator, e.g., "16:9" or "responsive" */
  aspectRatio?: string;
}

/**
 * Represents the root configuration of a slide canvas.
 */
export interface SignageCanvas {
  id: string;
  name: string;
  dimensions: DisplayDimensions;
  rootBlock: SignageBlock;
}
