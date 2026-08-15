"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Atom: a single recipe action control. Supports an icon-only mode (compact
 * cards, with an accessible label + tooltip) and an icon+label mode (the
 * emphasized "Run" action). Tone variants map to semantic tokens only.
 */
const actionVariants = cva(
  "group/action relative inline-flex select-none items-center justify-center gap-2 rounded-full border font-medium tracking-tight outline-none transition-[color,background-color,border-color,box-shadow] duration-[--ds-duration] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      tone: {
        run: "ds-gradient-pan ds-on-gradient border-transparent text-primary-foreground shadow-glow-sm hover:shadow-glow",
        neutral:
          "border-border bg-[color-mix(in_srgb,var(--card)_55%,transparent)] text-muted-foreground hover:border-[color:color-mix(in_srgb,var(--primary)_50%,var(--border))] hover:text-foreground",
        danger:
          "border-border bg-[color-mix(in_srgb,var(--card)_55%,transparent)] text-muted-foreground hover:border-[color:color-mix(in_srgb,var(--destructive)_55%,var(--border))] hover:bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] hover:text-destructive",
      },
      shape: {
        icon: "h-9 w-9",
        pill: "h-9 px-4 text-sm",
      },
    },
    defaultVariants: { tone: "neutral", shape: "icon" },
  },
)

export interface RecipeActionButtonProps
  extends Omit<React.ComponentProps<typeof motion.button>, "ref">,
    VariantProps<typeof actionVariants> {
  label: string
  icon: React.ReactNode
  /** When set, renders the label text beside the icon (pill shape). */
  showLabel?: boolean
}

export const RecipeActionButton = React.forwardRef<HTMLButtonElement, RecipeActionButtonProps>(
  ({ className, tone, shape, label, icon, showLabel, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
        whileHover={{ y: -1.5 }}
        whileTap={{ scale: 0.94, y: 0 }}
        transition={{ type: "spring", stiffness: 460, damping: 24 }}
        className={cn(actionVariants({ tone, shape: showLabel ? "pill" : shape }), className)}
        {...props}
      >
        <span className="inline-flex shrink-0">{icon}</span>
        {showLabel && <span>{label}</span>}
      </motion.button>
    )
  },
)
RecipeActionButton.displayName = "RecipeActionButton"
