"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const chipVariants = cva(
  "ds-living-control ds-focus-ring group relative inline-flex select-none items-center gap-2 rounded-full border font-medium outline-none backdrop-blur-xl",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-3.5 text-sm",
        lg: "h-11 px-4 text-sm",
      },
      selected: {
        true: "border-primary/50 bg-[linear-gradient(115deg,rgb(var(--ds-neon-primary-rgb)/0.2),rgb(var(--ds-neon-accent-rgb)/0.08))] text-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_10px_24px_-18px_var(--primary)]",
        false:
          "border-[var(--ds-glass-border)] bg-[var(--ds-glass-fill)] text-muted-foreground shadow-[inset_0_1px_0_var(--ds-glass-highlight)] hover:border-primary/35 hover:bg-[var(--ds-glass-fill-strong)] hover:text-foreground",
      },
    },
    defaultVariants: { size: "md", selected: false },
  },
);

export interface ChipProps
  extends
    Omit<React.HTMLAttributes<HTMLButtonElement>, "onSelect">,
    VariantProps<typeof chipVariants> {
  selected?: boolean;
  icon?: React.ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      size,
      selected = false,
      icon,
      onRemove,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(
        chipVariants({ size, selected }),
        disabled && "pointer-events-none opacity-45",
        className,
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {icon ? (
        <span className={selected ? "text-primary" : "text-muted-foreground"}>
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:bg-muted hover:text-foreground -mr-1 rounded p-0.5"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </motion.button>
  ),
);
Chip.displayName = "Chip";
