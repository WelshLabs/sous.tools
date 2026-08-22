"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsPanel } from "./SettingsPanel.container";

const meta: Meta<typeof SettingsPanel> = {
  title: "Domain Settings/SettingsPanel",
  component: SettingsPanel,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof SettingsPanel>;

export const Default: Story = {
  args: {
    initialData: {
      name: "Conar Welsh",
      email: "conar@example.com",
      role: "admin",
    },
    onSaveGeneral: async () => {},
    initialTokens: {
      primaryColor: "#00f0ff",
      accentColor: "#ff00f0",
    },
    onSaveTokens: async () => {},
    integrations: [
      { provider: "SQUARE", connected: true, connectedAs: "Square Admin" },
      { provider: "GOOGLE", connected: false },
    ],
    onConnectIntegration: () => {},
    onDisconnectIntegration: async () => {},
    onSquareAction: async () => {},
    isDev: true,
  },
};
