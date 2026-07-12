/**
 * @soustools/design-system
 *
 * The canonical Neon-Glass design system for sous.tools.
 * This package is the sole UI authority for all @soustools/ workspace consumers.
 *
 * Visual identity sourced from v2-snapshot.md (sous-theme.kdl):
 *   Primary cyan:  #4cc9f0
 *   Background:    #0f172a (zinc-950)
 *   Card surface:  #1e293b (zinc-900)
 *   Neon pink:     #f72585
 *   Destructive:   #f43f5e
 *
 * @see packages/design-system/index.css — Tailwind v4 @theme token dictionary
 */

// ── Atomic Components ──────────────────────────────────────────────────────
export { TwoToneHeader } from "./components/TwoToneHeader";
export type { TwoToneHeaderProps } from "./components/TwoToneHeader";

export { Button } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export { PinInput } from "./components/PinInput";
export type { PinInputProps } from "./components/PinInput";

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/Card";
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
} from "./components/Card";

export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";

export { Label } from "./components/Label";
export type { LabelProps } from "./components/Label";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./components/Table";

// ── Layout & UI Components (Phase 2 Migration) ─────────────────────────────
export { ConfirmModal } from "./components/ConfirmModal";
export type { ConfirmModalProps } from "./components/ConfirmModal";

export { Hamburger } from "./components/Hamburger";
export type { HamburgerProps } from "./components/Hamburger";

export { ThemeToggle } from "./components/ThemeToggle";

export { BottomNav } from "./components/BottomNav";
export type { BottomNavProps, BottomNavItem } from "./components/BottomNav";

export { AppBar } from "./components/AppBar";
export type { AppBarProps, AppBarNotification } from "./components/AppBar";

export { Sidebar } from "./components/Sidebar";
export type { SidebarProps, SidebarNavItem } from "./components/Sidebar";

export { SidebarLayout } from "./components/SidebarLayout";
export type { SidebarLayoutProps } from "./components/SidebarLayout";

export { useSidebarStore } from "./store/sidebarStore";

export { OmniBar, OmniBarProvider, OmniBarPresentation, FloatingOmniTrigger, useOmnibarContext, AttachmentFlyout, VerificationPanel, CreatableSelect, UnifiedReviewPanel } from "./components/OmniBar";
export type { OmniBarPresentationProps, AttachmentFlyoutProps, StagedFile, VerificationPanelProps, CreatableSelectProps, CreatableSelectOption, UnifiedReviewPanelProps } from "./components/OmniBar";

export { GlobalAppBar, GlobalAppBarPresentation } from "./components/GlobalAppBar";
export type { GlobalAppBarPresentationProps } from "./components/GlobalAppBar";

export { InsightsSidebar } from "./components/InsightsSidebar";
export { QuickAddBar, inferVendorForItem } from "./components/QuickAddBar";
export type { QuickAddSuggestion } from "./components/QuickAddBar";
export { SupplierOrderGroup, EmptyOrderList } from "./components/SupplierOrderGroup";
export type { OrderLineItem, OrderSupplier } from "./components/SupplierOrderGroup";

export { calculateRecipeScale } from "./utils/scaling";
export type { ScaledIngredientResult } from "./utils/scaling";

export { PrimaryLogo } from "./components/logos/PrimaryLogo";
export { MicroIcon } from "./components/logos/MicroIcon";
export { Lettermark } from "./components/logos/Lettermark";
export { RevenueChart, TicketTimeChart } from "./components/DashboardCharts";
export type { RevenueData, TicketTimeData } from "./components/DashboardCharts";
