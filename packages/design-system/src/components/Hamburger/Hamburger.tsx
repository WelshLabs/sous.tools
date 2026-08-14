"use client";

/**
 * Props for the Hamburger component.
 */
export interface HamburgerProps {
  /** Whether the hamburger icon is in the active/open state (showing an X). */
  isOpen: boolean;
  /** Callback triggered on click. */
  onClick: () => void;
  /** Optional additional className applied to the wrapper button. */
  className?: string;
}

/**
 * Hamburger — an animated menu toggle button for the Neon-Glass design system.
 *
 * Renders three horizontal lines that morph into an "×" using pure CSS
 * transitions when `isOpen` is true. The icon color maps to
 * `--color-muted-foreground` at rest and `--color-foreground` on hover,
 * matching the overall sidebar/app-bar icon treatment.
 *
 * @tenant-docs-export
 * # Hamburger
 * ```tsx
 * import { Hamburger } from "@soustools/design-system";
 *
 * <Hamburger isOpen={isMobileOpen} onClick={toggleMobile} />
 * ```
 */
export function Hamburger({ isOpen, onClick, className = "" }: HamburgerProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none ${className}`}
      style={{
        color: "var(--color-muted-foreground)",
        // ring color on focus-visible
        ["--tw-ring-color" as string]: "var(--color-ring)",
      }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative h-5 w-6">
        {/* Top bar — rotates to 45° when open */}
        <span
          className={`absolute block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${isOpen ? "top-2 rotate-45" : "top-0"}`}
        />
        {/* Middle bar — fades + collapses when open */}
        <span
          className={`absolute top-2 block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${isOpen ? "scale-x-0 opacity-0" : "opacity-100"}`}
        />
        {/* Bottom bar — rotates to -45° when open */}
        <span
          className={`absolute block h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out ${isOpen ? "top-2 -rotate-45" : "top-4"}`}
        />
      </div>
    </button>
  );
}
