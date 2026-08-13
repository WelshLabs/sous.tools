import { test, expect } from "@playwright/test";

test.describe("Recipe Engine E2E", () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock Supabase Auth API
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
        }),
      });
    });

    // 2. Mock API endpoints for recipes/vessels
    await page.route("**/api/recipes/vessels", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "v-1",
              name: '9" Pullman Pan',
              shape: "RECTANGULAR",
              length: 23,
              width: 10,
              height: 10,
              volumeMl: 2300,
              createdAt: "",
            },
          ],
        }),
      });
    });

    await page.route("**/api/recipes/ingredients", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "i-1",
              name: "Bread Flour",
              densityGMl: 0.57,
              nutritionMacros: { calories: 364 },
              allergens: ["wheat"],
            },
          ],
        }),
      });
    });

    await page.route("**/api/recipes", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: "rec-1",
                title: "Traditional Sourdough",
                yieldCount: 2,
                yieldUnit: "loaves",
                instructions: [
                  {
                    stepNumber: 1,
                    text: "Mix flour and water.",
                    timerDurationSeconds: 300,
                  },
                ],
              },
            ],
          }),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: { id: "rec-1" } }),
        });
      }
    });

    await page.route("**/api/recipes/rec-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "rec-1",
            title: "Traditional Sourdough",
            yieldCount: 2,
            yieldUnit: "loaves",
            vesselId: "v-1",
            instructions: [
              {
                stepNumber: 1,
                text: "Mix flour and water.",
                timerDurationSeconds: 300,
              },
            ],
            vessel: {
              id: "v-1",
              name: '9" Pullman Pan',
              shape: "RECTANGULAR",
              volumeMl: 2300,
            },
            recipeIngredients: [
              {
                id: "ri-1",
                recipeId: "rec-1",
                masterIngredientId: "i-1",
                calculationType: "fixed_weight",
                baseCalculationGroup: true,
                amount: 500,
                unit: "g",
                prepNotes: "",
                masterIngredient: {
                  id: "i-1",
                  name: "Bread Flour",
                  densityGMl: 0.57,
                },
              },
            ],
          },
        }),
      });
    });
  });

  test("should navigate to recipes, view, scale, and start active kitchen mode", async ({
    page,
  }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[type="email"]', "conar@dtown.cafe");
    await page.fill('input[type="password"]', "password");
    await page.click('button:has-text("Sign In")');
    await page.waitForURL("**/");

    // Navigate to recipes list
    await page.click('nav a:has-text("Recipes")');
    await expect(page.locator("h2")).toContainText("Recipe Inventory");
    await expect(page.locator("h3")).toContainText("Traditional Sourdough");

    // View & Scale details
    await page.click('button:has-text("View & Scale")');
    await page.waitForURL("**/recipes/rec-1");
    await expect(page.locator("h2")).toContainText("Traditional Sourdough");
    await expect(
      page.locator('h3:has-text("Hybrid Scaling Tool")'),
    ).toBeVisible();

    // Trigger Active Kitchen Mode
    await page.click('button:has-text("Active Kitchen Mode")');
    await page.waitForURL("**/recipes/rec-1/kitchen");
    await expect(page.locator("h2")).toContainText("Traditional Sourdough");

    // Verify checklist checkoff works
    const stepCard = page.locator("main main > div").first();
    await stepCard.click();
    await expect(stepCard).toHaveClass(/opacity-40/);
  });

  test("should navigate to vessels manager and see list of vessels", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "conar@dtown.cafe");
    await page.fill('input[type="password"]', "password");
    await page.click('button:has-text("Sign In")');
    await page.waitForURL("**/");

    // Navigate to vessels manager
    await page.click('nav a:has-text("Vessels Manager")');
    await expect(page.locator("h2")).toContainText("Vessels Manager");
    await expect(page.locator("h3")).toContainText('9" Pullman Pan');
  });
});
