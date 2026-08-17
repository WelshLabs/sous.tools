import * as React from "react";
import { cn } from "../../utils/cn";

export function Card({
  className,
  glass = true,
  glow = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { glass?: boolean; glow?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] p-6",
        glass ? "ds-living-surface" : "border-border bg-card border",
        glow &&
          "shadow-glow-sm shadow-[inset_0_1px_0_var(--ds-glass-highlight),0_18px_44px_-24px_rgb(var(--ds-neon-primary-rgb)/0.8),0_0_28px_-18px_rgb(var(--ds-neon-accent-rgb)/0.65)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex flex-col gap-1.5", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-foreground text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-5 flex items-center gap-3", className)} {...props} />
  );
}
