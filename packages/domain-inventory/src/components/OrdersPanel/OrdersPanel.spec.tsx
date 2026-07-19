import { render, screen } from "@testing-library/react";
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
      />
    );
    expect(screen.getByRole("heading", { name: /Order\s+Manager/i })).toBeInTheDocument();
  });
});
