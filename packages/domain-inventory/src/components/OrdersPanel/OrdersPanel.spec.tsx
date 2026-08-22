"use client";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { OrdersPanel } from "./OrdersPanel.container";

describe("OrdersPanel", () => {
  it("renders correctly with empty data", () => {
    render(
      <OrdersPanel
        vendors={[]}
        whiteboardItems={[]}
        purchaseOrders={[]}
        onAddFreeText={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateItemQty={vi.fn()}
        onChangeSupplier={vi.fn()}
        onSubmitPO={vi.fn()}
        onShopOrder={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("heading", { name: /Order\s+Manager/i }),
    ).toBeInTheDocument();
  });

  it("opens Add Vendor modal when Add Vendor CTA is clicked", () => {
    render(
      <OrdersPanel
        vendors={[]}
        whiteboardItems={[]}
        purchaseOrders={[]}
        onAddFreeText={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateItemQty={vi.fn()}
        onChangeSupplier={vi.fn()}
        onSubmitPO={vi.fn()}
        onShopOrder={vi.fn()}
      />,
    );

    const addVendorButton = screen.getByRole("button", { name: /Add Vendor/i });
    fireEvent.click(addVendorButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. Sysco, Local Farm/i),
    ).toBeInTheDocument();
  });

  it("triggers onUpdateItemUnit when an item unit is updated", () => {
    const handleUpdateUnit = vi.fn();
    const whiteboardItems = [
      {
        id: "wb-1",
        organization_id: "org-1",
        raw_name: "Olive Oil",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    render(
      <OrdersPanel
        vendors={[]}
        whiteboardItems={whiteboardItems}
        purchaseOrders={[]}
        onAddFreeText={vi.fn()}
        onRemoveItem={vi.fn()}
        onUpdateItemQty={vi.fn()}
        onUpdateItemUnit={handleUpdateUnit}
        onChangeSupplier={vi.fn()}
        onSubmitPO={vi.fn()}
        onShopOrder={vi.fn()}
      />,
    );

    expect(screen.getByText("Olive Oil")).toBeInTheDocument();
    const unitSelect = screen.getByRole("combobox", { name: "Unit" });
    fireEvent.change(unitSelect, { target: { value: "gal" } });

    expect(handleUpdateUnit).toHaveBeenCalledWith("wb-1", "gal", true);
  });
});
