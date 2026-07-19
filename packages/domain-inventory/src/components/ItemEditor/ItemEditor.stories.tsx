import type { Meta, StoryObj } from "@storybook/react";
import { ItemEditor } from "./ItemEditor.container";

const meta = {
  title: "Domain Inventory/ItemEditor",
  component: ItemEditor,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ItemEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    item: null,
    onClose: () => {},
    onSave: async () => {},
  },
};
