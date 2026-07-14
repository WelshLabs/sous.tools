"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  /** Optional element shown at the trailing edge (e.g. password toggle). */
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      icon,
      trailing,
      id,
      disabled,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(
      Boolean(value ?? defaultValue ?? ""),
    );
    const invalid = Boolean(error);
    const floating = focused || hasValue || Boolean(placeholder);

    return (
      <div className="flex w-full flex-col gap-1.5">
        <div
          className={cn(
            "group relative flex items-center rounded-[var(--radius-md)] border bg-[var(--ds-glass-fill)] px-3.5 shadow-[inset_0_1px_0_var(--ds-glass-highlight)] transition-[border-color,box-shadow,background-color] duration-[--ds-duration]",
            "h-14 backdrop-blur-xl",
            invalid
              ? "border-destructive"
              : focused
                ? "border-primary shadow-glow-sm"
                : "border-input hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))]",
            disabled && "pointer-events-none opacity-50",
            className,
          )}
        >
          {icon && (
            <span
              className={cn(
                "mr-2.5 inline-flex shrink-0 transition-colors duration-[--ds-duration]",
                focused ? "text-primary" : "text-muted-foreground",
              )}
            >
              {icon}
            </span>
          )}

          <div className="relative flex-1">
            {label && (
              <motion.label
                htmlFor={inputId}
                initial={false}
                animate={{
                  y: floating ? -10 : 0,
                  scale: floating ? 0.82 : 1,
                  color: invalid
                    ? "var(--destructive)"
                    : focused
                      ? "var(--primary)"
                      : "var(--muted-foreground)",
                }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute left-0 top-1/2 origin-left -translate-y-1/2 font-medium"
              >
                {label}
              </motion.label>
            )}
            <input
              ref={ref}
              id={inputId}
              disabled={disabled}
              value={value}
              defaultValue={defaultValue}
              placeholder={
                label
                  ? floating && focused
                    ? placeholder
                    : undefined
                  : placeholder
              }
              aria-invalid={invalid}
              className={cn(
                "w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground",
                label ? "pt-4 pb-0.5" : "py-2",
              )}
              onChange={(e) => {
                setHasValue(e.target.value.length > 0);
                onChange?.(e);
              }}
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                setHasValue(e.target.value.length > 0);
                onBlur?.(e);
              }}
              {...props}
            />
          </div>

          {trailing && (
            <span className="ml-2 inline-flex shrink-0 items-center">
              {trailing}
            </span>
          )}
        </div>

        <AnimatePresence initial={false} mode="wait">
          {(error || hint) && (
            <motion.p
              key={error ? "error" : "hint"}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className={cn(
                "px-1 text-xs",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {error ?? hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
Input.displayName = "Input";
