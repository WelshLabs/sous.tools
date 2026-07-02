import React from "react";

/**
 * Props for the RecipeDietaryBadges component.
 */
export interface RecipeDietaryBadgesProps {
  /**
   * A map of dietary flag keys to boolean active values.
   * Keys: vegan, vegetarian, pescetarian, keto, gluten_free, dairy_free,
   * egg_free, nut_free, low_sodium, high_protein.
   */
  dietaryFlags: Record<string, boolean>;
}

/**
 * RecipeDietaryBadges — renders a horizontal flex-wrap of colored badges
 * for each active dietary flag.
 *
 * Colors are mapped to semantic palette entries from the Neon-Glass system.
 * Badge backgrounds use `rgb()` alpha variants of the sous-theme.kdl palette
 * to maintain the dark-surface glass aesthetic.
 *
 * Returns `null` if no flags are active.
 *
 * @tenant-docs-export
 * # RecipeDietaryBadges
 * ```tsx
 * import { RecipeDietaryBadges } from "@soustools/domain-recipes";
 *
 * <RecipeDietaryBadges dietaryFlags={nutrition.dietaryFlags} />
 * ```
 */
export function RecipeDietaryBadges({ dietaryFlags }: RecipeDietaryBadgesProps) {
  if (!dietaryFlags) return null;

  /**
   * Each entry maps to an inline style tuple: [bgColor, textColor, borderColor].
   * Values sourced from sous-theme.kdl palette with alpha transparency for glass effect.
   */
  const labels: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    vegan:       { label: "Vegan",       bg: "rgb(16 185 129 / 0.12)", text: "#10b981", border: "rgb(16 185 129 / 0.25)" },
    vegetarian:  { label: "Vegetarian",  bg: "rgb(34 197 94 / 0.12)",  text: "#22c55e", border: "rgb(34 197 94 / 0.25)"  },
    pescetarian: { label: "Pescetarian", bg: "rgb(20 184 166 / 0.12)", text: "#14b8a6", border: "rgb(20 184 166 / 0.25)" },
    keto:        { label: "Keto",        bg: "rgb(99 102 241 / 0.12)", text: "#6366f1", border: "rgb(99 102 241 / 0.25)" },
    gluten_free: { label: "Gluten Free", bg: "rgb(245 158 11 / 0.12)", text: "#f59e0b", border: "rgb(245 158 11 / 0.25)" },
    dairy_free:  { label: "Dairy Free",  bg: "rgb(14 165 233 / 0.12)", text: "#0ea5e9", border: "rgb(14 165 233 / 0.25)" },
    egg_free:    { label: "Egg Free",    bg: "rgb(234 179 8 / 0.12)",  text: "#eab308", border: "rgb(234 179 8 / 0.25)"  },
    nut_free:    { label: "Nut Free",    bg: "rgb(244 63 94 / 0.12)",  text: "var(--color-destructive)", border: "rgb(244 63 94 / 0.25)" },
    low_sodium:  { label: "Low Sodium",  bg: "rgb(37 99 235 / 0.12)",  text: "#2563eb", border: "rgb(37 99 235 / 0.25)"  },
    high_protein:{ label: "High Protein",bg: "rgb(247 37 133 / 0.12)", text: "var(--color-accent)", border: "rgb(247 37 133 / 0.25)" },
  };

  const activeBadges = Object.entries(dietaryFlags)
    .filter(([, active]) => active)
    .map(([key]) => ({ key, ...labels[key] }))
    .filter((b) => b.label !== undefined);

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {activeBadges.map((badge) => (
        <span
          key={badge.key}
          className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
          style={{
            backgroundColor: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.border}`,
          }}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
