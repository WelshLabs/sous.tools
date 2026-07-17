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
  itemId,
}: NonInventoryExpenseCheckboxProps) {
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-700 bg-transparent text-cyan-500 w-3.5 h-3.5"
        />
        <span>Non-Inventory Expense</span>
      </label>
    </div>
  );
}
