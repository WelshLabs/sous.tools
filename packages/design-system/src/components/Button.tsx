import * as React from "react";

/** Visual variant styles for the Button component. */
export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";

/** Size scale for the Button component. */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Props for the Button component.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant controlling background, border, and text treatment.
   * - `default`   — Neon-Glass cyan (#4cc9f0) filled primary action.
   * - `secondary` — Muted slate-700 surface for secondary actions.
   * - `outline`   — Transparent with cyan border; hover fills glass-card.
   * - `ghost`     — Fully transparent; hover reveals subtle surface.
   * @default "default"
   */
  variant?: ButtonVariant;
  /**
   * Scale size of the button. `lg` enforces a minimum 48 px touch target
   * for Kitchen Mode / gloved-hand usability.
   * @default "md"
   */
  size?: ButtonSize;
}

/**
 * Atomic Button component for the Neon-Glass design system.
 *
 * Provides tactile `active:scale-95` press feedback and a `focus-visible`
 * ring in the brand cyan. The `lg` size enforces Kitchen Mode touch targets.
 *
 * @tenant-docs-export
 * # Button
 * ```tsx
 * import { Button } from "@soustools/design-system";
 *
 * <Button variant="default" size="lg" onClick={handleSubmit}>
 *   Submit Order
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "default",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base = [
      "inline-flex items-center justify-center gap-2",
      "font-sans font-semibold rounded-lg",
      "transition-all duration-150 ease-in-out",
      "active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none select-none",
    ].join(" ");

    const variantStyles: Record<ButtonVariant, string> = {
      default: [
        "text-[#0f172a]",           // --color-primary-foreground
        "shadow-md",
      ].join(" "),
      secondary: [
        "text-[#f8fafc]",           // --color-secondary-foreground
      ].join(" "),
      outline: [
        "bg-transparent",
        "text-[#4cc9f0]",           // primary cyan text when outlined
        "border border-[#4cc9f0]",
      ].join(" "),
      ghost: [
        "bg-transparent",
        "text-[#f8fafc]",
      ].join(" "),
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg min-h-[48px]",  // Kitchen Mode touch target
    };

    // Inline styles for semantic token values (avoids Tailwind purge issues
    // with dynamic CSS variable references in a library context)
    const variantInlineStyle: Record<ButtonVariant, React.CSSProperties> = {
      default: {
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-foreground)",
      },
      secondary: {
        backgroundColor: "var(--color-secondary)",
        color: "var(--color-secondary-foreground)",
      },
      outline: {
        backgroundColor: "transparent",
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "var(--color-foreground)",
      },
    };

    const focusRingStyle: React.CSSProperties = {
      // --tw-ring-color maps to --color-ring in the @theme
      outlineColor: "var(--color-ring)",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        style={{ ...variantInlineStyle[variant], ...focusRingStyle }}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
