"use client";

import { PosOrdersView, type PosOrder } from "./PosOrders.view";

export interface PosOrdersProps {
  initialOrders?: PosOrder[];
}

export function PosOrdersContainer({ initialOrders = [] }: PosOrdersProps) {
  return <PosOrdersView orders={initialOrders} />;
}

export { PosOrdersContainer as PosOrders };
