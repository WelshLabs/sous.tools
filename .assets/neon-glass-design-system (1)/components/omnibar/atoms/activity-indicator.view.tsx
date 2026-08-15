"use client"

import { motion } from "framer-motion"

export function ActivityIndicatorView() {
  return (
    <span className="flex items-center gap-1" aria-label="Agent is working">
      {[0, 1, 2].map((dot) => (
        <motion.span key={dot} className="h-1 w-1 rounded-full bg-primary" animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.14 }} />
      ))}
    </span>
  )
}
