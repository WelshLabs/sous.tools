---
name: design-system
description: Rules for @soustools/design-system — Neon-Glass Tailwind v4 token architecture, glassmorphism patterns, Japanese Gokujo iconography, and Kitchen Mode high-glare environments.
---

# `@soustools/design-system` — Neon-Glass Design System Rules

> [!IMPORTANT]
> `@soustools/design-system` (`packages/design-system`) is the **sole UI authority** for the workspace.
> `@soustools/ui` (`packages/ui`) is **deprecated**. Do not import from it in any new code.

---

## Package Identity

| Property        | Value                                 |
| --------------- | ------------------------------------- |
| Package name    | `@soustools/design-system`            |
| CSS entry       | `packages/design-system/index.css`    |
| Component entry | `packages/design-system/src/index.ts` |
| Token source    | `v2-snapshot.md` → `sous-theme.kdl`   |

---

## Neon-Glass Palette (Canonical — from `v2-snapshot.md`)

All color values are sourced **exclusively** from the v2 `sous-theme.kdl` terminal theme file.

| Token                      | Hex       | Role                                   |
| -------------------------- | --------- | -------------------------------------- |
| `--color-primary`          | `#4cc9f0` | Neon cyan — primary interactive accent |
| `--color-background`       | `#0f172a` | Page backdrop (slate-900)              |
| `--color-card`             | `#1e293b` | Elevated surface (slate-800)           |
| `--color-foreground`       | `#f8fafc` | Primary text (slate-50)                |
| `--color-accent`           | `#f72585` | Neon pink — secondary accent (magenta) |
| `--color-destructive`      | `#f43f5e` | Error / danger (rose-500)              |
| `--color-secondary`        | `#334155` | Muted surface (slate-700)              |
| `--color-muted-foreground` | `#94a3b8` | De-emphasized text (slate-400)         |
| `--color-border`           | `#334155` | Structural borders (slate-700)         |
| `--color-ring`             | `#4cc9f0` | Focus ring — matches primary           |

---

## Tailwind v4 `@theme` Directive Rules

1. **All tokens are hardcoded hex** — no `hsl(var(--*))` indirection.
2. **Semantic names only** — use `--color-primary`, not `--color-cyan-400`.
3. **Z-indexes are token-scoped** — always use `--z-bottom-nav: 40`, `--z-sidebar: 50`, `--z-modal: 100`, `--z-toast: 150`.
4. **Font mapping** — `--font-sans` maps to `var(--font-primary)` injected by Next.js layout.

```css
/* ✅ CORRECT — hardcoded token in @theme */
@theme {
  --color-primary: #4cc9f0;
  --z-modal: 100;
}

/* ❌ FORBIDDEN — hsl indirection from old @soustools/ui pattern */
@theme {
  --color-primary: hsl(var(--primary)); /* DO NOT DO THIS */
}
```

---

## Glassmorphism — `.glass-panel` Rules

Use the predefined utility classes from `index.css`. Do not re-implement them inline.

| Class                              | Use Case                                        |
| ---------------------------------- | ----------------------------------------------- |
| `.glass-panel` / `.st-glass-panel` | KDS/POS primary frosted surface                 |
| `.glass-card`                      | Secondary elevated card with inner glow         |
| `.st-glass-pill`                   | Rounded pill shape (nav chips, badges)          |
| `.neon-glow`                       | Cyan box-shadow glow on focused/active elements |
| `.neon-glow-lg`                    | Stronger glow for primary CTAs                  |
| `.neon-glow-pink`                  | Magenta accent glow                             |
| `.neon-border`                     | Cyan inset + outset border glow                 |

---

## Atomic Components

All components are **presentation-only**. They accept data via props and emit events via callbacks. No data fetching, no Supabase, no server calls.

| Component                 | File                               | Export             |
| ------------------------- | ---------------------------------- | ------------------ |
| `TwoToneHeader`           | `src/components/TwoToneHeader.tsx` | Named              |
| `Button`                  | `src/components/Button.tsx`        | Named + forwardRef |
| `Card` (+ sub-components) | `src/components/Card.tsx`          | Named family       |
| `Input`                   | `src/components/Input.tsx`         | Named + forwardRef |
| `Label`                   | `src/components/Label.tsx`         | Named              |

### Button Variant Naming (shadcn-style)

```tsx
// ✅ CORRECT — shadcn-style variant names
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// ❌ FORBIDDEN — old @soustools/ui naming
<Button variant="primary">...</Button>  // "primary" is NOT a valid variant
```

---

## Iconography

- **ONLY** Japanese Gokujo curved knife profiles — no Western chef knives.
- Icon library: `lucide-react` (listed as a dependency in `packages/design-system/package.json`).
- Consistent stroke width: `2px`.

---

## Kitchen Mode Rules

For any component rendered on a KDS, POS kiosk, or edge node display:

1. Use `size="lg"` on `Button` — enforces `min-h-[48px]`.
2. Apply `.kitchen-touch` utility for non-Button interactive elements — enforces `min-h-[56px]`.
3. Wrap primary surfaces with `.glass-panel` for ambient glare rejection.
4. Use `border-2` instead of `border` for thick-border kitchen mode visibility.

---

## Adding a New Component

1. Create `packages/design-system/src/components/ComponentName.tsx`.
2. Use semantic CSS variables via `style={{ color: "var(--color-foreground)" }}` for token reference.
3. Export the component and its prop types from `packages/design-system/src/index.ts`.
4. Add JSDoc with `@tenant-docs-export` and a usage example.
5. **Never import from `@soustools/ui`** inside this package.
