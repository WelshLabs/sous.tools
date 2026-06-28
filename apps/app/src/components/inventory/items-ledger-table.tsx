"use client";

import { Edit, Trash2 } from "lucide-react";

export interface ItemsLedgerTableProps {
  items: any[];
  loading: boolean;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export default function ItemsLedgerTable({ items, loading, onEdit, onDelete }: ItemsLedgerTableProps) {
  if (loading) {
    return <div className="p-12 text-center text-zinc-500">Loading ledger...</div>;
  }

  if (!items.length) {
    return <div className="p-12 text-center text-zinc-500">No items found in ledger.</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm text-zinc-300">
        <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-semibold text-xs border-b border-white/5">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Purchase Unit</th>
            <th className="px-6 py-4">Density (g/mL)</th>
            <th className="px-6 py-4">Allergens</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-zinc-950/50">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
              <td className="px-6 py-4 font-medium text-white">{item.name}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs">{item.category}</span>
              </td>
              <td className="px-6 py-4">{item.purchase_unit}</td>
              <td className="px-6 py-4">{Number(item.density_g_ml).toFixed(3)}</td>
              <td className="px-6 py-4">
                <div className="flex gap-1 flex-wrap">
                  {(item.allergens || []).map((alg: string) => (
                    <span key={alg} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs">
                      {alg}
                    </span>
                  ))}
                  {(!item.allergens || item.allergens.length === 0) && <span className="text-zinc-600 italic">None</span>}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(item)} className="p-2 text-zinc-400 hover:text-sky-400 bg-white/5 hover:bg-sky-500/10 rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors">
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
