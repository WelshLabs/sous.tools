"use client"

import { motion } from "framer-motion"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Molecule: shown when a filter/search yields no recipes. Presentational;
 * the reset handler is provided by the container.
 */
export function RecipesEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="ds-glass flex flex-col items-center gap-4 rounded-[var(--radius-lg)] px-6 py-16 text-center"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary">
        <SearchX className="h-6 w-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-semibold text-foreground">No recipes found</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Nothing matches your current search and filters. Try broadening your search or clearing the filters.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onReset}>
        Clear filters
      </Button>
    </motion.div>
  )
}
