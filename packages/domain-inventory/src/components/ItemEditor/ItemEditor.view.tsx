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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {item ? "Edit Ledger Item" : "New Ledger Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
