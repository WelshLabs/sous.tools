import { useEffect } from "react";

export function useAutoMapping({
  parsed,
  parseError,
  items,
  disabled,
  onChange,
}: {
  parsed: Record<string, unknown>;
  parseError: boolean;
  items: { id: string; name: string; each_weight_g: number | null }[];
  disabled: boolean;
  onChange: (data: string) => void;
}) {
  useEffect(() => {
    if (parseError || items.length === 0 || disabled) return;
    let modified = false;
    const newData = { ...parsed };

    if (newData.vendorName && newData.items) {
      (newData.items as Array<Record<string, unknown>>).forEach((item) => {
        if (!item.itemId && item.rawName) {
          const rawName = String(item.rawName);
          const mappedName = item.mappedName ? String(item.mappedName) : "";
          const match = items.find((i) =>
            i.name.toLowerCase() === rawName.toLowerCase() ||
            (mappedName && i.name.toLowerCase() === mappedName.toLowerCase())
          );
          if (match) {
            item.itemId = match.id;
            const u = (String(item.unit ?? item.uom ?? "")).toLowerCase();
            const isWeight = u.startsWith("lb") || u === "oz" || u === "g" || u === "kg";

            if (isWeight && Number(item.quantity) > 0) {
              item._requiresWeightInput = false;
              let mult = 1;
              if (u.startsWith("lb")) mult = 453.592;
              else if (u === "oz") mult = 28.3495;
              else if (u === "kg") mult = 1000;
              item.each_weight_g = Math.round(mult);
            } else {
              item._requiresWeightInput = !match.each_weight_g || match.each_weight_g <= 0;
            }
            modified = true;
          }
        }
      });
    } else {
      const targetRecipes = (newData.recipes
        ? newData.recipes
        : newData.title && newData.ingredients
          ? [newData]
          : []) as Array<{ ingredients?: Array<Record<string, unknown>> }>;

      targetRecipes.forEach((recipe) => {
        if (recipe.ingredients) {
          recipe.ingredients.forEach((ing) => {
            if (!ing.itemId && ing.name) {
              const match = items.find(
                (i) =>
                  i.name.toLowerCase() === String(ing.name).trim().toLowerCase(),
              );
              if (match) {
                ing.itemId = match.id;
                modified = true;
              }
            }
          });
        }
      });
    }

    if (modified) {
      onChange(JSON.stringify(newData, null, 2));
    }
    }, [items, disabled, onChange, parseError, parsed]);
}
