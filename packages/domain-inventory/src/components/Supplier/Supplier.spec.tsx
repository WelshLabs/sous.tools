"use client";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SupplierOrderGroup } from "./SupplierOrderGroup";

describe("SupplierOrderGroup", () => {
  it("renders correctly", () => {
    render(
      <SupplierOrderGroup
        supplier={null}
        items={[]}
        allSuppliers={[]}
        isPlacingOrder={false}
        onPlaceOrder={vi.fn()}
        onRemoveItem={vi.fn()}
        onChangeQty={vi.fn()}
        onChangeSupplier={vi.fn()}
        onShopOrder={vi.fn()}
      />,
    );
    expect(screen.getByText("Unassigned Items")).toBeInTheDocument();
  });

  it("renders line item with editable unit and triggers onChangeUnit", () => {
    const handleChangeUnit = vi.fn();
    const item = {
      id: "item-1",
      rawName: "Organic Carrots",
      quantity: 5,
      unit: "lb",
      isSystemSuggestion: false,
      supplier: null,
    };

    render(
      <SupplierOrderGroup
        supplier={null}
        items={[item]}
        allSuppliers={[]}
        isPlacingOrder={false}
        onPlaceOrder={vi.fn()}
        onRemoveItem={vi.fn()}
        onChangeQty={vi.fn()}
        onChangeSupplier={vi.fn()}
        onChangeUnit={handleChangeUnit}
        onShopOrder={vi.fn()}
      />,
    );

    expect(screen.getByText("Organic Carrots")).toBeInTheDocument();
    const unitSelect = screen.getByRole("combobox", { name: "Unit" });
    expect(unitSelect).toHaveValue("lb");

    fireEvent.change(unitSelect, { target: { value: "cs" } });
    expect(handleChangeUnit).toHaveBeenCalledWith("item-1", "cs");
  });
});
