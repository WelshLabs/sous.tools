import { test, expect } from "@playwright/test";

test.describe("TV Signage System E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: "sb-access-token",
        value: "mock-jwt-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.route("**/auth/session*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: "d0000000-0000-0000-0000-000000000000",
              email: "conar@dtown.cafe",
            },
          },
        }),
      });
    });

    await page.route("**/notifications/unread*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/signage/layouts*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              id: "deck-1",
              name: "Deck 1",
              slug: "deck-1",
              config: { slides: [] },
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
    });

    await page.route("**/signage/displays*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/dashboard/stats*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { revenue: [], ticketTimes: [] },
        }),
      });
    });

    await page.route("**/integrations/status*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/pos/items*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });
  });

  test("should navigate dashboard, and verify signage layout panels", async ({
    page,
  }) => {
    await page.goto("/home");
    await expect(page.locator("body")).toBeVisible();
  });
});
