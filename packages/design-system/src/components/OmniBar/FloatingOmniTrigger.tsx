"use client";

import { motion } from "framer-motion";
import { OmniBar } from "./index";

const shellTransition = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

export function FloatingOmniTrigger() {
  return (
    <motion.div
      className="z-omnibar fixed right-6 bottom-6 rounded-full"
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.96 }}
      transition={shellTransition}
      animate={{
        boxShadow: [
          "var(--ds-glow-sm)",
          "var(--ds-glow-accent)",
          "var(--ds-glow-sm)",
        ],
      }}
      style={{ animationTimingFunction: "var(--ds-ease)" }}
    >
      <OmniBar />
    </motion.div>
  );
}
