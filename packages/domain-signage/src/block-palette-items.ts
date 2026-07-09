import {
  LayoutGrid,
  AlignLeft,
  Image,
  List,
  AlertTriangle,
  Settings2,
  Video,
  GitCommit,
  ListTree,
  type LucideIcon,
} from "lucide-react";

/** All draggable block types available in the Add Blocks palette. */
export const BLOCKS: Array<{ id: string; label: string; type: string; icon: LucideIcon }> = [
  { id: "ColumnBlock", label: "Column Container", type: "Layout Container", icon: AlignLeft },
  { id: "RowBlock", label: "Row Container", type: "Layout Container", icon: AlignLeft },
  { id: "GridBlock", label: "Grid Container", type: "Layout Container", icon: LayoutGrid },
  { id: "CategoryHeaderBlock", label: "Category Header", type: "Content Block", icon: List },
  { id: "MenuListBlock", label: "Menu List", type: "Content Block", icon: List },
  { id: "ExplodedItemBlock", label: "Exploded Item", type: "Content Block", icon: Image },
  { id: "CalloutBlock", label: "Callout Panel", type: "Content Block", icon: AlertTriangle },
  { id: "MediaCarouselBlock", label: "Media Carousel", type: "Content Block", icon: Image },
  { id: "ModifierGroupBlock", label: "Contextual Modifiers", type: "Content Block", icon: Settings2 },
  { id: "ImageBlock", label: "Static Image", type: "Content Block", icon: Image },
  { id: "VideoBlock", label: "Looping Video", type: "Content Block", icon: Video },
  { id: "TimelineBlock", label: "Step Timeline", type: "Content Block", icon: GitCommit },
  { id: "NestedItemBlock", label: "Nested Menu Item", type: "Content Block", icon: ListTree },
];

export const BLOCK_GROUPS = ["Layout Container", "Content Block"] as const;
