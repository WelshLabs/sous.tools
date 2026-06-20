# 🚀 PHASE 2: Signage Visual Editor & Polymorphic Blocks Plan

This implementation plan details the refactoring and development steps to implement the signage visual editor, dynamic polymorphic blocks (structural layout container blocks and leaf content blocks), custom Monaco CSS injection, and the DTown Cafe seeded configurations.

## User Review Required

> [!IMPORTANT]
> - We will update `@soustools/api-types` in `packages/api-types/src/signage.ts` to deprecate the rigid column structure and implement the recursive, polymorphic `SignageBlock` union.
> - Columns inside the existing `COLUMN_LAYOUT` slides will be updated to optional support a list of `blocks: SignageBlock[]`. This allows fully backward-compatible layout rendering while unlocking nested layout building.
> - Components inside the signage player will dynamically resolve the POS item state (using the existing `resolveItemState` utility) to apply appropriate visual classes (e.g. `.pos-sold-out`, `.st-glass-panel`, `.st-menu-glow-text`) in real-time.

## Open Questions

> [!WARNING]
> 1. **Interactive vs. Static rendering for ExplodedItemBlock**:
>    * Since the signage Edge player (running on smart TVs/Raspberry Pis) is read-only, should `ExplodedItemBlock` (e.g. Build Your Own Sandwich) render as a static, multi-column visual breakdown list, or does it need interactive/touch tab support?
> 2. **Modifier options sold-out behavior**:
>    * When a POS modifier option (e.g. Avocado addon) is marked as sold out, should it be visually dimmed, marked with a strikethrough, or completely hidden from the modifier block?

---

## Proposed Changes

### 1. API Types Refactoring

#### [MODIFY] [signage.ts](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/packages/api-types/src/signage.ts)
* Add recursive block type definitions for `SignageBlock` union (supporting `GridBlock`, `ColumnBlock`, `RowBlock`, `CategoryHeaderBlock`, `PosItemBlock`, `ModifierGroupBlock`, `CalloutBlock`, `MediaCarouselBlock`, `NestedItemBlock`, and `ExplodedItemBlock`).
* Add `blocks?: SignageBlock[]` as an optional array inside `ColumnConfig` interface.

---

### 2. Signage Display Player UI Engine (`apps/signage`)

#### [NEW] [BlockRenderer.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/block-renderer.tsx)
* Implement a central recursive dispatcher component to select and render each block type based on `block.type`.

#### [NEW] UI Block Components
* Create atomic components for rendering each block:
  * `CategoryHeaderBlock.tsx` - Title, subtitle, optional status badges, supporting glassmorphic style preset tags.
  * `PosItemBlock.tsx` - Resolves item state (regular, highlighted, soldOut) using `resolveItemState` and renders name, description, price. Applies `.pos-sold-out` class.
  * `CalloutBlock.tsx` - Displays text callouts with icons and custom borders.
  * `NestedItemBlock.tsx` - Base item name/price plus bulleted list of upgrades (e.g. potato/cheese pierogis, individual/family size dinners).
  * `MediaCarouselBlock.tsx` - Animated image/video slideshow with Ken Burns pan/zoom transition support.
  * `ExplodedItemBlock.tsx` - Multi-step BYO sandwich breakdown grid showing steps (Vessel, Protein, Toppings) and addons categories.
  * `ModifierGroupBlock.tsx` - Dynamically fetches and renders modifier choices and pricing from `pos_modifier_options`.

#### [MODIFY] [single-column.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/signage/src/app/display/[id]/single-column.tsx)
* Intercept rendering if `column.blocks` is configured, mapping them sequentially using `BlockRenderer`.

---

### 3. Editor Component Preview & Visual Editing (`apps/app`)

#### [NEW] Preview UI Block Components
* Copy/import block components to the editor workspace so the live canvas layout preview renders block changes in real-time.
* Add block config forms to the Visual Editor panel to configure options (such as adding items, changing headings, uploading images, toggling styles like glassmorphism).

#### [MODIFY] [slide-renderer.tsx](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/apps/app/src/components/signage/slide-renderer.tsx)
* Support mapping column blocks array in the dashboard's design canvas.

---

### 4. Database Seeding

#### [MODIFY] [SEED_DATA.sql](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/.blueprints/SEED_DATA.sql)
* Update seeded configurations for `DTown Screen 1` and `DTown Screen 2` to use the recursive `blocks` JSON layout. Include custom CSS noise overlay filters and ambient orbs keyframe styles.

#### [MODIFY] [seed.sql](file:///wsl$/Ubuntu-22.04/home/conar/code/sous.tools/supabase/seed.sql)
* Mirror updated seed configurations in local development database script.

---

## Verification Plan

### Automated Tests
* Run `pnpm test` in the NestJS backend to verify test pass.
* Run `pnpm build` across all packages to verify TypeScript type-safety of recursive blocks structure.

### Manual Verification
* Run local Supabase DB reset to apply seed data.
* Spin up the signage player and verify that the glassmorphic orb background rendering, noise SVG filters, layout styles, and polymorphic blocks render exactly like the DTown Cafe mock design.
* Open the signage visual editor, adjust block content/layout parameters, and verify hot-reload WebSocket broadcast updates.
