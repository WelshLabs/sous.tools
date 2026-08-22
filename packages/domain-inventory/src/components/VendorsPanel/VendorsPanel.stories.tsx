"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { VendorsPanel } from "./VendorsPanel.container";

const meta = {
  title: "Domain Inventory/VendorsPanel",
  component: VendorsPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VendorsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    vendors: [],
    onSave: async () => {},
    onDelete: async () => {},
  },
};
