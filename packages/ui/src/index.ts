/**
 * Entrypoint for the shared @soustools/ui package.
 * Exports theme tokens, utilities, and all shared components.
 */

export * from "./theme";
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
export * from "./components/logos";
export * from "./utils/scaling";

// ── Procurement / Order Manager components ─────────────────────────────────
export { TwoToneHeader } from "./components/TwoToneHeader";
export type { TwoToneHeaderProps } from "./components/TwoToneHeader";

export { QuickAddBar, inferVendorForItem } from "./components/QuickAddBar";
export type {
  QuickAddBarProps,
  QuickAddSuggestion,
} from "./components/QuickAddBar";

export {
  SupplierOrderGroup,
  OrderItemRow,
  EmptyOrderList,
} from "./components/SupplierOrderGroup";
export type {
  SupplierOrderGroupProps,
  OrderItemRowProps,
  OrderSupplier,
  OrderLineItem,
} from "./components/SupplierOrderGroup";

export { InsightsSidebar } from "./components/InsightsSidebar";
export type { InsightsSidebarProps } from "./components/InsightsSidebar";
