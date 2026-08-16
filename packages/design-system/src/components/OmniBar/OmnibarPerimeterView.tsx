"use client";

import { motion, useReducedMotion } from "framer-motion";

interface OmnibarPerimeterViewProps {
  busy: boolean;
}

const ringMask = {
  padding: "2px",
  WebkitMask:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
} as const;

const brandGradient =
  "conic-gradient(from 0deg, var(--primary), var(--accent), var(--violet), var(--primary))";

/**
 * The OmniBar's shared motion language.
 *
 * Idle feels alive through a near-imperceptible inner tint and exterior breath,
 * then gives one restrained perimeter pass. Processing keeps the tint visible
 * while tightening the perimeter into a prominent travelling brand-gradient.
 */
export function OmnibarPerimeterView({ busy }: OmnibarPerimeterViewProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
    >
      {/* Controlled inner color wash — visible, but never compromises copy. */}
      <motion.span
        className="absolute inset-px rounded-[inherit]"
        style={{
          background:
            "linear-gradient(105deg, rgb(var(--ds-neon-primary-rgb) / 0.18), rgb(var(--ds-neon-accent-rgb) / 0.1) 48%, rgb(var(--ds-neon-violet-rgb) / 0.15))",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.32 : 0.1 }
            : busy
              ? { opacity: [0.24, 0.4, 0.24], scale: [1, 1.008, 1] }
              : { opacity: [0.05, 0.12, 0.06], scale: [1, 1.004, 1] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Exterior breathing halo. Overflow remains visible on both pill shells. */}
      <motion.span
        className="absolute -inset-2 rounded-[inherit]"
        style={{
          ...ringMask,
          padding: busy ? "7px" : "6px",
          background: brandGradient,
          filter: busy ? "blur(8px)" : "blur(12px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.58 : 0.14, scale: 1 }
            : busy
              ? { opacity: [0.58, 0.95, 0.58], rotate: 360, scale: 1.025 }
              : { opacity: [0.1, 0.25, 0.12], scale: [1, 1.025, 1] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? {
                  rotate: { duration: 2.35, repeat: Infinity, ease: "linear" },
                  opacity: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Radius-aligned crisp runner: constant in processing, sparse when idle. */}
      <motion.span
        className="absolute -inset-px rounded-[inherit]"
        style={{
          ...ringMask,
          background:
            "conic-gradient(from 0deg, transparent 0 34%, var(--primary) 48%, var(--accent) 62%, var(--violet) 76%, transparent 90%)",
          filter: busy
            ? "drop-shadow(0 0 4px rgb(var(--ds-neon-accent-rgb) / 0.65))"
            : "blur(1px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.9 : 0.12 }
            : busy
              ? { opacity: 1, rotate: 360 }
              : { opacity: [0, 0, 0.2, 0.12, 0], rotate: [0, 0, 100, 260, 360] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? { duration: 1.8, repeat: Infinity, ease: "linear" }
              : {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.68, 0.76, 0.9, 1],
                }
        }
      />
    </span>
  );
}
