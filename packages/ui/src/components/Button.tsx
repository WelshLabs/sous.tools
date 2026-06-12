import * as React from "react";

/**
 * Properties for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant style of the button.
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "outline" | "destructive";
  /**
   * Scale size of the button, providing large touch targets for active kitchen use.
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

/**
 * A highly interactive, premium Button component designed for high-glare tablet screens.
 * Supports tactile scaling animation on click/press and custom variants.
 *
 * @tenant-docs-export
 * # Button Component Guide
 * The `Button` component is designed for tactile usage in active kitchen spaces.
 * It features large touch targets and scaling CSS animations to indicate active pressed states.
 *
 * ## Usage Example:
 * ```tsx
 * import { Button } from '@soustools/ui';
 *
 * <Button variant="primary" size="lg" onClick={() => alert('Order status updated!')}>
 *   Complete Order
 * </Button>
 * ```
 *
 * ## Props:
 * - `variant`: "primary" | "secondary" | "outline" | "destructive" (default: "primary")
 * - `size`: "sm" | "md" | "lg" (default: "md")
 * - Accepts all standard HTML button attributes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 rounded-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline:
        "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg font-semibold min-h-[48px]", // Ensuring large touch target
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
