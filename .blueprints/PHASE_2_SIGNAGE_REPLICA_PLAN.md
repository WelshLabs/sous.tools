# Signage Glassmorphic Visual Parity Implementation Plan

This plan details the changes required to bring the signage player and dashboard editor layout rendering into visual parity with the hardcoded DTown Cafe glassmorphic SPA mockup.

## User Review Required

> [!IMPORTANT]
> - All layout containers (`ColumnBlock`, `RowBlock`, `GridBlock`) and content blocks will support optional `panelStyle: "glass" | "none"` and `className` fields.
> - The display player and dashboard canvas will inject the `.st-layout-background` class to enable the ambient noise/floating orbs CSS animation.
> - All TypeScript files will strictly respect the 150-line limit by abstracting blocks and previews aggressively.

## Open Questions

> [!NOTE]
> No outstanding questions. The requirements are fully aligned with the provided HTML design mockup.

---

## Proposed Changes

### 1. API Types & Shared Packages

#### [MODIFY] [signage-blocks.ts](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/packages/api-types/src/signage-blocks.ts)
* Add `description?: string;` to `MediaSlide` structure to support subtitle and description pairings.
* Extend `SignageBlock` union types to include `panelStyle?: "glass" | "none"` and `className?: string` for container blocks and content blocks.

---

### 2. Signage Display Player UI Engine (`apps/signage`)

#### [MODIFY] [block-renderer.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/block-renderer.tsx)
* Support conditional glass styling on container blocks by mapping `panelStyle === "glass"` to the `.st-glass-panel` class.
* Pass down `panelStyle` and `className` props to content rendering blocks.

#### [MODIFY] [menu-item-card.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/menu-item-card.tsx)
* Conditionally render as flat (transparent bg, border-transparent, low padding) when `panelStyle` is `"none"`, or if `menuItemStyles.regular` sets transparent colors and zero borders.
* Render as `.st-glass-panel` if `panelStyle === "glass"`.

#### [MODIFY] [nested-item-block.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/blocks/nested-item-block.tsx)
* Accept `panelStyle` and `className` to configure container panel style (flat vs glass).
* Refactor item listings to align with the borderless design.

#### [MODIFY] [exploded-item-block.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/blocks/exploded-item-block.tsx)
* Redesign the step-based flow to render the vertical timeline layout (nodes + connector lines) matching the user's mock.
* Render the addons grid with borders and spacing matching the hardcoded mockup.

#### [MODIFY] [callout-block.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/blocks/callout-block.tsx)
* Support `orientation: "horizontal" | "vertical"` to render vertical callouts (icon on top) and horizontal callouts (icon on both sides).

#### [MODIFY] [media-carousel-block.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/blocks/media-carousel-block.tsx)
* Replace full-width gradients with floating `.st-glass-pill` captions on the bottom-left containing title, description, and price badges.

#### [MODIFY] [display-player.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/display-player.tsx)
* Add `st-layout-background` class to the outer `main` tag.
* Ensure a fallback object is supplied if `menuItemStyles` is null or undefined in the database.

---

### 3. Dashboard Editor Preview Components (`apps/app`)

#### [NEW] [preview-content-blocks.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/app/src/components/signage/preview-content-blocks.tsx)
* Extract leaf component preview rendering from `preview-block-renderer.tsx` to maintain the 150-line limit.

#### [MODIFY] [preview-block-renderer.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/app/src/components/signage/preview-block-renderer.tsx)
* Refactor to delegate to `preview-content-blocks.tsx`.
* Add custom container styling (`st-glass-panel` and custom flex layouts) for layouts inside the editor canvas.

#### [MODIFY] [layout-preview.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/app/src/components/signage/layout-preview.tsx)
* Wrap rendering children in a `div` with the class `st-layout-background` inside the `.signage-preview-container` wrapper to enable custom CSS styling.

---

### 4. Database Seeding & Custom CSS

#### [MODIFY] [seed.sql](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/supabase/seed.sql)
* Update `customCss` blocks to include noise filter, floating orbs, glass panels, neon glows, and ice badges.
* Structure Screen 1 and Screen 2 JSON configs to wrap sections like "Frozen Dinners" in container blocks with `panelStyle: "glass"`.

#### [MODIFY] [SEED_DATA.sql](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/.blueprints/SEED_DATA.sql)
* Align with the schema seed definitions.

---

## Verification Plan

### Automated Tests
* Run `pnpm build` across all packages to verify TypeScript type-safety of recursive blocks and styles.

### Manual Verification
* Run local Supabase DB reset via `npx supabase db reset` to apply seed data.
* Spin up signage player and verify that the glassmorphic ambient orbs background, layouts, and custom blocks render identical to the original design mock.
* Open the admin dashboard visual editor and check that the preview matches the edge player.
