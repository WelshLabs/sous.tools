import type { Meta, StoryObj } from "@storybook/react";
import { VesselManagerView } from "./VesselManager.view";

const meta: Meta<typeof VesselManagerView> = {
  title: "Domain/Recipes/VesselManager",
  component: VesselManagerView,
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof VesselManagerView>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => alert("Close"),
    vessels: [
      {
        id: "1",
        organizationId: "org-1",
        name: "9 inch Pullman Pan",
        shape: "RECTANGULAR",
        length: 23,
        width: 10,
        height: 10,
        diameter: null,
        volumeMl: 2300,
        createdAt: new Date(),
      },
      {
        id: "2",
        organizationId: "org-1",
        name: "Round Cake Pan",
        shape: "ROUND",
        length: null,
        width: null,
        height: 5,
        diameter: 20,
        volumeMl: 1570,
        createdAt: new Date(),
      },
    ],
    loading: false,
    dialogOpen: false,
    setDialogOpen: () => alert("Set Dialog Open"),
    activeVessel: null,
    setActiveVessel: () => {},
    unitSystem: "cm",
    setUnitSystem: () => {},
    volumeUnit: "ml",
    setVolumeUnit: () => {},
    onSaveVessel: async () => {},
    onDeleteVessel: async () => {},
  },
};
