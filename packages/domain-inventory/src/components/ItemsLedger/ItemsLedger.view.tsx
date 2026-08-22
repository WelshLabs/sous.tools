"use client";
import { Button } from "@soustools/design-system";
import { Edit, Trash2 } from "lucide-react";

export interface LedgerItem {
  id: string;
  name: string;
  category: string;
  purchase_unit: string;
  density_g_ml: number | string;
  allergens?: string[] | null;
}

export interface ItemsLedgerViewProps {
  items: LedgerItem[];
  loading: boolean;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
}

export function ItemsLedgerView({
  items,
  loading,
  onEdit,
  onDelete,
}: ItemsLedgerViewProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
        Loading ledger...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="p-12 text-center text-zinc-400 dark:text-zinc-500">
        No items found in ledger.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="dark:text-muted-foreground w-full text-left text-sm text-zinc-700">
        <thead className="bg-card/80 border-border border-b text-xs font-semibold text-zinc-500 uppercase dark:border-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Purchase Unit</th>
            <th className="px-6 py-4">Density (g/mL)</th>
            <th className="px-6 py-4">Allergens</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {items.map((item: LedgerItem) => (
            <tr
              key={item.id}
              className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="dark:text-foreground px-6 py-4 font-medium text-zinc-900">
                {item.name}
              </td>
              <td className="px-6 py-4">
                <span className="rounded-md bg-zinc-200 px-2 py-1 text-xs dark:bg-zinc-800">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4">{item.purchase_unit}</td>
              <td className="px-6 py-4">
                {Number(item.density_g_ml).toFixed(3)}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {(item.allergens || []).map((alg) => (
                    <span
                      key={alg}
                      className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-400"
                    >
                      {alg}
                    </span>
                  ))}
                  {(!item.allergens || item.allergens.length === 0) && (
                    <span className="text-zinc-500 italic dark:text-zinc-600">
                      None
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-slate-100 text-zinc-500 transition-colors hover:bg-sky-100 hover:text-sky-500 dark:bg-slate-800 dark:text-zinc-400 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
                    onClick={() => onEdit(item)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-slate-100 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-500 dark:bg-slate-800 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
ItemsLedgerView.displayName = "ItemsLedgerView";
