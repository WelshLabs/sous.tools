/**
 * @deprecated Relocated to @soustools/design-system.
 * Update your import to:
 *   import { AppBar } from "@soustools/design-system";
 *
 * NOTE: Data-fetching (notifications, Supabase auth) has been extracted from
 * this component. Wire the props in your layout's controller layer:
 *   - notifications={notifications}
 *   - onNotificationClick={handleNotifClick}
 *   - onMarkAllRead={markAllRead}
 *   - onLogout={handleLogout}
 */
export { AppBar } from "@soustools/design-system";
export type { AppBarProps, AppBarNotification } from "@soustools/design-system";
// Default export alias for legacy callers
export { AppBar as default } from "@soustools/design-system";
