"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Atom: a round toggle affordance (pin, favorite). Purely presentational —
 * receives `active` + `onToggle` from its container. When active it fills with
 * the given semantic tone and emits a soft glow; the icon pops on change.
 */
export function ToggleIconButton({
  active,
  onToggle,
  label,
  tone = "--primary",
  activeIcon,
  inactiveIcon,
  className,
}: {
  active: boolean
  onToggle: () => void
  label: string
  tone?: string
  activeIcon: React.ReactNode
  inactiveIcon: React.ReactNode
  className?: string
}) {
  const color = `var(${tone})`
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      whileTap={{ scale: 0.85 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-[--ds-duration]",
        active
          ? "border-transparent"
          : "border-border bg-[color-mix(in_srgb,var(--card)_60%,transparent)] text-muted-foreground hover:text-foreground",
        className,
      )}
      style={
        active
          ? {
              color,
              backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
              boxShadow: `0 0 14px -3px color-mix(in srgb, ${color} 70%, transparent)`,
            }
          : undefined
      }
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={active ? "on" : "off"}
          initial={{ scale: 0.4, opacity: 0, rotate: active ? -30 : 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 24 }}
          className="inline-flex"
        >
          {active ? activeIcon : inactiveIcon}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
