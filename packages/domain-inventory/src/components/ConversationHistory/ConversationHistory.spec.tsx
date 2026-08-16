import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ConversationHistoryView, type ConversationItem } from "./ConversationHistory.view";
import { ConversationHistoryContainer } from "./ConversationHistory.container";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@soustools/api-client", () => ({
  api: {
    GET: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: "conv-1",
            title: "How much chicken is in stock?",
            last_message: "We have 4 cases",
            updated_at: new Date().toISOString(),
          },
          {
            id: "conv-2",
            title: "Weekly prep checklist",
            last_message: "Done",
            updated_at: new Date().toISOString(),
          },
        ],
      },
    }),
  },
}));

describe("ConversationHistory", () => {
  const conversations: ConversationItem[] = [
    {
      id: "conv-1",
      title: "How much chicken is in stock?",
      lastMessage: "We have 4 cases",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "conv-2",
      title: "Weekly prep checklist",
      lastMessage: "Done",
      updatedAt: new Date().toISOString(),
    },
  ];

  it("renders ConversationHistoryView with items and New Chat button", () => {
    const onSelect = vi.fn();
    const onNewChat = vi.fn();

    render(
      <ConversationHistoryView
        conversations={conversations}
        activeId="conv-1"
        onSelect={onSelect}
        onNewChat={onNewChat}
      />,
    );

    expect(screen.getByText("How much chicken is in stock?")).toBeInTheDocument();
    expect(screen.getByText("Weekly prep checklist")).toBeInTheDocument();

    const newChatBtn = screen.getByLabelText("Start new chat");
    fireEvent.click(newChatBtn);
    expect(onNewChat).toHaveBeenCalled();
  });

  it("calls onSelect when a conversation item is clicked", () => {
    const onSelect = vi.fn();
    render(
      <ConversationHistoryView
        conversations={conversations}
        activeId="conv-1"
        onSelect={onSelect}
        onNewChat={vi.fn()}
      />,
    );

    const item2 = screen.getByText("Weekly prep checklist");
    fireEvent.click(item2);
    expect(onSelect).toHaveBeenCalledWith("conv-2");
  });

  it("renders ConversationHistoryContainer without crashing", () => {
    render(<ConversationHistoryContainer activeId="conv-1" />);
    expect(screen.getByText("Conversations")).toBeInTheDocument();
  });
});
