"use client";

import { type Recipe } from "@soustools/api-types";
import { Play, Edit3, Trash2, Scale, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

/**
 * Props for the RecipeCard component.
 */
export interface RecipeCardProps {
  /** The recipe data to display. */
  recipe: Recipe;
  /**
   * Called when the user clicks the delete (trash) icon.
   * The app layer owns the confirmation dialog and API call.
   */
  onDelete: (id: string) => void;
}

/**
 * RecipeCard — a compact, grid-ready card displaying a single recipe's
 * key metadata and quick-action buttons.
 *
 * Uses the Neon-Glass `--color-card` surface token. Active badge uses the
 * `--color-warning` amber palette (#f59e0b).
 *
 * **Presentation boundary**: contains no data-fetching. All data arrives
 * via props; mutations are delegated to `onDelete`.
 *
 * @tenant-docs-export
 * # RecipeCard
 * ```tsx
 * import { RecipeCard } from "@soustools/domain-recipes";
 *
 * <RecipeCard recipe={recipe} onDelete={(id) => handleDelete(id)} />
 * ```
 */
export function RecipeCard({ recipe, onDelete }: RecipeCardProps) {
  return (
    <div
      className="p-5 rounded-2xl flex flex-col justify-between shadow-xl
        transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <div className="flex justify-between items-start gap-2">
          <h3
            className="text-base font-bold line-clamp-1"
            style={{ color: "var(--color-foreground)" }}
          >
            {recipe.title}
          </h3>
          {recipe.status === "PENDING_REVIEW" && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(245 158 11 / 0.10)",
                color: "#f59e0b",
                border: "1px solid rgb(245 158 11 / 0.20)",
              }}
            >
              Pending
            </span>
          )}
        </div>

        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Yield: {recipe.yieldCount} {recipe.yieldUnit}
        </p>

        {recipe.sourceBook && (
          <p
            className="text-[10px] mt-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Source:{" "}
            <span style={{ color: "var(--color-foreground)" }}>
              {recipe.sourceBook}
            </span>
            {recipe.sourcePageStart && ` (p. ${recipe.sourcePageStart})`}
          </p>
        )}

        {recipe.vessel && (
          <p
            className="text-[11px] mt-1 flex items-center gap-1 font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            <Scale className="w-3.5 h-3.5" /> Pan: {recipe.vessel.name}
          </p>
        )}

        {recipe.posItemId ? (
          <p
            className="text-[11px] mt-1 flex items-center gap-1 font-semibold"
            style={{ color: "var(--color-success, #10b981)" }}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Linked POS Item
          </p>
        ) : (
          <p
            className="text-[11px] mt-1 flex items-center gap-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <LinkIcon className="w-3.5 h-3.5" /> Unlinked POS
          </p>
        )}

        <div
          className="text-xs mt-3 line-clamp-2"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {recipe.instructions.length} step
          {recipe.instructions.length !== 1 ? "s" : ""}:{" "}
          {recipe.instructions.map((step) => step.text).join(", ")}
        </div>
      </div>

      <div
        className="flex gap-2 mt-6 pt-4"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <Link href={`/recipes/${recipe.id}`} className="flex-1">
          <button
            className="w-full py-1.5 px-3 text-xs rounded-lg font-semibold
              cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-secondary-foreground)",
            }}
          >
            View &amp; Scale
          </button>
        </Link>

        <Link href={`/recipes/${recipe.id}/kitchen`}>
          <button
            className="py-1.5 px-3 text-xs rounded-lg font-bold flex
              items-center gap-1 cursor-pointer transition-colors"
            style={{
              backgroundColor: "rgb(16 185 129 / 0.10)",
              color: "#10b981",
            }}
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run
          </button>
        </Link>

        <Link href={`/recipes/${recipe.id}/edit`}>
          <button
            className="p-2 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-secondary-foreground)",
            }}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </Link>

        <button
          onClick={() => onDelete(recipe.id)}
          className="p-2 rounded-lg cursor-pointer transition-colors"
          style={{
            backgroundColor: "rgb(244 63 94 / 0.10)",
            color: "var(--color-destructive)",
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
