import type { Meta, StoryObj } from "@storybook/react";
import { OrdersPanel } from "./OrdersPanel.container";

const meta = {
  title: "Domain Inventory/OrdersPanel",
  component: OrdersPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OrdersPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    vendors: [],
    whiteboardItems: [],
    purchaseOrders: [],
    onAddFreeText: async () => "new-id",
    onRemoveItem: async () => {},
    onUpdateItemQty: async () => {},
    onChangeSupplier: async () => {},
    onSubmitPO: async () => {},
    onShopOrder: () => {},
  },
};
