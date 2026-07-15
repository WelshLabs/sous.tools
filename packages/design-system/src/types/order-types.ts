/**
 * Canonical shared types for the Inventory Order Manager.
 *
 * These are pure data-shape types (no business logic) that are safe to
 * live in the design-system layer because they describe UI-facing data
 * structures, not database schemas.
 *
 * Consumers:
 *   - packages/design-system/src/components/InsightsSidebar.tsx
 *   - packages/domain-inventory/src/orders-panel.tsx
 */

/** A supplier/vendor as represented in the Order Manager UI. */
export interface OrderSupplier {
  id: string;
  name: string;
  /** ISO weekday numbers (0=Sun … 6=Sat) for scheduled delivery days. */
  deliveryDays: number[];
  /** Human-readable cutoff time string, e.g. "2:00 PM". */
  cutoffTime: string;
}

/** A single line-item on a living order or purchase order draft. */
export interface OrderLineItem {
  id: string;
  /** Raw ingredient name as entered by the user or parsed from an invoice. */
  rawName: string;
  quantity: number;
  unit: string;
  /** True when this item was auto-suggested by the AI engine. */
  isSystemSuggestion: boolean;
  /** The assigned supplier, or null if unassigned ("Unassigned" bucket). */
  supplier: OrderSupplier | null;
}
