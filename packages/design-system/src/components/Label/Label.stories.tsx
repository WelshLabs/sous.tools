import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Components/Label",
  component: Label,
};
export default meta;

export const Default: StoryObj<typeof Label> = {
  args: {
    children: "Email Address",
  },
};

export const Required: StoryObj<typeof Label> = {
  args: {
    children: "Password",
    required: true,
  },
};
