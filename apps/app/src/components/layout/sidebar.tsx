/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { Sidebar } from "@soustools/design-system";
 *
 * NOTE: Data-fetching and config lookups have been extracted from this component.
 * Wire the props in your layout's controller layer:
 *   - navItems={navItems}          — build from BASE_NAV_ITEMS + role/env filter
 *   - expandedLogo={<PrimaryLogo />}
 *   - collapsedIcon={<MicroIcon />}
 *   - isAdmin={userIsAdmin}        — result of supabase role check
 */
export { Sidebar } from "@soustools/design-system";
export type { SidebarProps, SidebarNavItem } from "@soustools/design-system";
// Default export alias for legacy callers
export { Sidebar as default } from "@soustools/design-system";
