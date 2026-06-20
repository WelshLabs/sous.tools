# 🚀 PHASE 2: SIGNAGE VISUAL EDITOR & POLYMORPHIC BLOCKS PLAN

This architectural plan defines the refactoring needed to translate static HTML designs (like the DTown Cafe Glassmorphic Menu) into our dynamic, edge-ready React signage player, powered by a Visual Editor.

## 1. STRATEGIC APPROACH TO POLYMORPHIC BLOCKS

Instead of hardcoding organization-specific layouts like "ExplodedItemBlock", we will build a universal structural system. The visual editor will allow nesting components in any desired layout (grids, columns, rows).

### The Layout Primitives (Structural)
* **`GridBlock`**: A multi-cell container supporting defined rows and columns.
* **`ColumnBlock` / `RowBlock`**: Flex containers for stacking content vertically or horizontally.

### The Content Primitives (Leaves)
Inside any layout primitive, tenants can drop content blocks:
* **`CategoryHeaderBlock`**: Displays category titles, subtitles, and optional badges.
* **`PosItemBlock`**: Displays a single synchronized POS item (Name, Description, Price). Applies real-time `.pos-sold-out` styles.
* **`ModifierGroupBlock`**: Dynamically displays POS modifier groups (e.g., proteins, spreads, cheeses) synced from the PosModifierGroup tables.
* **`CalloutBlock`**: Renders custom emphasized text blocks (e.g., "🥖 All bread made from scratch").
* **`MediaCarouselBlock`**: Auto-advancing image/video carousel (supports "Ken Burns" pan effects).
* **`NestedItemBlock`**: Displays a base item and a bulleted list of potential upgrades/modifications.

## 2. API TYPES REFACTORING (`packages/api-types`)

We will update `packages/api-types/src/signage.ts` to deprecate rigid columns and implement the recursive `SignageBlock` discriminated union.

```typescript
export type SignageBlock =
  | { type: "GridBlock", columns: number, rows: number, cells: SignageBlock[] }
  | { type: "ColumnBlock", blocks: SignageBlock[] }
  | { type: "RowBlock", blocks: SignageBlock[] }
  | { type: "CategoryHeaderBlock", title: string, subtitle?: string }
  | { type: "PosItemBlock", posItemId: string }
  | { type: "ModifierGroupBlock", modifierGroupId: string }
  | { type: "CalloutBlock", icon: string, text: string }
  | { type: "MediaCarouselBlock", slides: MediaSlide[] }
  | { type: "NestedItemBlock", basePosItemId: string, upgradeItems: UpgradeItem[] };
```

## 3. SEPARATION OF CONCERNS (STYLES VS. EDITOR)

We will maintain a strict separation between un-opinionated platform primitives and tenant-specific design expression.

**Configured via Visual Editor Forms (Generic Presets):**
* Predefined generic animations (e.g., `imageEffect: 'ken-burns'`).
* Toggleable component style preset tags (e.g., `panelStyle: 'glass'` or `theme: 'glassmorphic'`) which apply baseline structural CSS classes like `.st-glass-panel` or `.st-menu-glow-text`.

**Configured via Monaco Custom CSS Engine (Tenant Specifics):**
* The exact HEX/RGBA glow dropshadows (e.g., `0 0 15px rgba(0, 240, 255, 0.6)`).
* Custom SVG ambient background layers (e.g., the exact noise filter code used for the orbs).
* Custom `@keyframes` (like `floatOrbs` and `shimmer`).
* This CSS is stored in `deck.config.customCss` and injected live into the head of the player via `<style id="tenant-custom-css">`.

## 4. SIGNAGE DISPLAY ENGINE & SEEDING

* **React Components**: Create discrete Server/Client components in `apps/signage/src/components/blocks/` that cleanly accept their typed props and render the semantic HTML.
* **Database Seeding**: Update `SEED_DATA.sql` so the DTown Cafe configuration directly utilizes this new recursive JSON structure. The seed will inject the custom ambient orb CSS precisely into the `customCss` property of the deck payload.
