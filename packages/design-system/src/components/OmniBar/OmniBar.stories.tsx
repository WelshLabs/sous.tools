import type { Meta, StoryObj } from "@storybook/react";
import type { OmniMessage } from "@soustools/api-types";
import { OmniBarPresentation } from "./OmniBarPresentation";
import { useOmnibarContext, type StagedFile } from "./OmniBarContext";

const noop = () => {};

const baseArgs = {
  isOpen: false,
  isListening: false,
  isProcessing: false,
  chatHistory: [] as OmniMessage[],
  errorMessage: null,
  inputText: "",
  isFocusPage: false,
  onToggle: noop,
  onChange: noop,
  onKeyDown: noop,
  onMicClick: noop,
  onSubmit: noop,
  onClearHistory: noop,
};

const route = (pathname: string, search = "") =>
  `${pathname}${search ? `?${search}` : ""}`;

const stagedFiles: StagedFile[] = [
  {
    id: "invoice-pdf",
    url: null,
    status: "complete",
    file: new File(["sample invoice"], "restaurant-depot-1842.pdf", {
      type: "application/pdf",
    }),
  },
  {
    id: "produce-photo",
    url: null,
    status: "uploading",
    file: new File(["sample image"], "produce-delivery.jpg", {
      type: "image/jpeg",
    }),
  },
];

interface StoryParameters {
  omnibar?: {
    route?: string;
    isDragging?: boolean;
    stagedFiles?: StagedFile[];
  };
}

const meta = {
  title: "Components/OmniBar",
  component: OmniBarPresentation,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", omnibar: { route: route("/inventory") } },
  decorators: [
    (Story, context) => {
      const parameters = context.parameters as StoryParameters;
      const omnibar = parameters.omnibar ?? {};
      window.history.replaceState({}, "", omnibar.route ?? "/inventory");
      useOmnibarContext.setState({
        isDragging: omnibar.isDragging ?? false,
        stagedFiles: omnibar.stagedFiles ?? [],
      });

      return (
        <main className="bg-background text-foreground relative min-h-[720px] overflow-hidden">
          <div className="pointer-events-none mx-auto flex max-w-6xl flex-col gap-3 px-8 pt-8 opacity-35">
            <div className="bg-muted h-8 w-48 rounded-lg" />
            <div className="bg-muted/60 h-32 rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/40 h-36 rounded-2xl" />
              <div className="bg-muted/40 h-36 rounded-2xl" />
              <div className="bg-muted/40 h-36 rounded-2xl" />
            </div>
          </div>
          <Story />
        </main>
      );
    },
  ],
  args: baseArgs,
  argTypes: {
    isOpen: { control: "boolean" },
    isListening: { control: "boolean" },
    isProcessing: { control: "boolean" },
    inputText: { control: "text" },
    errorMessage: { control: "text" },
    chatHistory: { control: "object" },
    isFocusPage: { control: "boolean" },
    onToggle: { action: "toggle" },
    onChange: { action: "change" },
    onKeyDown: { action: "keyDown" },
    onMicClick: { action: "micClick" },
    onSubmit: { action: "submit" },
    onClearHistory: { action: "clearHistory" },
  },
} satisfies Meta<typeof OmniBarPresentation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CollapsedPill: Story = { args: { isOpen: false } };

export const ExpandedEmpty: Story = { args: { isOpen: true, inputText: "" } };

export const Listening: Story = {
  args: {
    isOpen: true,
    isListening: true,
    inputText: "86 salmon and double the prep on caesar dressing",
  },
};

export const Processing: Story = {
  args: {
    isOpen: true,
    isProcessing: true,
    inputText: "Compare Sysco and US Foods invoices for dairy",
  },
};

export const WithTranscript: Story = {
  args: {
    isOpen: true,
    chatHistory: [
      {
        id: "1",
        role: "user",
        content: "What were our top 3 food costs last week?",
        timestamp: new Date(2026, 2, 28, 14, 30),
      },
      {
        id: "2",
        role: "model",
        content:
          "Top 3 food costs:\n1. Ribeye ($1,420)\n2. Heavy Cream ($890)\n3. Butter ($640)",
        timestamp: new Date(2026, 2, 28, 14, 30, 15),
      },
    ],
  },
};

export const WithError: Story = {
  args: {
    isOpen: true,
    inputText: "Upload this invoice",
    errorMessage: "The invoice could not be read. Try a clearer scan or PDF.",
  },
};

export const DragAndDrop: Story = {
  args: { isOpen: true },
  parameters: { omnibar: { route: route("/inventory"), isDragging: true } },
};

export const WithStagedFiles: Story = {
  args: {
    isOpen: true,
    inputText: "Extract the line items and flag unusual price changes",
  },
  parameters: { omnibar: { route: route("/inventory"), stagedFiles } },
};

export const HomeFocus: Story = {
  args: { isFocusPage: true, inputText: "" },
  parameters: { omnibar: { route: route("/home") } },
};

export const HomeWithPrompt: Story = {
  args: {
    isFocusPage: true,
    inputText: "What needs my attention before dinner service?",
  },
  parameters: { omnibar: { route: route("/home") } },
};

export const AnswerComposer: Story = {
  args: { isFocusPage: true, inputText: "Break that down by supplier" },
  parameters: { omnibar: { route: route("/home", "chat=weekly-spend") } },
};

export const AnswerComposerWithFiles: Story = {
  args: {
    isFocusPage: true,
    inputText: "Add these documents to the comparison",
  },
  parameters: {
    omnibar: { route: route("/home", "chat=weekly-spend"), stagedFiles },
  },
};
