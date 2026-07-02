import * as React from "react";

/**
 * Props for the Label component.
 */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * When true, renders a required asterisk (`*`) in the destructive color
   * after the label text to indicate a mandatory field.
   */
  required?: boolean;
}

/**
 * Atomic Label component for the Neon-Glass design system.
 *
 * Renders a `<label>` with consistent typography:
 * - `text-sm font-medium` — compact, professional weight
 * - `leading-none` — tight vertical alignment with adjacent form fields
 * - Color: `--color-foreground` (slate-50 in dark)
 * - Disabled peer state: `opacity-70 cursor-not-allowed`
 *
 * Pair with an `Input`, `Select`, or other form element using the `htmlFor`
 * prop to ensure accessible label association.
 *
 * @tenant-docs-export
 * # Label
 * ```tsx
 * import { Label, Input } from "@soustools/design-system";
 *
 * <div className="flex flex-col gap-1.5">
 *   <Label htmlFor="qty" required>Quantity (g)</Label>
 *   <Input id="qty" type="number" min={0} />
 * </div>
 * ```
 */
export function Label({
  className = "",
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={[
        "text-sm font-medium leading-none",
        "peer-disabled:opacity-70 peer-disabled:cursor-not-allowed",
        "select-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ color: "var(--color-foreground)" }}
      {...props}
    >
      {children}
      {required && (
        <span
          aria-hidden="true"
          className="ml-0.5"
          style={{ color: "var(--color-destructive)" }}
        >
          *
        </span>
      )}
    </label>
  );
}
