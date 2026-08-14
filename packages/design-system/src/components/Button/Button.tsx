"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "group relative inline-flex min-h-10 select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[var(--radius-md)] border font-medium tracking-tight outline-none transition-[color,background-color,border-color,box-shadow] duration-[--ds-duration] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        gradient:
          "border-primary/70 bg-[linear-gradient(135deg,var(--primary),color-mix(in_srgb,var(--primary)_76%,var(--accent)))] text-primary-foreground shadow-[0_10px_26px_-18px_var(--primary)] hover:border-primary hover:brightness-110",
        primary:
          "border-primary/65 bg-primary text-primary-foreground shadow-[0_10px_26px_-18px_var(--primary)] hover:border-primary hover:bg-[color-mix(in_srgb,var(--primary)_90%,white)]",
        secondary:
          "border-border/80 bg-secondary/70 text-secondary-foreground backdrop-blur-xl hover:border-primary/30 hover:bg-secondary",
        outline:
          "border-border/80 bg-card/35 text-foreground backdrop-blur-xl hover:border-primary/40 hover:bg-card/65",
        glass:
          "border-[var(--ds-glass-border)] bg-[var(--ds-glass-fill)] text-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight)] backdrop-blur-xl hover:border-primary/35 hover:bg-[var(--ds-glass-fill-strong)]",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-card/55 hover:text-foreground",
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.975, y: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(buttonVariants({ variant: tone, size }), className)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
