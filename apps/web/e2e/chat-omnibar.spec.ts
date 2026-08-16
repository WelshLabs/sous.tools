import { test, expect } from "@playwright/test";

test.describe("Chat Omnibar & Two-Column Artifacts E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Set session cookie for instant authentication
    await page.context().addCookies([
      {
        name: "sb-access-token",
        value: "mock-jwt-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // 2. Mock API session endpoint
    await page.route("**/auth/session*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: "d0000000-0000-0000-0000-000000000000",
              email: "chef@sous.tools",
            },
          },
        }),
      });
    });

    // 3. Mock notifications
    await page.route("**/notifications/unread*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // 4. Mock conversation list (endpoint is /commands/conversations)
    await page.route("**/commands/conversations*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "conv-1",
              title: "Inventory Stock Check",
              last_message: "Chicken stock is at 12 cases",
              updated_at: new Date().toISOString(),
            },
            {
              id: "conv-2",
              title: "Weekly Prep List",
              last_message: "Prep list ready",
              updated_at: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // 5. Mock conversation messages
    await page.route("**/commands/conversations/conv-1/messages*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "msg-1",
              role: "user",
              content: "How much chicken stock do we have?",
              timestamp: new Date().toISOString(),
            },
            {
              id: "msg-2",
              role: "model",
              content: "We currently have 12 cases of chicken stock in walk-in 1.",
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // 6. Mock dashboard stats
    await page.route("**/dashboard/stats*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            revenue: [
              { name: "Mon", value: 1200 },
              { name: "Tue", value: 1500 },
              { name: "Wed", value: 1800 },
            ],
            ticketTimes: [
              { time: "12:00", minutes: 8 },
              { time: "13:00", minutes: 12 },
            ],
          },
        }),
      });
    });

    // 7. Mock integrations status
    await page.route("**/integrations/status*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
  });

  test("should render home page with chat history sidebar when chat parameter is provided", async ({
    page,
  }) => {
    await page.goto("/home?chat=conv-1");

    // Conversation history sidebar should render
    const sidebar = page.locator('aside[aria-label="Conversation history"]');
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // Verify conversations heading & items
    await expect(sidebar.getByText("Conversations", { exact: true })).toBeVisible();
    await expect(sidebar.getByText("Inventory Stock Check")).toBeVisible();
    await expect(sidebar.getByText("Weekly Prep List")).toBeVisible();

    // Verify New Chat button exists
    const newChatBtn = sidebar.getByLabel("Start new chat");
    await expect(newChatBtn).toBeVisible();
  });

  test("should render Omnibar floating trigger and interact with input", async ({
    page,
  }) => {
    await page.goto("/home");

    // Omnibar trigger button or input pill
    const omniInput = page.getByRole("textbox", { name: /Ask your sous chef/i });
    await expect(omniInput).toBeVisible({ timeout: 10000 });

    // Type a question
    await omniInput.fill("What is our top selling dish this week?");
    await expect(omniInput).toHaveValue("What is our top selling dish this week?");
  });
});
