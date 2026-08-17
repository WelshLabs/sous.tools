"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ringMask: CSSProperties = {
  WebkitMask:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  maskComposite: "exclude",
};

/**
 * Radius-aligned perimeter light shared by every OmniBar shape.
 * Idle motion is intentionally quiet; processing is crisp and continuous.
 */
export function OmnibarPerimeterView({ busy }: { busy: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {/* A broad masked halo sits behind the edge without tinting the center. */}
      <motion.span
        className={
          reducedMotion
            ? "absolute -inset-1 rounded-[inherit]"
            : `omnibar-perimeter-spin absolute -inset-1 rounded-[inherit] ${busy ? "" : "omnibar-perimeter-spin--ambient"}`
        }
        style={{
          ...ringMask,
          padding: busy ? "5px" : "4px",
          background:
            "conic-gradient(from var(--omnibar-perimeter-angle), var(--primary), var(--accent), var(--violet), var(--primary))",
          filter: busy ? "blur(6px)" : "blur(11px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.72 : 0.12 }
            : busy
              ? { opacity: [0.62, 0.9, 0.62], rotate: 360, scale: 1.015 }
              : {
                  opacity: [0.08, 0.16, 0.08],
                  rotate: 360,
                  scale: [0.995, 1.008, 0.995],
                }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? {
                  rotate: {
                    duration: 2.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                  opacity: {
                    duration: 2.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  scale: { duration: 0.3 },
                }
              : {
                  rotate: {
                    duration: 18,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                  opacity: {
                    duration: 5.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 5.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }
        }
      />

      {/* The processing edge is intentionally sharper than the ambient halo. */}
      <motion.span
        className={
          reducedMotion
            ? "absolute inset-0 rounded-[inherit]"
            : `omnibar-perimeter-spin absolute inset-0 rounded-[inherit] ${busy ? "" : "omnibar-perimeter-spin--presence"}`
        }
        style={{
          ...ringMask,
          padding: busy ? "2px" : "1px",
          background:
            "conic-gradient(from var(--omnibar-perimeter-angle), transparent 0deg, var(--primary) 48deg, var(--accent) 112deg, var(--violet) 168deg, transparent 226deg, transparent 360deg)",
          filter: busy ? "blur(0.25px)" : "blur(0.7px)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { opacity: busy ? 0.9 : 0 }
            : busy
              ? { opacity: 0.92, rotate: 360 }
              : { opacity: [0, 0, 0.18, 0.08, 0], rotate: 360 }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : busy
              ? {
                  rotate: {
                    duration: 2.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                }
              : {
                  rotate: {
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                  opacity: {
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    times: [0, 0.72, 0.8, 0.9, 1],
                    ease: "easeInOut",
                  },
                }
        }
      />
    </span>
  );
}
