"use client";

import { motion, type Transition } from "framer-motion";
import { useId } from "react";
import { cn } from "../../utils/cn";

/**
 * sous.tools logo suite
 * ─────────────────────────────────────────────────────────────────────────
 * Everything is drawn with
 * `currentColor` by default, so color follows CSS `color` (i.e. Tailwind
 * `text-*` utilities or the theme's `--foreground`). Pass `gradient` to fill
 * the mark with the neon brand gradient instead.
 *
 * Components:
 *   <MicroIcon />        — bare mark, fills its box (favicon / avatars)
 *   <Lettermark />       — mark in a padded square (app icon)
 *   <PrimaryLogo />      — mark + "sous.tools" wordmark (headers)
 *   <AnimatedLettermark />— self-drawing mark for loaders / progress
 */

// ── Shared mark path ────────────────────────────────────────────────────────
const MARK_PATH =
  "M 25,72 C 5,72 5,45 25,35 C 20,10 50,5 50,25 C 50,5 80,10 75,35 C 95,45 95,72 75,72 Z";

type MarkColorProps = {
  /** Fill the mark with the neon brand gradient instead of currentColor. */
  gradient?: boolean;
};

function useGradientDefs(enabled: boolean) {
  const id = useId().replace(/:/g, "");
  const strokeId = `sous-grad-${id}`;
  const defs = enabled ? (
    <defs>
      <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--primary)" />
        <stop offset="55%" stopColor="var(--accent)" />
        <stop offset="100%" stopColor="var(--violet)" />
      </linearGradient>
    </defs>
  ) : null;
  const paint = enabled ? `url(#${strokeId})` : "currentColor";
  return { defs, paint };
}

// ── MicroIcon: the bare mark ─────────────────────────────────────────────────
export function MicroIcon({
  className,
  gradient = false,
  ...props
}: React.SVGProps<SVGSVGElement> & MarkColorProps) {
  const { defs, paint } = useGradientDefs(gradient);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label="sous.tools"
      className={cn("shrink-0", className)}
      {...props}
    >
      {defs}
      <path
        d={MARK_PATH}
        fill="none"
        stroke={paint}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <rect x="25" y="78" width="50" height="10" rx="3" fill={paint} />
    </svg>
  );
}

// ── Lettermark: padded square app icon ───────────────────────────────────────
export function Lettermark({
  className,
  gradient = false,
  ...props
}: React.SVGProps<SVGSVGElement> & MarkColorProps) {
  const { defs, paint } = useGradientDefs(gradient);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label="sous.tools"
      className={cn("shrink-0", className)}
      {...props}
    >
      {defs}
      <g transform="translate(10, 10) scale(0.8)">
        <path
          d={MARK_PATH}
          fill="none"
          stroke={paint}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <rect x="25" y="78" width="50" height="10" rx="3" fill={paint} />
      </g>
    </svg>
  );
}

// ── PrimaryLogo: mark + refined wordmark ─────────────────────────────────────
export function PrimaryLogo({
  className,
  gradient = false,
  ...props
}: React.SVGProps<SVGSVGElement> & MarkColorProps) {
  const { defs, paint } = useGradientDefs(gradient);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 340 100"
      role="img"
      aria-label="sous.tools"
      className={cn("shrink-0", className)}
      {...props}
    >
      {defs}
      <g transform="translate(8, 15) scale(0.7)">
        <path
          d={MARK_PATH}
          fill="none"
          stroke={paint}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <rect x="25" y="78" width="50" height="10" rx="3" fill={paint} />
      </g>
      {/* Wordmark: strong display "sous" + mono ".tools" (engineer × chef) */}
      <text x="92" y="64" fill="currentColor" dominantBaseline="alphabetic">
        <tspan
          style={{
            fontFamily: "var(--font-archivo), var(--font-display), system-ui, sans-serif",
          }}
          fontWeight={700}
          fontSize={48}
          letterSpacing={-2.5}
        >
          sous
        </tspan>
        <tspan
          dx="2"
          style={{
            fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
          }}
          fontWeight={500}
          fontSize={38}
          letterSpacing={-1}
          fill={paint}
          opacity={gradient ? 1 : 0.72}
        >
          .tools
        </tspan>
      </text>
    </svg>
  );
}

// ── AnimatedLettermark: self-drawing mark for loaders ────────────────────────
export function AnimatedLettermark({
  className,
  gradient = true,
  loop = true,
  duration = 2.2,
  ...props
}: React.SVGProps<SVGSVGElement> &
  MarkColorProps & {
    /** Repeat the draw animation continuously (loader mode). */
    loop?: boolean;
    /** Seconds for one full draw cycle. */
    duration?: number;
  }) {
  const { defs, paint } = useGradientDefs(gradient);

  const strokeTransition: Transition = {
    duration,
    ease: "easeInOut",
    repeat: loop ? Number.POSITIVE_INFINITY : 0,
    repeatType: "loop",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Loading"
      className={cn("shrink-0", className)}
      {...props}
    >
      {defs}
      <g transform="translate(10, 10) scale(0.8)">
        <motion.path
          d={MARK_PATH}
          fill="none"
          stroke={paint}
          strokeWidth={8}
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: [0, 1, 1], opacity: [0.35, 1, 0.35] }}
          transition={strokeTransition}
        />
        <motion.rect
          x="25"
          y="78"
          width="50"
          height="10"
          rx="3"
          fill={paint}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0.4] }}
          style={{ transformOrigin: "25px 83px" }}
          transition={strokeTransition}
        />
      </g>
    </svg>
  );
}
