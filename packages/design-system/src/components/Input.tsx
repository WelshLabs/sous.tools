import * as React from "react";

/**
 * Props for the Input component.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional error state — applies a destructive ring and border color
   * to signal validation failure without an additional wrapper.
   */
  hasError?: boolean;
}

/**
 * Atomic Input component for the Neon-Glass design system.
 *
 * Renders a single-line text input with semantic token styling:
 * - Background: `--color-input` (zinc-900 in dark)
 * - Border: `--color-border` (zinc-800 in dark)
 * - Focus ring: `--color-ring` (cyan #4cc9f0)
 * - Error state: `--color-destructive` (rose-500 #f43f5e)
 *
 * Accepts all standard `<input>` attributes including `type`, `value`,
 * `onChange`, `disabled`, `placeholder`, and `aria-*`.
 *
 * @tenant-docs-export
 * # Input
 * ```tsx
 * import { Input } from "@soustools/design-system";
 *
 * <Input
 *   type="text"
 *   placeholder="Enter ingredient name…"
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", hasError = false, disabled, ...props }, ref) => {
    const borderColor = hasError
      ? "var(--color-destructive)"
      : "var(--color-border)";

    const focusRingColor = hasError
      ? "var(--color-destructive)"
      : "var(--color-ring)";

    return (
      <input
        ref={ref}
        disabled={disabled}
        className={[
          "flex w-full rounded-md px-3 py-2",
          "text-sm font-sans",
          "transition-colors duration-150",
          "placeholder:text-[color:var(--color-muted-foreground)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Kitchen Mode: ensure comfortable touch height
          "min-h-[40px]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          backgroundColor: "var(--color-input)",
          color: "var(--color-foreground)",
          border: `1px solid ${borderColor}`,
          // ring-color override — Tailwind v4 uses CSS variable
          "--tw-ring-color": focusRingColor,
        } as React.CSSProperties}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
