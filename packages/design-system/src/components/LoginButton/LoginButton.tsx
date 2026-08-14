"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Spinner } from "../Loader/Loader";
import { cn } from "../../utils/cn";

export type LoginState = "idle" | "loading" | "success" | "error";

const content: Record<LoginState, { label: string; icon: React.ReactNode }> = {
  idle: { label: "Sign in", icon: <ArrowRight className="h-4 w-4" /> },
  loading: {
    label: "Signing in…",
    icon: <Spinner size="sm" className="[&>span]:h-5 [&>span]:w-5" />,
  },
  success: {
    label: "Welcome back",
    icon: <Check className="h-4 w-4" strokeWidth={3} />,
  },
  error: {
    label: "Try again",
    icon: <X className="h-4 w-4" strokeWidth={3} />,
  },
};

export function LoginButton({
  state = "idle",
  onClick,
  type = "submit",
  className,
}: {
  state?: LoginState;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const isBusy = state === "loading";
  const { label, icon } = content[state];

  const bg =
    state === "success"
      ? "bg-success text-success-foreground"
      : state === "error"
        ? "bg-destructive text-destructive-foreground"
        : "text-primary-foreground bg-[linear-gradient(120deg,var(--primary),color-mix(in_srgb,var(--primary)_55%,var(--violet)))]";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isBusy}
      whileTap={{ scale: isBusy ? 1 : 0.98 }}
      animate={state === "error" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "shadow-glow-sm hover:shadow-glow focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-[background-color,box-shadow] duration-[--ds-duration] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-progress",
        bg,
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.9 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2"
        >
          {icon}
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
