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
export { TwoToneHeader } from "./components/TwoToneHeader/TwoToneHeader";
export type { TwoToneHeaderProps } from "./components/TwoToneHeader/TwoToneHeader";

export { Button } from "./components/Button/Button";
export type { ButtonProps, buttonVariants } from "./components/Button/Button";

export { PinInput } from "./components/PinInput/PinInput";
export type { PinInputProps } from "./components/PinInput/PinInput";

export {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/Card/Card";

export { Input } from "./components/Input/Input";
export type { InputProps } from "./components/Input/Input";

export { Label } from "./components/Label/Label";
export type { LabelProps } from "./components/Label/Label";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./components/Table/Table";

// ── Layout & UI Components (Phase 2 Migration) ─────────────────────────────
export { ConfirmModal } from "./components/ConfirmModal/ConfirmModal";
export type { ConfirmModalProps } from "./components/ConfirmModal/ConfirmModal";

export { Hamburger } from "./components/Hamburger/Hamburger";
export type { HamburgerProps } from "./components/Hamburger/Hamburger";

export { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";

export { BottomNav } from "./components/BottomNav/BottomNav";
export type {
  BottomNavProps,
  BottomNavItem,
} from "./components/BottomNav/BottomNav";

export { Sidebar } from "./components/Sidebar/Sidebar";
export type {
  SidebarProps,
  SidebarNavItem,
} from "./components/Sidebar/Sidebar";

export { SidebarLayout } from "./components/Sidebar/SidebarLayout";
export type { SidebarLayoutProps } from "./components/Sidebar/SidebarLayout";

export { useSidebarStore } from "./store/sidebarStore";

export {
  OmniBar,
  OmniBarProvider,
  OmniBarPresentation,
  FloatingOmniTrigger,
  OmniButton,
  useOmnibarContext,
  AttachmentFlyout,
  VerificationPanel,
  CreatableSelect,
  UnifiedReviewPanel,
  OmnibarPerimeterView,
  ChatMessageBubble,
  ProcessingBubble,
  EmptyStateBubble,
  OmniTranscriptTimeline,
} from "./components/OmniBar";
export type {
  OmniBarPresentationProps,
  OmniButtonProps,
  AttachmentFlyoutProps,
  StagedFile,
  VerificationPanelProps,
  CreatableSelectProps,
  CreatableSelectOption,
  UnifiedReviewPanelProps,
  ChatMessageBubbleProps,
  ProcessingBubbleProps,
  EmptyStateBubbleProps,
  OmniTranscriptTimelineProps,
} from "./components/OmniBar";

export {
  AppBar,
  AppBarPresentation,
  WaffleMenuDropdown,
} from "./components/AppBar";
export type {
  AppBarProps,
  AppBarPresentationProps,
  AppBarNotification,
} from "./components/AppBar";

export { InsightsSidebar } from "./components/InsightsSidebar/InsightsSidebar";
export type { InsightsSidebarProps } from "./components/InsightsSidebar/InsightsSidebar";
export type { OrderSupplier, OrderLineItem } from "./types/order-types";

export {
  QuickAddBar,
  inferVendorForItem,
} from "./components/QuickAddBar/QuickAddBar";
export type { QuickAddSuggestion } from "./components/QuickAddBar/QuickAddBar";

export {
  resetFaviconStatus,
  setFaviconStatus,
  type FaviconStatus,
} from "./utils/favicon-status";

export { Chip, type ChipProps } from "./components/Chip/Chip";

// export { PrimaryLogo } from "./components/logos/PrimaryLogo";
// export { MicroIcon } from "./components/logos/MicroIcon";
// export { Lettermark } from "./components/logos/Lettermark";
export { PrimaryLogo, MicroIcon, Lettermark } from "./components/Logos/Logo";
export {
  RevenueChart,
  TicketTimeChart,
} from "./components/DashboardCharts/DashboardCharts";
export type {
  RevenueData,
  TicketTimeData,
} from "./components/DashboardCharts/DashboardCharts";

export { AuroraBackground } from "./components/AuroraBackground/AuroraBackground";

export { cn } from "./utils/cn";

export {
  BrandLoader,
  Spinner,
  DotsLoader,
  ProgressBar,
  TopProgress,
} from "./components/Loader/Loader";
export { GoogleIcon, GitHubIcon } from "./components/BrandIcons/BrandIcons";
export {
  LoginButton,
  type LoginState,
} from "./components/LoginButton/LoginButton";

export * from "./components/Showcase";
