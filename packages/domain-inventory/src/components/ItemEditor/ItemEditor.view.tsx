"use client";

import { X } from "lucide-react";
import { ItemEditorUsdaBox } from "./ItemEditorUsdaBox";
import {
  ItemEditorFormFields,
  type ItemFormData,
} from "./ItemEditorFormFields";
import type { InventoryItem } from "./ItemEditor.container";

interface ItemEditorViewProps {
  item: InventoryItem | null;
  formData: ItemFormData;
  loading: boolean;
  usdaQuery: string;
  usdaLoading: boolean;
  hasSearchHandler: boolean;
  onClose: () => void;
  onQueryChange: (v: string) => void;
  onSearch: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleMacroChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAllergensChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ItemEditorView({
  item,
  formData,
  loading,
  usdaQuery,
  usdaLoading,
  hasSearchHandler,
  onClose,
  onQueryChange,
  onSearch,
  handleSubmit,
  handleChange,
  handleMacroChange,
  handleAllergensChange,
}: ItemEditorViewProps) {
  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/60">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {item ? "Edit Ledger Item" : "New Ledger Item"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <ItemEditorUsdaBox
            usdaQuery={usdaQuery}
            usdaLoading={usdaLoading}
            fdcId={formData.fdc_id}
            hasSearchHandler={hasSearchHandler}
            onQueryChange={onQueryChange}
            onSearch={onSearch}
          />
          <ItemEditorFormFields
            formData={formData}
            loading={loading}
            onClose={onClose}
            onChange={handleChange}
            onMacroChange={handleMacroChange}
            onAllergensChange={handleAllergensChange}
          />
        </form>
      </div>
    </div>
  );
}
