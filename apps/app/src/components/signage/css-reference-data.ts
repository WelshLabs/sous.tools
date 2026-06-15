/** CSS class dictionary and preset recipes for the CSS editor reference panel. */

export const CSS_DICTIONARY = [
  { className: ".menu-item", desc: "Container for a menu item card" },
  { className: ".category-title", desc: "Headers for menu sections" },
  { className: ".price-tag", desc: "Pricing bubble or label text" },
  { className: ".item-description", desc: "Detail description subtext" },
  { className: ".sold-out-badge", desc: "Overlay badge on sold-out state" },
  { className: ".slide-container", desc: "Main slide canvas container" },
  { className: ".signage-overlay", desc: "Floating absolute layers container" },
] as const;

export const CSS_PRESETS = [
  {
    name: "Neon Glow",
    css: `.menu-item {\n  color: #fff;\n  text-shadow: 0 0 5px #0091FF, 0 0 10px #0091FF;\n  border: 2px solid #0091FF;\n  box-shadow: 0 0 10px #0091FF;\n}`,
  },
  {
    name: "Retro Chalkboard",
    css: `.slide-container {\n  background: #1e281e;\n  font-family: 'Caveat', cursive;\n  color: #f4ebd0;\n}\n.category-title {\n  border-bottom: 2px dashed #f4ebd0;\n}`,
  },
  {
    name: "Sliding Animations",
    css: `@keyframes slideIn {\n  from { transform: translateX(100%); opacity: 0; }\n  to { transform: translateX(0); opacity: 1; }\n}\n.menu-item { animation: slideIn 0.5s ease-out; }`,
  },
] as const;
