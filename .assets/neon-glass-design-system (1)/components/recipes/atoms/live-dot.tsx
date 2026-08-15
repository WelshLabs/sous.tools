"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Atom: a pulsing "live" dot. Used to signal an active POS/menu feed.
 * Color is token-driven via the `tone` CSS variable name.
 */
export function LiveDot({
  tone = "--success",
  className,
}: {
  tone?: string
  className?: string
}) {
  const color = `var(${tone})`
  return (
    <span className={cn("relative inline-flex h-2 w-2 shrink-0", className)}>
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
      />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}
