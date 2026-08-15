import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Atom: a compact status/label pill. Tone is a semantic color-token name so
 * the badge tints itself (fill + text + border) from a single source of truth.
 * `plain` renders a neutral outline badge (for station / category labels).
 */
export function RecipeBadge({
  tone = "--primary",
  plain = false,
  icon,
  children,
  className,
}: {
  tone?: string
  plain?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const color = `var(${tone})`
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        plain && "border-border bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] text-muted-foreground",
        className,
      )}
      style={
        plain
          ? undefined
          : {
              color,
              backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
            }
      }
    >
      {icon}
      {children}
    </span>
  )
}
