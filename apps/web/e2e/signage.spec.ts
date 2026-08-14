import { test, expect } from "@playwright/test";

test.describe("TV Signage System E2E", () => {
  test("should login, navigate dashboard, and verify signage layout panels", async ({
    page,
  }) => {
    // 1. Mock Supabase Auth API responses for offline/placeholder stability
    await page.route("**/auth/v1/token?grant_type=password", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-jwt-token",
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token",
          user: {
            id: "d0000000-0000-0000-0000-000000000000",
            email: "conar@dtown.cafe",
            role: "authenticated",
            aud: "authenticated",
          },
        }),
      });
    });

    await page.route("**/auth/v1/user", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "d0000000-0000-0000-0000-000000000000",
          email: "conar@dtown.cafe",
          role: "authenticated",
          aud: "authenticated",
        }),
      });
    });

    await page.route("**/api/signage/layouts", async (route) => {
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

    await page.route("**/api/signage/layouts/deck-1", async (route) => {
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
    });

    await page.route("**/api/pos/items", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    // 2. Navigate to login page
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Kitchen Login");

    // 3. Perform admin login
    await page.fill('input[type="email"]', "conar@dtown.cafe");
    await page.fill('input[type="password"]', "password");
    await page.click('button:has-text("Sign In")');

    // 4. Verify redirection to dashboard page
    await page.waitForURL("**/");
    await expect(page.locator("h1")).toContainText("Kitchen Dashboard");

    // 5. Verify responsive sidebar rendering and mobile hamburger trigger
    const hamburger = page.locator('button[aria-label="Close menu"]').first();
    await expect(hamburger).toBeVisible();

    // Check navigation links present in the sidebar
    const sidebar = page.locator("nav");
    await expect(sidebar).toContainText("Kitchen Dashboard");
    await expect(sidebar).toContainText("TV Signage");
    await expect(sidebar).toContainText("Devices");
    await expect(sidebar).toContainText("POS Simulator");

    // 6. Navigate to TV Signage layouts builder page
    await page.click('nav a:has-text("TV Signage")');
    await expect(page.locator("text=TV Signage").first()).toBeVisible({
      timeout: 15000,
    });

    // Click button to create a deck and navigate to editor
    await page.click('button:has-text("Create Your First Deck")');
    await page.waitForURL("**/tv/deck-1");

    // Verify new WYSIWYG toolbar controls exist
    await expect(page.locator("#editor-top-bar-add-slide")).toBeVisible();
    await expect(page.locator('button:has-text("Styles")')).toBeVisible();
    await expect(page.locator('button:has-text("Preview")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();

    // 7. Verify the Styles panel opens on click
    await page.click('button:has-text("Styles")');
    await expect(page.locator("text=Slide Settings").first()).toBeVisible({
      timeout: 5000,
    });

    // 8. Verify displays pairing list
    await page.click('nav a:has-text("Devices")');
    await expect(page.locator("h2")).toContainText("Display Manager");

    // 9. Go to POS Simulator tab and verify Mock POS Simulator renders
    await page.click('nav a:has-text("POS Simulator")');
    await expect(page.locator("h2")).toContainText("POS Simulator Panel");
  });
});
