import type { Meta, StoryObj } from "@storybook/react";
import { DisplayManagerView } from "./DisplayManager.view";

const meta: Meta<typeof DisplayManagerView> = {
  title: "DomainSignage/DisplayManager",
  component: DisplayManagerView,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DisplayManagerView>;

export const Default: Story = {
  args: {
    displays: [
      {
        id: "disp1",
        name: "Lobby TV",
        deckId: "deck1",
        portLabel: "HDMI 1",
        deviceId: "dev1",
        lastSeenAt: new Date().toISOString(),
      },
      {
        id: "disp2",
        name: "Browser Display",
        deckId: null,
        lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago (offline)
      },
    ] as any[],
    layouts: [
      { id: "deck1", name: "Welcome Deck" },
      { id: "deck2", name: "Menu Specials" },
    ],
    showPairModal: false,
    selectedDeviceId: null,
    handleAddBrowserDisplay: () => console.log("Add browser display"),
    setShowPairModal: () => console.log("Show pair modal"),
    setSelectedDeviceId: () => console.log("Set selected device"),
    onAssignDeck: async () => console.log("Assign deck"),
    handleDeleteDisplay: () => console.log("Delete display"),
    onRefreshData: () => console.log("Refresh data"),
  },
};
