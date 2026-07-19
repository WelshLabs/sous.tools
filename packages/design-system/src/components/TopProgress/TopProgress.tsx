"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";

/**
 * Sticky top-of-viewport progress bar that trickles forward while `active`
 * and snaps to 100% then fades out when deactivated.
 *
 * Split from Loader.tsx to satisfy the 200-line architectural limit.
 */
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
      }, [active, visible]);

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
