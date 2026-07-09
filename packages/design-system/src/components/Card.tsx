import * as React from "react";

/* ─── Card ─────────────────────────────────────────────────────────────────── */

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Root container for the Neon-Glass Card component.
 *
 * Renders a `glass-card` surface — `bg-card backdrop-blur-md border
 * border-border` — consistent with the v2 glassmorphism aesthetic.
 * Compose with `CardHeader`, `CardTitle`, `CardContent`, and `CardFooter`.
 *
 * @tenant-docs-export
 * # Card
 * ```tsx
 * import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@soustools/design-system";
 *
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Daily Revenue</CardTitle>
 *   </CardHeader>
 *   <CardContent>$4,320.00</CardContent>
 *   <CardFooter>Updated 2 min ago</CardFooter>
 * </Card>
 * ```
 */
export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-card/90 backdrop-blur-2xl border border-border text-card-foreground rounded-3xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── CardHeader ───────────────────────────────────────────────────────────── */

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Header region of a Card. Provides consistent padding and a bottom border
 * separator to visually anchor the card title.
 */
export function CardHeader({
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 px-6 py-5 ${className}`}
      style={{ borderBottom: "1px solid var(--color-border)" }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── CardTitle ────────────────────────────────────────────────────────────── */

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

/**
 * Title element within a CardHeader. Renders as `<h3>` with bold tight
 * tracking — consistent with the Industrial Minimal brand voice.
 */
export function CardTitle({
  className = "",
  children,
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={`text-lg font-bold tracking-tight leading-none ${className}`}
      style={{ color: "var(--color-card-foreground)" }}
      {...props}
    >
      {children}
    </h3>
  );
}

/* ─── CardContent ──────────────────────────────────────────────────────────── */

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Main content area of a Card. Provides standard padding and removes top
 * padding when immediately following a `CardHeader`.
 */
export function CardContent({
  className = "",
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ─── CardFooter ───────────────────────────────────────────────────────────── */

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Footer region of a Card. Flex-row layout for action buttons or metadata.
 * Provides a top border separator.
 */
export function CardFooter({
  className = "",
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`flex items-center px-6 py-4 ${className}`}
      style={{ borderTop: "1px solid var(--color-border)" }}
      {...props}
    >
      {children}
    </div>
  );
}
