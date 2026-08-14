"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@soustools/design-system";

export interface PosOrder {
  id: string;
  pos_provider: string;
  external_id: string;
  location_id: string | null;
  state: string;
  total_money: number;
  total_discount_money: number;
  total_tax_money: number;
  closed_at: string | null;
  created_at: string;
}

export function PosOrdersView({
  initialOrders,
}: {
  initialOrders: PosOrder[];
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          POS Orders
        </h1>
        <p className="text-sm text-zinc-500 dark:text-muted-foreground mt-1">
          View Square POS order history.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Total Money</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Provider</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialOrders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center p-8 text-xs text-muted-foreground dark:text-zinc-500"
              >
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            initialOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-zinc-500">
                  {order.external_id}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      order.state === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {order.state}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-400">
                  {order.location_id || "Unknown"}
                </TableCell>
                <TableCell className="font-bold text-cyan-400">
                  ${order.total_money.toFixed(2)}
                </TableCell>
                <TableCell className="text-zinc-500">
                  {new Date(order.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-sky-500/20 text-sky-400 uppercase">
                    {order.pos_provider}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
