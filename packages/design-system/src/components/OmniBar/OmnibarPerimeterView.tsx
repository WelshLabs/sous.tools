"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * OmnibarPerimeterView
 *
 * Animated SVG border that traces a neon gradient around its parent
 * container. Uses a ResizeObserver to stay in sync with any layout
 * changes (idle pill ↔ active pill ↔ droplet morph).
 *
 * - `busy=false` → subtle idle shimmer that fires on a slow repeat cycle
 * - `busy=true`  → continuous gradient chase (processing state)
 *
 * Ported from the v0 Neon-Glass design system. All tokens are semantic.
 */
export function OmnibarPerimeterView({ busy }: { busy: boolean }) {
  const reducedMotion = useReducedMotion();
  const gradientId = useId();
  const frameRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () =>
      setSize({ width: frame.clientWidth, height: frame.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  if (!size || size.width === 0 || size.height === 0) {
    return (
      <span
        ref={frameRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border/90"
      />
    );
  }

  const inset = 1;
  const width = Math.max(1, size.width - inset * 2);
  const height = Math.max(1, size.height - inset * 2);
  const radius = height / 2;
  const perimeter = 2 * (width - 2 * radius) + 2 * Math.PI * radius;

  return (
    <span
      ref={frameRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border/90"
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="0.55" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <motion.g
          initial={{ opacity: 0 }}
          animate={
            reducedMotion
              ? { opacity: busy ? 1 : 0, strokeDashoffset: 0 }
              : busy
                ? { opacity: 1, strokeDashoffset: -perimeter }
                : {
                    opacity: [0, 0, 1, 1, 0],
                    strokeDashoffset: [0, 0, -perimeter * 0.12, -perimeter],
                  }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : busy
                ? {
                    strokeDashoffset: {
                      duration: 2.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    },
                    opacity: { duration: 0.15 },
                  }
                : {
                    opacity: {
                      duration: 6.2,
                      repeat: Number.POSITIVE_INFINITY,
                      times: [0, 0.55, 0.63, 0.89, 1],
                      ease: "linear",
                    },
                    strokeDashoffset: {
                      duration: 6.2,
                      repeat: Number.POSITIVE_INFINITY,
                      times: [0, 0.55, 0.63, 1],
                      ease: "linear",
                    },
                  }
          }
        >
          <rect
            x={inset}
            y={inset}
            width={width}
            height={height}
            rx={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeLinecap="round"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "blur(0.35px)" }}
            strokeDasharray={`${perimeter * 0.18} ${perimeter * 0.82}`}
          />
        </motion.g>
      </svg>
    </span>
  );
}
