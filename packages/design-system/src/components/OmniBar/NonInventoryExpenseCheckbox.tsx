"use client";

interface NonInventoryExpenseCheckboxProps {
  disabled: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
  itemId: string | null;
}

export function NonInventoryExpenseCheckbox({
  disabled,
  checked,
  onChange,
  itemId: _itemId,
}: NonInventoryExpenseCheckboxProps) {
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <label className="text-muted-foreground flex cursor-pointer items-center gap-1.5 text-[11px] select-none">
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-zinc-300 bg-transparent text-cyan-500 dark:border-zinc-700"
        />
        <span>Non-Inventory Expense</span>
      </label>
    </div>
  );
}
