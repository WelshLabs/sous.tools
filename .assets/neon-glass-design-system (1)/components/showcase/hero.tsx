"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { PrimaryLogo } from "@/components/logo"
import { Button } from "@/components/ui/button"

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-16 pt-16 text-center sm:pt-24">
      <motion.div custom={0} variants={fade} initial="hidden" animate="show">
        <span className="ds-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Neon-glass design system
        </span>
      </motion.div>

      <motion.div custom={1} variants={fade} initial="hidden" animate="show" className="mt-8">
        <PrimaryLogo gradient className="mx-auto h-16 w-auto sm:h-20" />
      </motion.div>

      <motion.h1
        custom={2}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-8 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground text-balance sm:text-6xl"
      >
        Where the <span className="ds-text-neon">engineer</span> meets the{" "}
        <span className="ds-text-neon">chef</span>.
      </motion.h1>

      <motion.p
        custom={3}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty"
      >
        A token-driven system with a blue-neon glow, frosted glass surfaces, and motion that feels alive —
        engineered for both light and dark.
      </motion.p>

      <motion.div
        custom={4}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <Button size="lg" variant="gradient">
          Explore the system
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="glass">
          View components
        </Button>
      </motion.div>
    </section>
  )
}
