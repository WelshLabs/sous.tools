"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
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
          "border-[var(--ds-glass-border)] bg-secondary/55 text-secondary-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight)] backdrop-blur-xl hover:border-primary/40 hover:bg-secondary/80",
        outline:
          "border-border/75 bg-card/25 text-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight)] backdrop-blur-xl hover:border-primary/45 hover:bg-card/55",
        glass:
          "border-[var(--ds-glass-border)] bg-[var(--ds-glass-fill)] text-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight)] backdrop-blur-xl hover:border-primary/45 hover:bg-[var(--ds-glass-fill-strong)]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:border-primary/15 hover:bg-primary/[0.07] hover:text-foreground",
        destructive:
          "border-destructive/55 bg-destructive/90 text-destructive-foreground shadow-[0_10px_26px_-18px_var(--destructive)] hover:bg-destructive",
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
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const tone = variant ?? "primary";

    if (asChild) {
      return (
        <MotionSlot
          ref={ref as any}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.975, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(buttonVariants({ variant: tone, size }), className)}

          {...(props as any)}
        >
          {children}
        </MotionSlot>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.975, y: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(buttonVariants({ variant: tone, size }), className)}
        {...props}
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
