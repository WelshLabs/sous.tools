import type { Meta, StoryObj } from "@storybook/react";
import { AppBar } from "./AppBar";

const meta: Meta<typeof AppBar> = {
  title: "Components/AppBar",
  component: AppBar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppBar>;

const mockNotifications = [
  {
    id: "1",
    title: "New Recipe Ingested",
    message:
      "The chocolate chip cookies recipe has been successfully parsed and added to your inventory.",
  },
  {
    id: "2",
    title: "System Update",
    message:
      "Neon-Glass design system has been upgraded to v1.2.0. Enjoy Tailwind v4 improvements.",
  },
];

export const Default: Story = {
  args: {
    notifications: [],
    isAdmin: false,
    onLogoutAction: () => console.log("Logout clicked"),
    onMarkAllAsReadAction: () => console.log("Mark all read clicked"),
  },
};

export const WithNotifications: Story = {
  args: {
    notifications: mockNotifications,
    isAdmin: false,
    onLogoutAction: () => console.log("Logout clicked"),
    onMarkAllAsReadAction: () => console.log("Mark all read clicked"),
  },
};

export const AdminMode: Story = {
  args: {
    notifications: mockNotifications,
    isAdmin: true,
    onLogoutAction: () => console.log("Logout clicked"),
    onMarkAllAsReadAction: () => console.log("Mark all read clicked"),
  },
};
