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
      className={`relative w-10 h-10 flex items-center justify-center
        transition-colors duration-150 focus-visible:outline-none
        focus-visible:ring-2 rounded-md ${className}`}
      style={{
        color: "var(--color-muted-foreground)",
        // ring color on focus-visible
        ["--tw-ring-color" as string]: "var(--color-ring)",
      }}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="relative w-6 h-5">
        {/* Top bar — rotates to 45° when open */}
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full
            transition-all duration-300 ease-in-out
            ${isOpen ? "rotate-45 top-2" : "top-0"}`}
        />
        {/* Middle bar — fades + collapses when open */}
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full
            transition-all duration-300 ease-in-out top-2
            ${isOpen ? "opacity-0 scale-x-0" : "opacity-100"}`}
        />
        {/* Bottom bar — rotates to -45° when open */}
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full
            transition-all duration-300 ease-in-out
            ${isOpen ? "-rotate-45 top-2" : "top-4"}`}
        />
      </div>
    </button>
  );
}
