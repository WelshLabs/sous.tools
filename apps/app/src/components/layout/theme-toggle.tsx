"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 flex-shrink-0" />;
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

  const currentThemeLabel = theme === "system" ? "System Default" : theme === "dark" ? "Dark Mode" : "Light Mode";

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full hover:bg-zinc-800/10 dark:hover:bg-black/5 dark:bg-white/5 transition-colors focus:outline-none cursor-pointer text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center"
      title={`Theme: ${currentThemeLabel}`}
      aria-label={`Toggle theme (currently ${currentThemeLabel})`}
    >
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
