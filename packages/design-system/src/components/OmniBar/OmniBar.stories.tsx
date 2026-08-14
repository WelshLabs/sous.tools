import type { Meta } from "@storybook/react";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { OmniBarProvider } from "./OmniBarProvider";

const meta: Meta<typeof OmniBarPresentation> = {
  title: "Components/OmniBar",
  component: OmniBarPresentation,
  decorators: [
    (Story) => (
      <OmniBarProvider>
        <Story />
      </OmniBarProvider>
    ),
  ],
  tags: ["autodocs"],
};
export default meta;

export const Default = () => (
  <div className="flex h-[400px] items-end p-4">
    <OmniBarPresentation />
  </div>
);
