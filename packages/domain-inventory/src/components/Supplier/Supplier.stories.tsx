"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { SupplierOrderGroup } from "./SupplierOrderGroup";

const meta = {
  title: "Domain Inventory/SupplierOrderGroup",
  component: SupplierOrderGroup,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SupplierOrderGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    supplier: {
      id: "test",
      name: "Test Supplier",
      cutoffTime: "12:00",
      deliveryDays: ["Monday"],
    },
    items: [],
    allSuppliers: [],
    isPlacingOrder: false,
    onPlaceOrder: () => {},
    onRemoveItem: async () => {},
    onChangeQty: async () => {},
    onChangeSupplier: async () => {},
    onShopOrder: () => {},
  },
};
