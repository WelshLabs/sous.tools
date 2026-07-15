"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { AnimatedLettermark } from "./logos/Logo";
import { cn } from "../utils/cn";
import { motion } from "framer-motion";

// TopProgress is in its own file to stay within the 200-line architectural limit.
export { TopProgress } from "./TopProgress";


const loaderSize = cva("", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-10 w-10",
      lg: "h-16 w-16",
      xl: "h-24 w-24",
    },
  },
  defaultVariants: { size: "md" },
});

type BaseProps = VariantProps<typeof loaderSize> & {
  className?: string;
  label?: string;
};

/** Brand loader — the sous.tools mark drawing itself. */
export function BrandLoader({
  size,
  className,
  label = "Loading",
  gradient = true,
}: BaseProps & { gradient?: boolean }) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <AnimatedLettermark
        gradient={gradient}
        className={cn(loaderSize({ size }))}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Ring spinner — neon gradient conic ring. */
export function Spinner({ size, className, label = "Loading" }: BaseProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex", className)}
    >
      <span
        className={cn("block animate-spin rounded-full", loaderSize({ size }))}
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, var(--primary) 70%, var(--accent) 100%)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Dots — three pulsing neon dots. */
export function DotsLoader({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-primary shadow-glow-sm"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Linear progress — determinate or indeterminate neon bar. */
export function ProgressBar({
  value,
  className,
  label = "Progress",
}: {
  value?: number;
  className?: string;
  label?: string;
}) {
  const indeterminate = value == null;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
    >
      {indeterminate ? (
        <motion.span
          className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary via-accent to-violet shadow-glow-sm"
          animate={{ x: ["-100%", "320%"] }}
          transition={{
            duration: 1.3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ) : (
        <motion.span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-accent to-violet shadow-glow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </div>
  );
}
