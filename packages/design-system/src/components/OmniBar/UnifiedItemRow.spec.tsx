import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UnifiedItemRow } from "./UnifiedItemRow";
import { type UnifiedLineItem } from "./UnifiedReviewPanel";

vi.mock("@soustools/api-client", () => ({
  api: {
    GET: vi.fn().mockResolvedValue({ data: { data: [] } }),
    POST: vi.fn().mockResolvedValue({ data: { data: { id: "item-new", name: "New Item" } } }),
  },
}));

describe("UnifiedItemRow", () => {
  const defaultItem: UnifiedLineItem = {
    rawName: "SYSCO YELLOW ONIONS 50LB",
    suggestedInternalName: "Yellow Onions",
    category: "INGREDIENT",
    amount: 2,
    unit: "BAG",
    price: 34.5,
    itemId: "item-1",
    confidence: 0.95,
    suggestions: [
      { itemId: "item-1", name: "Yellow Onions", similarity: 0.95, matchColor: "green" },
      { itemId: "item-2", name: "Red Onions", similarity: 0.75, matchColor: "yellow" },
    ],
  };

  const masterIngredients = [
    { id: "item-1", name: "Yellow Onions" },
    { id: "item-2", name: "Red Onions" },
  ];

  it("renders raw item name and AI suggestion", () => {
    render(
      <UnifiedItemRow
        item={defaultItem}
        index={0}
        masterIngredients={masterIngredients}
      />,
    );

    expect(screen.getByText("SYSCO YELLOW ONIONS 50LB")).toBeDefined();
    expect(screen.getAllByText(/Yellow Onions/).length).toBeGreaterThan(0);
  });

  it("renders static click-to-edit values for qty, unit, and price and activates edit input on click", async () => {
    const onUpdateItem = vi.fn();
    render(
      <UnifiedItemRow
        item={defaultItem}
        index={0}
        masterIngredients={masterIngredients}
        onUpdateItem={onUpdateItem}
      />,
    );

    const qtyBtn = screen.getByTitle("Click to edit qty");
    expect(qtyBtn).toBeDefined();

    fireEvent.click(qtyBtn);
    const qtyInput = screen.getByRole("spinbutton");
    expect(qtyInput).toBeDefined();

    fireEvent.change(qtyInput, { target: { value: "5" } });
    fireEvent.blur(qtyInput);

    expect(onUpdateItem).toHaveBeenCalledWith(0, { amount: 5 });
  });

  it("renders override button and allows manual alias selection", async () => {
    const onConfirmAlias = vi.fn();
    const onUpdateItem = vi.fn();

    render(
      <UnifiedItemRow
        item={defaultItem}
        index={0}
        masterIngredients={masterIngredients}
        onConfirmAlias={onConfirmAlias}
        onUpdateItem={onUpdateItem}
      />,
    );

    const overrideBtn = screen.getByTitle("Override mapping");
    fireEvent.click(overrideBtn);

    const searchInput = screen.getByRole("textbox");
    expect(searchInput).toBeDefined();
    expect((searchInput as HTMLInputElement).value).toBe("Yellow Onions");
  });
});
