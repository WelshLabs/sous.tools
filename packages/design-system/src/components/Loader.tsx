"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { AnimatedLettermark } from "./logos/Logo";
import { cn } from "../utils/cn";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

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

export function TopProgress({
  active,
  absolute = false,
  className,
}: {
  active: boolean;
  absolute?: boolean;
  className?: string;
}) {
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const trickle = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const done = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const clearTrickle = () => {
      if (trickle.current) clearInterval(trickle.current);
      trickle.current = null;
    };

    if (active) {
      if (done.current) clearTimeout(done.current);
      setVisible(true);
      setProgress((p) => (p < 8 ? 8 : p));
      clearTrickle();
      trickle.current = setInterval(() => {
        // Ease-out trickle: big early jumps, crawl near the top, cap at 90%.
        setProgress((p) =>
          p >= 90
            ? p
            : Math.min(90, p + (100 - p) * 0.08 + Math.random() * 1.5),
        );
      }, 380);
    } else if (visible) {
      clearTrickle();
      setProgress(100);
      done.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 420);
    }

    return clearTrickle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="progressbar"
          aria-label="Page loading"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            "left-0 top-0 z-[100] h-[3px] w-full",
            absolute ? "absolute" : "fixed",
            className,
          )}
        >
          <motion.div
            className="relative h-full ds-gradient-pan"
            style={{ boxShadow: "var(--ds-glow-md)", filter: "blur(0.35px)" }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
          >
            {/* Leading peg glow */}
            <span
              aria-hidden="true"
              className="absolute right-0 top-1/2 h-2 w-24 -translate-y-1/2 translate-x-1/3 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent))",
                filter: "blur(4px)",
                opacity: 0.9,
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
