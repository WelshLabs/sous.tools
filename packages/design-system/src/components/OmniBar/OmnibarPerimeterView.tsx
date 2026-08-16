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

/**
 * A radius-aligned perimeter glow shared by the collapsed and expanded OmniBar.
 * Idle motion stays ambient; processing tightens into a prominent runner.
 */
export function OmnibarPerimeterView({ busy }: OmnibarPerimeterViewProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
    >
      <motion.span
        className="absolute inset-0 rounded-[inherit]"
        style={{
          ...ringMask,
          padding: busy ? "5px" : "4px",
          background:
            "conic-gradient(from 0deg, var(--primary), var(--accent), var(--violet), var(--primary))",
          filter: busy ? "blur(6px)" : "blur(11px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.62 : 0.1, scale: 1 }
            : busy
              ? { opacity: [0.62, 0.9, 0.62], rotate: 360, scale: 1.015 }
              : { opacity: [0.06, 0.14, 0.08], scale: [1, 1.012, 1] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? {
                  rotate: { duration: 2.6, repeat: Infinity, ease: "linear" },
                  opacity: {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <motion.span
        className="absolute inset-0 rounded-[inherit]"
        style={{
          ...ringMask,
          background:
            "conic-gradient(from 0deg, transparent 0 38%, var(--primary) 52%, var(--accent) 64%, var(--violet) 75%, transparent 88%)",
          filter: busy ? "blur(0.5px)" : "blur(1.5px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.88 : 0.08 }
            : busy
              ? { opacity: 0.9, rotate: 360 }
              : { opacity: [0, 0, 0.14, 0.08, 0], rotate: [0, 0, 90, 260, 360] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? { duration: 2.1, repeat: Infinity, ease: "linear" }
              : {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.7, 0.78, 0.92, 1],
                }
        }
      />
    </span>
  );
}
