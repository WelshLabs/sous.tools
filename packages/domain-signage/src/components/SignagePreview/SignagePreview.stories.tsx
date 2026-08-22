"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { SignagePreviewView } from "./SignagePreview.view";
import { type SignageLayoutConfig } from "@soustools/api-types";

const meta: Meta<typeof SignagePreviewView> = {
  title: "domain-signage/SignagePreview",
  component: SignagePreviewView,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SignagePreviewView>;

const dummyConfig: SignageLayoutConfig = {
  id: "preview-1",
  name: "Preview 1",
  aspectRatio: "16:9",
  slides: [
    {
      id: "slide-1",
      type: "COLUMN_LAYOUT",
      duration: 10,
      backgroundColor: "#111111",
      columns: [
        {
          id: "col-1",
          width: "100%",
          blocks: [],
        },
      ],
    },
  ],
};

export const Default: Story = {
  args: {
    config: dummyConfig,
    items: [],
    activeSlideIndex: 0,
    isPreviewing: true,
    scale: 1,
    containerRef: { current: null },
    fetchModifiers: async () => [],
  },
};
