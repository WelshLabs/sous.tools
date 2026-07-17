"use client";

import { Edit, Trash2 } from "lucide-react";
import { MasterIngredient } from "@soustools/api-types";


export interface ItemsLedgerTableProps {
  items: MasterIngredient[];
  loading: boolean;
  onEdit: (item: MasterIngredient) => void;
  onDelete: (id: string) => void;
}

export function ItemsLedgerTable({
  items,
  loading,
  onEdit,
  onDelete,
}: ItemsLedgerTableProps) {
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
      <table className="w-full text-left text-sm text-zinc-700 dark:text-muted-foreground">
        <thead className="bg-card/80 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-xs border-b border-border dark:border-white/5">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Purchase Unit</th>
            <th className="px-6 py-4">Density (g/mL)</th>
            <th className="px-6 py-4">Allergens</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {items.map((item: MasterIngredient) => (
            <tr
              key={item.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <td className="px-6 py-4 font-medium text-zinc-900 dark:text-foreground">
                {item.name}
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-md text-xs">
                  {item.category}
                </span>
              </td>
              <td className="px-6 py-4">{item.purchase_unit}</td>
              <td className="px-6 py-4">
                {Number(item.density_g_ml).toFixed(3)}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-1 flex-wrap">
                  {(item.allergens || []).map((alg: string) => (
                    <span
                      key={alg}
                      className="px-2 py-1 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 rounded-md text-xs"
                    >
                      {alg}
                    </span>
                  ))}
                  {(!item.allergens || item.allergens.length === 0) && (
                    <span className="text-zinc-500 dark:text-zinc-600 italic">
                      None
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
