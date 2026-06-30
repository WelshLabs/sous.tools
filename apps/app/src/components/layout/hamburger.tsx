"use client";

import React from "react";

/**
 * Props for the Hamburger component.
 */
export interface HamburgerProps {
  /** Whether the hamburger icon is in the active/open state (showing an X). */
  isOpen: boolean;
  /** Callback to trigger on click. */
  onClick: () => void;
  /** Optional class name for the wrapper button. */
  className?: string;
}

/**
 * Hamburger component renders a button containing three lines that morph
 * into an 'X' using pure Tailwind transition properties when isOpen is true.
 *
 * @tenant-docs-export
 * The hamburger menu button toggles the navigation drawer on mobile and collapses
 * the sidebar on desktop screens.
 */
export function Hamburger({ isOpen, onClick, className = "" }: HamburgerProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-white focus:outline-none transition-colors ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <div className="relative w-6 h-5">
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${
            isOpen ? "rotate-45 top-2" : "top-0"
          }`}
        />
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out top-2 ${
            isOpen ? "opacity-0 scale-x-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-in-out ${
            isOpen ? "-rotate-45 top-2" : "top-4"
          }`}
        />
      </div>
    </button>
  );
}
