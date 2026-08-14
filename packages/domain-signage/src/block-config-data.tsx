import { LayoutGrid, Sparkles } from "lucide-react";

/** Atom: Gokujo knife SVG icon used in the block config modal header. */
export const GokujoKnifeIcon = () => (
  <svg viewBox="0 0 100 100" fill="none" className="h-5 w-5 text-cyan-400">
    <rect
      x="15"
      y="70"
      width="8"
      height="20"
      rx="2"
      transform="rotate(-45 15 70)"
      fill="currentColor"
      opacity="0.8"
    />
    <path
      d="M25 60 C 38 45, 55 38, 85 43 C 75 32, 55 28, 35 50 Z"
      fill="currentColor"
    />
  </svg>
);

/** All configurable block types for the block config modal selector. */
export const BLOCK_TYPES = [
  {
    type: "ColumnBlock",
    label: "Column Layout",
    category: "Layout",
    icon: <LayoutGrid className="h-4 w-4 text-sky-400" />,
  },
  {
    type: "RowBlock",
    label: "Row Layout",
    category: "Layout",
    icon: <LayoutGrid className="h-4 w-4 text-indigo-400" />,
  },
  {
    type: "GridBlock",
    label: "Grid Layout",
    category: "Layout",
    icon: <LayoutGrid className="h-4 w-4 text-violet-400" />,
  },
  {
    type: "CategoryHeaderBlock",
    label: "Category Header",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-amber-400" />,
  },
  {
    type: "PosItemBlock",
    label: "POS Item",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-emerald-400" />,
  },
  {
    type: "NestedItemBlock",
    label: "Nested Item",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-cyan-400" />,
  },
  {
    type: "ExplodedItemBlock",
    label: "Exploded Item",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-rose-400" />,
  },
  {
    type: "CalloutBlock",
    label: "Callout Panel",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-pink-400" />,
  },
  {
    type: "MediaCarouselBlock",
    label: "Media Carousel",
    category: "Content",
    icon: <Sparkles className="h-4 w-4 text-fuchsia-400" />,
  },
] as const;
