/**
 * @route  /inventory/orders
 * @layer  Next.js Server Component (no "use client" directive)
 *
 * Skeleton App pattern:
 *   - This file is a pure data-fetching orchestrator.
 *   - It fetches Vendors and active WhiteboardItems from Supabase server-side.
 *   - All UI, state, and interaction is delegated to <OrdersClient />.
 *   - No JSX layout lives here beyond the minimal shell.
 */

import React from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@soustools/supabase";
import type { Vendor, WhiteboardItem } from "@soustools/api-types";
import { OrdersClient } from "./OrdersClient";

/**
 * Fetches the active procurement data for the requesting session.
 * Returns empty arrays on error to keep the page resilient.
 */
async function getProcurementData(): Promise<{
  vendors: Vendor[];
  whiteboardItems: WhiteboardItem[];
}> {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: vendors }, { data: items }] = await Promise.all([
    supabase.from("vendors").select("*").order("name"),
    supabase
      .from("whiteboard_items")
      .select("*")
      .eq("is_active", true)
      .order("created_at"),
  ]);

  return {
    vendors: (vendors as Vendor[] | null) ?? [],
    whiteboardItems: (items as WhiteboardItem[] | null) ?? [],
  };
}

/**
 * Inventory Orders page.
 *
 * @tenant-docs-export
 * # Order Manager
 * The Order Manager is your living procurement list.
 * Add items as you notice they run low in the kitchen. Items are grouped
 * by your registered vendors so you can place supplier orders in one click.
 */
export default async function OrdersPage() {
  const { vendors, whiteboardItems } = await getProcurementData();

  return (
    <OrdersClient vendors={vendors} whiteboardItems={whiteboardItems} />
  );
}
