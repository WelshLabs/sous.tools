"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-14", className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-col gap-2"
      >
        {eyebrow && (
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
        )}
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
          {title}
        </h2>
        {description && <p className="max-w-2xl text-muted-foreground text-pretty">{description}</p>}
      </motion.div>
      {children}
    </section>
  )
}

export function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">{children}</p>
  )
}
