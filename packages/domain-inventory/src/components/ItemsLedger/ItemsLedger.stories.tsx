"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { ItemsLedgerView } from "./ItemsLedger.view";

const meta = {
  title: "Domain Inventory/ItemsLedger",
  component: ItemsLedgerView,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ItemsLedgerView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [],
    loading: false,
    onEdit: () => {},
    onDelete: () => {},
  },
};
