/* eslint-disable max-lines */
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
  parameters: {
    layout: "fullscreen",
    omnibar: { route: route("/inventory") },
  },
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

/** The compact workspace launcher at rest. */
export const WorkspaceCollapsed: Story = {};

/** The workspace modal opened over the current page. */
export const WorkspaceExpanded: Story = {
  args: { isOpen: true },
};

/** A composed request ready to send. */
export const WithDraftPrompt: Story = {
  args: {
    isOpen: true,
    inputText: "Compare this week's produce spend against our budget",
  },
};

/** The assistant is actively handling a request. */
export const Processing: Story = {
  args: {
    isOpen: true,
    isProcessing: true,
    inputText: "",
  },
};

/** Voice capture is active. */
export const Listening: Story = {
  args: {
    isOpen: true,
    isListening: true,
  },
};

/** A recoverable error displayed below the composer. */
export const WithError: Story = {
  args: {
    isOpen: true,
    inputText: "Upload this invoice",
    errorMessage: "The invoice could not be read. Try a clearer scan or PDF.",
  },
};

/** Global drag state turns the pill into a prominent drop target. */
export const DragAndDrop: Story = {
  args: { isOpen: true },
  parameters: {
    omnibar: {
      route: route("/inventory"),
      isDragging: true,
    },
  },
};

/** Files staged above the prompt before submission. */
export const WithStagedFiles: Story = {
  args: {
    isOpen: true,
    inputText: "Extract the line items and flag unusual price changes",
  },
  parameters: {
    omnibar: {
      route: route("/inventory"),
      stagedFiles,
    },
  },
};

/** The primary centered entry point on the home route. */
export const HomeFocus: Story = {
  args: {
    isFocusPage: true,
    inputText: "",
  },
  parameters: {
    omnibar: { route: route("/home") },
  },
};

/** Home entry point with a useful starter prompt. */
export const HomeWithPrompt: Story = {
  args: {
    isFocusPage: true,
    inputText: "What needs my attention before dinner service?",
  },
  parameters: {
    omnibar: { route: route("/home") },
  },
};

/** Sticky composer shown beneath an active answer thread. */
export const AnswerComposer: Story = {
  args: {
    isFocusPage: true,
    inputText: "Break that down by supplier",
  },
  parameters: {
    omnibar: { route: route("/home", "chat=weekly-spend") },
  },
};

/** Active answer composer with files queued for follow-up analysis. */
export const AnswerComposerWithFiles: Story = {
  args: {
    isFocusPage: true,
    inputText: "Add these documents to the comparison",
  },
  parameters: {
    omnibar: {
      route: route("/home", "chat=weekly-spend"),
      stagedFiles,
    },
  },
};
