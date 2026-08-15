"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Recipe } from "@/lib/recipes/types"
import { cn } from "@/lib/utils"
import { RecipeCard } from "./recipe-card"

/** Id-based handler contract shared by the section, view, and container. */
export interface RecipeHandlers {
  onView: (id: string) => void
  onRun: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function RecipesSection({
  title,
  description,
  icon,
  accentTone = "--primary",
  recipes,
  emphasis = "default",
  density = "compact",
  handlers,
}: {
  title: string
  description?: string
  icon: React.ReactNode
  accentTone?: string
  recipes: Recipe[]
  emphasis?: "featured" | "default"
  density?: "featured" | "compact"
  handlers: RecipeHandlers
}) {
  if (recipes.length === 0) return null
  const color = `var(${accentTone})`

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-border bg-muted text-muted-foreground"
        >
          <span className="absolute inset-y-0 left-0 w-0.5" style={{ backgroundColor: color }} />
          {icon}
        </span>
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
              {recipes.length}
            </span>
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <motion.div
        layout
        className={cn(
          "grid grid-cols-1 gap-4",
          density === "featured"
            ? "sm:grid-cols-2 xl:grid-cols-3"
            : "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
        )}
      >
        <AnimatePresence mode="popLayout">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              emphasis={emphasis}
              onView={() => handlers.onView(recipe.id)}
              onRun={() => handlers.onRun(recipe.id)}
              onEdit={() => handlers.onEdit(recipe.id)}
              onDelete={() => handlers.onDelete(recipe.id)}
              onTogglePin={() => handlers.onTogglePin(recipe.id)}
              onToggleFavorite={() => handlers.onToggleFavorite(recipe.id)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  )
}
