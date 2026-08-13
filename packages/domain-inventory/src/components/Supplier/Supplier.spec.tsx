import { render, screen } from "@testing-library/react";
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
});
