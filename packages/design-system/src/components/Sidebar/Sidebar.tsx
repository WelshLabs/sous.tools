"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users } from "lucide-react";
import { Hamburger } from "../Hamburger/Hamburger";

/**
 * A single navigation item in the sidebar.
 */
export interface SidebarNavItem {
  /** Human-readable label. */
  label: string;
  /** Route href. External URLs (starting with "http") open in a new tab. */
  href: string;
  /** Lucide icon component. */
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Props for the Sidebar component.
 */
export interface SidebarProps {
  /** Whether the mobile drawer is currently translated into view. */
  isMobileOpen: boolean;
  /** Whether the desktop sidebar is collapsed to icon-only width. */
  isDesktopCollapsed: boolean;
  /** Close the mobile drawer (e.g. after a navigation click). */
  onCloseMobile: () => void;
  /** Toggle the desktop sidebar between collapsed and expanded. */
  onToggleDesktop: () => void;
  /**
   * Navigation items to render. The app layer owns this list so it can be
   * filtered by role/env without coupling the design-system to config.
   */
  navItems: SidebarNavItem[];
  /**
   * Logo shown when the sidebar is expanded. Pass the `<PrimaryLogo>` component.
   */
  expandedLogo?: any;
  /**
   * Icon shown when the sidebar is collapsed. Pass the `<MicroIcon>` component.
   */
  collapsedIcon?: any;
  /**
   * When true, renders an "Admin" section separator and a "Users Admin" link.
   * The role-check logic lives in the app layer; pass the result as a boolean.
   */
  isAdmin?: boolean;
}

/**
 * Sidebar — the primary navigation shell for the Neon-Glass design system.
 *
 * Sits at `--z-sidebar: 50`. Uses `--color-card` as the base surface with a
 * `--color-border` right edge. Active routes receive `--color-primary`
 * (cyan #4cc9f0) text + a primary/10 background tint.
 *
 * **Data boundary**: Role checks, Supabase auth, and config lookups MUST live
 * in the `apps/app` controller layer. Pass `isAdmin` and `navItems` as props.
 *
 * @tenant-docs-export
 * # Sidebar
 * ```tsx
 * import { Sidebar } from "@soustools/design-system";
 *
 * <Sidebar
 *   isMobileOpen={isMobileOpen}
 *   isDesktopCollapsed={isCollapsed}
 *   onCloseMobile={closeMobile}
 *   onToggleDesktop={toggleDesktop}
 *   navItems={navItems}
 *   expandedLogo={<PrimaryLogo className="h-10 w-auto" />}
 *   collapsedIcon={<MicroIcon className="w-8 h-8" />}
 *   isAdmin={userIsAdmin}
 * />
 * ```
 */
export function Sidebar({
  isMobileOpen,
  isDesktopCollapsed,
  onCloseMobile,
  onToggleDesktop,
  navItems,
  expandedLogo,
  collapsedIcon,
  isAdmin = false,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href.startsWith("http")
      ? false
      : href === "/"
        ? pathname === "/"
        : pathname.startsWith(href);

  const navLinkStyle = (href: string): React.CSSProperties => ({
    color: isActive(href)
      ? "var(--color-primary)"
      : "var(--color-muted-foreground)",
    backgroundColor: isActive(href) ? "rgb(76 201 240 / 0.08)" : "transparent",
  });

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 transition-opacity md:hidden"
          style={{
            zIndex: "calc(var(--z-sidebar) - 10)",
            backgroundColor: "rgb(0 0 0 / 0.50)",
          }}
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`border-border bg-card fixed top-16 left-0 flex h-[calc(100vh-64px)] w-64 flex-col border-r transition-all duration-300 ease-in-out md:w-16 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${isDesktopCollapsed ? "md:w-16" : "md:w-16 lg:w-16 xl:w-64"}`}
        style={{ zIndex: "var(--z-sidebar)" }}
      >
        {/* Header — logo + hamburger */}
        <div
          className={`flex h-16 items-center justify-between px-4 transition-all ${isDesktopCollapsed ? "md:justify-center md:px-0" : ""}`}
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {/* Logo / icon */}
          <div
            className={`flex items-center gap-2 transition-all ${
              isDesktopCollapsed ? "cursor-pointer" : ""
            }`}
            onClick={isDesktopCollapsed ? onToggleDesktop : undefined}
            style={{ color: "var(--color-primary)" }}
          >
            {isDesktopCollapsed ? collapsedIcon : expandedLogo}
          </div>

          {/* Mobile close hamburger */}
          <Hamburger
            isOpen={isMobileOpen}
            onClick={onCloseMobile}
            className="md:hidden"
          />

          {/* Desktop collapse hamburger (only visible when expanded) */}
          {!isDesktopCollapsed && (
            <Hamburger
              isOpen={true}
              onClick={onToggleDesktop}
              className="hidden md:flex"
            />
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const external = item.href.startsWith("http");

            const sharedClassName = `flex items-center gap-3 p-3 rounded-lg
              transition-colors group`;

            const label = (
              <>
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-200 md:hidden lg:hidden xl:block ${isDesktopCollapsed ? "xl:hidden" : "xl:block"}`}
                >
                  {item.label}
                </span>
              </>
            );

            return external ? (
              <a
                key={item.href}
                href={item.href}
                className={sharedClassName}
                style={navLinkStyle(item.href)}
                onClick={onCloseMobile}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={sharedClassName}
                style={navLinkStyle(item.href)}
                onClick={onCloseMobile}
              >
                {label}
              </Link>
            );
          })}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div
                className="my-2"
                style={{ borderTop: "1px solid var(--color-border)" }}
              />
              <Link
                href="/admin/users"
                className="group flex items-center gap-3 rounded-lg p-3 transition-colors"
                style={navLinkStyle("/admin/users")}
                onClick={onCloseMobile}
              >
                <Users className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-200 md:hidden lg:hidden xl:block ${isDesktopCollapsed ? "xl:hidden" : "xl:block"}`}
                >
                  Users Admin
                </span>
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
