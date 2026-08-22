"use client";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SignageEditor } from "./SignageEditor.container";

const meta: Meta<typeof SignageEditor> = {
  title: "Signage/SignageEditor",
  component: SignageEditor,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof SignageEditor>;

// The container seeds its own state from DEFAULT_CONFIG when no initialConfig
// is passed, so the editor renders with a valid slide out of the box.
export const Default: Story = {
  render: () => (
    <div style={{ height: "100vh" }}>
      <SignageEditor items={[]} layoutName="TV Signage" />
    </div>
  ),
};
