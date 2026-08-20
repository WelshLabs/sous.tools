"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ChefHat, ShoppingBag, Menu } from "lucide-react";

/**
 * A single navigation destination in the bottom navigation bar.
 */
export interface BottomNavItem {
  /** Visible label rendered below the icon. */
  label: string;
  /** Route href passed to Next.js `<Link>`. */
  href: string;
  /** Lucide icon component to render. */
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props for the BottomNav component.
 */
export interface BottomNavProps {
  /** Callback to open the "More" mobile drawer. */
  onToggleMobile: () => void;
  /**
   * The center logo/icon element rendered as the brand home button.
   * Pass the `<MicroIcon>` (or equivalent) from your logo package.
   */
  centerIcon?: React.ReactNode;
  /**
   * Navigation items to render on either side of the center icon.
   * Defaults to Dashboard, Recipes, Orders if omitted.
   */
  items?: BottomNavItem[];
}

const DEFAULT_ITEMS: BottomNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
];

/**
 * BottomNav — the mobile-only fixed bottom navigation bar.
 *
 * Sits at `--z-bottom-nav: 40` and uses the `.` glassmorphism
 * utility for the Neon-Glass aesthetic. Active route items are highlighted
 * with `--color-primary` (cyan #4cc9f0).
 *
 * Render this as a `"use client"` component inside `apps/app/layout.tsx`. Pass
 * `onToggleMobile` to wire the "More" button to your mobile sidebar toggle.
 *
 * @tenant-docs-export
 * # BottomNav
 * ```tsx
 * import { BottomNav } from "@soustools/design-system";
 *
 * <BottomNav
 *   onToggleMobile={toggleMobile}
 *   centerIcon={<MicroIcon className="w-12 h-12" style={{ color: "var(--color-primary)" }} />}
 * />
 * ```
 */
export function BottomNav({
  onToggleMobile,
  centerIcon,
  items = DEFAULT_ITEMS,
}: BottomNavProps) {
  const pathname = usePathname();

  // Split items around the center brand button
  const midpoint = Math.floor(items.length / 2);
  const leftItems = items.slice(0, midpoint);
  const rightItems = items.slice(midpoint);

  const navItemClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      [
        "flex flex-col items-center justify-center min-w-[64px] min-h-[64px]",
        "transition-transform active:scale-90 touch-manipulation",
        "text-xs font-medium gap-1",
      ].join(" ") +
      " " +
      (isActive ? "" : "")
    );
  };

  const navItemStyle = (href: string): React.CSSProperties => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return {
      color: isActive
        ? "var(--color-primary)"
        : "var(--color-muted-foreground)",
    };
  };

  return (
    <nav
      className="pb-safe fixed right-0 bottom-0 left-0 flex h-20 min-w-0 scrollbar-none flex-nowrap items-center justify-around overflow-x-auto px-2 select-none md:hidden"
      style={{
        zIndex: "var(--z-bottom-nav)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      {/* Left items */}
      {leftItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={navItemClass(item.href)}
            style={navItemStyle(item.href)}
          >
            <Icon className="h-6 w-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Center brand button */}
      {centerIcon && (
        <Link
          href="/"
          className="flex flex-shrink-0 touch-manipulation flex-col items-center justify-center rounded-full p-2 transition-transform active:scale-95"
          style={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 15px -3px rgb(76 201 240 / 0.20)", // neon-cyan shadow
          }}
        >
          {centerIcon}
        </Link>
      )}

      {/* Right items */}
      {rightItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={navItemClass(item.href)}
            style={navItemStyle(item.href)}
          >
            <Icon className="h-6 w-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* More button */}
      <button
        onClick={onToggleMobile}
        className="flex min-h-[64px] min-w-[64px] touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium transition-transform active:scale-90"
        style={{ color: "var(--color-muted-foreground)" }}
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
        <span>More</span>
      </button>
    </nav>
  );
}
