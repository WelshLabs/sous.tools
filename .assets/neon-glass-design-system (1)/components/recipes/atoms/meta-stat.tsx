import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Atom: an icon + value micro-stat (yield, prep time, plate cost…).
 * Optional `tone` tints the icon with a semantic token; text stays legible
 * via the standard foreground/muted roles.
 */
export function MetaStat({
  icon,
  value,
  label,
  tone,
  className,
}: {
  icon: React.ReactNode
  value: React.ReactNode
  label?: string
  tone?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="inline-flex shrink-0" style={tone ? { color: `var(${tone})` } : undefined}>
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{value}</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}
