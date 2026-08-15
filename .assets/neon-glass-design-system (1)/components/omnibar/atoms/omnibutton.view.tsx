"use client"

import { motion } from "framer-motion"
import { AnimatedLettermark, Lettermark } from "@/components/logo"
import { OmnibarPerimeterView } from "./omnibar-perimeter.view"

const shellTransition = { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 }

export function OmnibuttonView({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <motion.button
      layoutId="omnibar-shell"
      type="button"
      onClick={onClick}
      aria-label={busy ? "Sous chef is thinking" : "Open sous chef"}
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.96 }}
      transition={shellTransition}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 overflow-hidden rounded-full border border-border/70 bg-card/95 p-0 text-foreground shadow-[0_16px_44px_-14px_rgb(0_0_0/0.55)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <OmnibarPerimeterView busy={busy} />
      <span aria-hidden="true" className="relative flex h-full w-full items-center justify-center">
        {busy ? <AnimatedLettermark className="h-7 w-7" duration={1.45} /> : <Lettermark gradient className="h-7 w-7" />}
      </span>
    </motion.button>
  )
}
