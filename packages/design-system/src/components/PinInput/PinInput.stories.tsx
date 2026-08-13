import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { PinInput } from "./PinInput";

const meta: Meta<typeof PinInput> = {
  title: "Components/PinInput",
  component: PinInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PinInput>;

const PinInputWrapperDefault = () => {
  const [value, setValue] = useState("");
  return (
    <div className="p-8 bg-background flex flex-col items-center gap-4">
      <PinInput value={value} onChange={setValue} length={6} />
      <div className="text-foreground">Entered Value: {value}</div>
    </div>
  );
};

export const Default: Story = {
  render: () => <PinInputWrapperDefault />,
};

const PinInputWrapperCustomLength = () => {
  const [value, setValue] = useState("");
  return (
    <div className="p-8 bg-background flex flex-col items-center gap-4">
      <PinInput value={value} onChange={setValue} length={4} />
    </div>
  );
};

export const CustomLength: Story = {
  render: () => <PinInputWrapperCustomLength />,
};
