"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "ds-living-control ds-action-button ds-focus-ring group relative inline-flex min-h-10 select-none items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border font-medium tracking-tight outline-none disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        gradient:
          "border-primary/55 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_82%,var(--background)),var(--primary)_48%,color-mix(in_srgb,var(--violet)_70%,var(--primary)))] text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.22),inset_0_-1px_0_rgb(3_19_28/0.22),0_14px_32px_-18px_var(--primary)] hover:border-accent/70 hover:saturate-125 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_16px_38px_-15px_var(--primary)]",
        primary:
          "border-primary/55 bg-[linear-gradient(155deg,color-mix(in_srgb,var(--primary)_78%,white),var(--primary)_44%,color-mix(in_srgb,var(--primary)_78%,var(--background)))] text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.24),inset_0_-1px_0_rgb(3_19_28/0.2),0_13px_30px_-18px_var(--primary)] hover:border-accent/65 hover:saturate-125 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_16px_36px_-15px_var(--primary)]",
        secondary:
          "border-secondary bg-secondary/45 text-secondary-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_8px_22px_-18px_var(--primary)] backdrop-blur-xl hover:border-primary/35 hover:bg-secondary/65 hover:shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_0_22px_-12px_var(--primary)]",
        outline:
          "border-primary/55 bg-primary/[0.06] text-primary shadow-[inset_0_0_0_1px_rgb(var(--ds-neon-primary-rgb)/0.04)] backdrop-blur-md hover:border-primary/80 hover:bg-primary/[0.12] hover:shadow-[0_0_20px_-12px_var(--primary)]",
        glass:
          "border-[var(--ds-glass-border)] bg-[var(--ds-glass-fill)] text-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_10px_28px_-22px_var(--primary)] backdrop-blur-xl backdrop-saturate-150 hover:border-accent/45 hover:bg-[var(--ds-glass-fill-strong)] hover:shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_0_24px_-13px_var(--accent)]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground shadow-none hover:border-transparent hover:bg-primary/[0.08] hover:text-foreground",
        destructive:
          "border-destructive/80 bg-destructive/15 text-destructive shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_10px_26px_-20px_var(--destructive)] backdrop-blur-xl hover:bg-destructive/25 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_0_24px_-12px_var(--destructive)]",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends
    Omit<HTMLMotionProps<"button">, "ref" | "children">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const MotionSlot = motion.create(Slot);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, children, onClick, ...props },
    ref,
  ) => {
    const tone = variant ?? "primary";
    // #12 "Button Concept" — destructive click plays a progress sweep that
    // resolves into a success check before returning to rest.
    const [phase, setPhase] = React.useState<"idle" | "working" | "done">(
      "idle",
    );
    const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

    React.useEffect(
      () => () => {
        timers.current.forEach(clearTimeout);
      },
      [],
    );

    if (asChild) {
      return (
        <MotionSlot
          ref={ref as any}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.975, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(buttonVariants({ variant: tone, size }), className)}
          onClick={onClick}
          {...(props as any)}
        >
          {children}
        </MotionSlot>
      );
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (tone !== "destructive") {
        onClick?.(event);
        return;
      }

      if (phase !== "idle") return;

      onClick?.(event);
      setPhase("working");
      timers.current.push(setTimeout(() => setPhase("done"), 1100));
      timers.current.push(setTimeout(() => setPhase("idle"), 2400));
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.975, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          buttonVariants({ variant: tone, size }),
          tone === "destructive" && "ds-action-danger",
          className,
        )}
        onClick={handleClick}
        {...props}
      >
        {tone === "destructive" && phase === "working" && (
          <motion.span
            aria-hidden="true"
            className="bg-destructive/35 absolute inset-y-0 left-0 z-0"
            style={{ clipPath: "inset(0 round var(--radius-md))" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">
          {tone === "destructive" ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2"
              >
                {phase === "working" && "Deleting…"}
                {phase === "done" && (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Done
                  </>
                )}
                {phase === "idle" && children}
              </motion.span>
            </AnimatePresence>
          ) : (
            children
          )}
        </span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
