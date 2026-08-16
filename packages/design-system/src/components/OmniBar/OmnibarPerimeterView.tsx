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
 * A single motion language for the OmniBar perimeter.
 *
 * Idle keeps a diffused gradient glow breathing behind the physical border,
 * with one restrained presence pass per cycle. Processing tightens and
 * brightens that glow into a continuously travelling brand-gradient ring.
 */
export function OmnibarPerimeterView({ busy }: OmnibarPerimeterViewProps) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
    >
      {/* The ambient layer lives outside the edge, never on top of the border. */}
      <motion.span
        className="absolute -inset-1 rounded-[inherit]"
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
            ? { opacity: busy ? 0.42 : 0.1, scale: 1 }
            : busy
              ? { opacity: [0.62, 0.9, 0.62], rotate: 360, scale: 1.015 }
              : { opacity: [0.08, 0.14, 0.1, 0.16, 0.08], scale: [1, 1.012, 1] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? {
                  rotate: { duration: 2.2, repeat: Infinity, ease: "linear" },
                  opacity: {
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.35, 0.62, 0.82, 1],
                }
        }
      />

      {/* A masked ring aligns exactly with the inherited pill radius. */}
      <motion.span
        className="absolute -inset-px rounded-[inherit]"
        style={{
          ...ringMask,
          background:
            "conic-gradient(from 0deg, transparent 0 42%, var(--primary) 54%, var(--accent) 66%, var(--violet) 78%, transparent 90%)",
          filter: busy ? "blur(0.2px)" : "blur(1.5px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.78 : 0.08 }
            : busy
              ? { opacity: 0.9, rotate: 360 }
              : { opacity: [0, 0, 0.14, 0.08, 0], rotate: [0, 0, 90, 250, 360] }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? { duration: 1.65, repeat: Infinity, ease: "linear" }
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
