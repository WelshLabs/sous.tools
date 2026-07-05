"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * ThemeToggle — a ghost-style icon button that cycles through light → dark →
 * system themes.
 *
 * Uses `next-themes`' `useTheme` hook and mounts safely with a hydration guard
 * (renders an invisible placeholder before the client is mounted to prevent
 * server/client divergence).
 *
 * Color intent maps to the Neon-Glass semantic tokens:
 * - Rest:  `--color-muted-foreground` (zinc-400)
 * - Hover: `--color-foreground`       (zinc-50)
 * - Hover background: `--color-card`  (zinc-900) @ 50%
 *
 * @tenant-docs-export
 * # ThemeToggle
 * ```tsx
 * import { ThemeToggle } from "@soustools/design-system";
 *
 * // Drops into any AppBar or settings panel
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Hydration guard — renders a stable same-size placeholder on SSR
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Identical dimensions to the real button to prevent layout shift
    return <div className="w-9 h-9 flex-shrink-0" aria-hidden="true" />;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const themeLabel =
    theme === "system"
      ? "System Default"
      : theme === "dark"
        ? "Dark Mode"
        : "Light Mode";

  return (
    <button
      onClick={cycleTheme}
      className="w-9 h-9 flex items-center justify-center rounded-full
        transition-colors duration-150 focus-visible:outline-none
        focus-visible:ring-2 cursor-pointer"
      title={`Theme: ${themeLabel}`}
      aria-label={`Toggle theme (currently ${themeLabel})`}
      style={{
        color: "var(--color-muted-foreground)",
        ["--tw-ring-color" as string]: "var(--color-ring)",
      }}
    >
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
