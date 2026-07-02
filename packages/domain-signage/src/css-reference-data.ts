/** CSS class dictionary and preset recipes for the CSS editor reference panel. */

export const CSS_DICTIONARY: Record<string, { className: string, desc: string }[]> = {
  "Layout & Backgrounds": [
    { className: ".st-layout-background", desc: "Main canvas layout background container" },
    { className: ".st-glass-panel", desc: "Glassmorphic panel container block" },
    { className: ".st-glass-pill", desc: "Glassmorphic pill badge/tag container" },
  ],
  "Menu Items": [
    { className: ".st-menu-item", desc: "Container for a menu item card" },
    { className: ".st-menu-item-title", desc: "Title text of a menu item card" },
    { className: ".st-category-header", desc: "Headers for menu category sections" },
    { className: ".st-price-tag", desc: "Pricing text label" },
    { className: ".st-item-description", desc: "Detail description subtext of a menu item" },
    { className: ".st-menu-item-badge", desc: "Generic menu item badge container" },
    { className: ".st-sold-out-badge", desc: "Overlay badge on sold-out state" },
    { className: ".st-nested-item", desc: "Nested Item block container" },
    { className: ".st-menu-glow-text", desc: "Utility: programmatically styled glowing cyan text" },
    { className: ".st-menu-glow-border", desc: "Utility: programmatically styled glowing cyan border" },
    { className: ".st-ice-badge", desc: "Utility: frozen heat & serve cyan styled badge" },
  ],
  "Timeline": [
    { className: ".st-timeline", desc: "Timeline block container" },
    { className: ".st-timeline-bullet", desc: "Timeline step marker bullet" },
    { className: ".st-timeline-track", desc: "Timeline vertical tracking line" },
  ],
  "Carousel & Video": [
    { className: ".st-carousel-image", desc: "Carousel image elements" },
    { className: ".st-video-container", desc: "Video block element container" },
    { className: ".st-video-player", desc: "Video element itself" },
  ],
  "Callout": [
    { className: ".st-callout", desc: "Callout Panel block container" },
  ],
};

export const CSS_PRESETS = [
  {
    name: "Neon Glow",
    css: `.st-menu-item {\n  color: #fff;\n  text-shadow: 0 0 5px #0091FF, 0 0 10px #0091FF;\n  border: 2px solid #0091FF;\n  box-shadow: 0 0 10px #0091FF, inset 0 0 10px #0091FF;\n}`,
  },
  {
    name: "Retro Chalkboard",
    css: `.st-layout-background {\n  background: #1e281e;\n  font-family: 'Caveat', cursive;\n  color: #f4ebd0;\n  border: 10px dashed #f4ebd0;\n}\n.st-category-header {\n  border-bottom: 2px dashed #f4ebd0;\n}`,
  },
  {
    name: "Sliding Animations",
    css: `@keyframes slideIn {\n  from { transform: translateX(100%); opacity: 0; }\n  to { transform: translateX(0); opacity: 1; }\n}\n.st-menu-item {\n  animation: slideIn 0.5s ease-out;\n}`,
  },
] as const;
