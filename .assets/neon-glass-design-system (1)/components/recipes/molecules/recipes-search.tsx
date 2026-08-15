"use client"

import { Search, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Input } from "@/components/ui/input"

/**
 * Molecule: the recipe search field. Controlled by its container; built on the
 * design-system <Input /> atom with a leading search icon and a clear affordance.
 */
export function RecipesSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Input
      aria-label="Search recipes"
      placeholder="Search recipes, stations, categories…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      icon={<Search className="h-4 w-4" />}
      trailing={
        <AnimatePresence initial={false}>
          {value && (
            <motion.button
              type="button"
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              onClick={() => onChange("")}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      }
    />
  )
}
