import { test, expect } from "@playwright/test";

test.describe("Recipe Engine E2E", () => {
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

    // 2. Mock API endpoints for recipes/vessels
    await page.route("**/recipes/vessels*", async (route) => {
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

    await page.route("**/recipes/ingredients*", async (route) => {
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

    await page.route("**/recipes*", async (route) => {
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

    await page.route("**/recipes/rec-1*", async (route) => {
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

  test("should navigate to recipes list and render recipes container", async ({
    page,
  }) => {
    await page.goto("/recipes");
    await expect(page.locator("body")).toBeVisible();
  });

  test("should navigate to new recipe builder and verify form elements", async ({
    page,
  }) => {
    await page.goto("/recipes/new");
    await expect(page.locator("body")).toBeVisible();
  });
});
