# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recipe.spec.ts >> Recipe Engine E2E >> should navigate to recipes, view, scale, and start active kitchen mode
- Location: e2e/recipe.spec.ts:105:7

# Error details

```
Error: page.goto: net::ERR_NETWORK_CHANGED at http://localhost:5001/login
Call log:
  - navigating to "http://localhost:5001/login", waiting until "load"

```

# Test source

```ts
  7   |       await route.fulfill({
  8   |         status: 200,
  9   |         contentType: 'application/json',
  10  |         body: JSON.stringify({
  11  |           access_token: 'mock-jwt-token',
  12  |           token_type: 'bearer',
  13  |           expires_in: 3600,
  14  |           refresh_token: 'mock-refresh-token',
  15  |           user: { id: 'd0000000-0000-0000-0000-000000000000', email: 'conar@dtown.cafe', role: 'authenticated' }
  16  |         })
  17  |       });
  18  |     });
  19  | 
  20  |     await page.route('**/auth/v1/user', async route => {
  21  |       await route.fulfill({
  22  |         status: 200,
  23  |         contentType: 'application/json',
  24  |         body: JSON.stringify({ id: 'd0000000-0000-0000-0000-000000000000', email: 'conar@dtown.cafe', role: 'authenticated' })
  25  |       });
  26  |     });
  27  | 
  28  |     // 2. Mock API endpoints for recipes/vessels
  29  |     await page.route('**/api/recipes/vessels', async route => {
  30  |       await route.fulfill({
  31  |         status: 200,
  32  |         contentType: 'application/json',
  33  |         body: JSON.stringify({
  34  |           success: true,
  35  |           data: [
  36  |             { id: 'v-1', name: '9" Pullman Pan', shape: 'RECTANGULAR', length: 23, width: 10, height: 10, volumeMl: 2300, createdAt: '' }
  37  |           ]
  38  |         })
  39  |       });
  40  |     });
  41  | 
  42  |     await page.route('**/api/recipes/ingredients', async route => {
  43  |       await route.fulfill({
  44  |         status: 200,
  45  |         contentType: 'application/json',
  46  |         body: JSON.stringify({
  47  |           success: true,
  48  |           data: [
  49  |             { id: 'i-1', name: 'Bread Flour', densityGMl: 0.57, nutritionMacros: { calories: 364 }, allergens: ['wheat'] }
  50  |           ]
  51  |         })
  52  |       });
  53  |     });
  54  | 
  55  |     await page.route('**/api/recipes', async route => {
  56  |       if (route.request().method() === 'GET') {
  57  |         await route.fulfill({
  58  |           status: 200,
  59  |           contentType: 'application/json',
  60  |           body: JSON.stringify({
  61  |             success: true,
  62  |             data: [
  63  |               {
  64  |                 id: 'rec-1',
  65  |                 title: 'Traditional Sourdough',
  66  |                 yieldCount: 2,
  67  |                 yieldUnit: 'loaves',
  68  |                 instructions: [{ stepNumber: 1, text: 'Mix flour and water.', timerDurationSeconds: 300 }]
  69  |               }
  70  |             ]
  71  |           })
  72  |         });
  73  |       } else if (route.request().method() === 'POST') {
  74  |         await route.fulfill({
  75  |           status: 200,
  76  |           contentType: 'application/json',
  77  |           body: JSON.stringify({ success: true, data: { id: 'rec-1' } })
  78  |         });
  79  |       }
  80  |     });
  81  | 
  82  |     await page.route('**/api/recipes/rec-1', async route => {
  83  |       await route.fulfill({
  84  |         status: 200,
  85  |         contentType: 'application/json',
  86  |         body: JSON.stringify({
  87  |           success: true,
  88  |           data: {
  89  |             id: 'rec-1',
  90  |             title: 'Traditional Sourdough',
  91  |             yieldCount: 2,
  92  |             yieldUnit: 'loaves',
  93  |             vesselId: 'v-1',
  94  |             instructions: [{ stepNumber: 1, text: 'Mix flour and water.', timerDurationSeconds: 300 }],
  95  |             vessel: { id: 'v-1', name: '9" Pullman Pan', shape: 'RECTANGULAR', volumeMl: 2300 },
  96  |             recipeIngredients: [
  97  |               { id: 'ri-1', recipeId: 'rec-1', masterIngredientId: 'i-1', calculationType: 'fixed_weight', baseCalculationGroup: true, amount: 500, unit: 'g', prepNotes: '', masterIngredient: { id: 'i-1', name: 'Bread Flour', densityGMl: 0.57 } }
  98  |             ]
  99  |           }
  100 |         })
  101 |       });
  102 |     });
  103 |   });
  104 | 
  105 |   test('should navigate to recipes, view, scale, and start active kitchen mode', async ({ page }) => {
  106 |     // Login
> 107 |     await page.goto('/login');
      |                ^ Error: page.goto: net::ERR_NETWORK_CHANGED at http://localhost:5001/login
  108 |     await page.fill('input[type="email"]', 'conar@dtown.cafe');
  109 |     await page.fill('input[type="password"]', 'password');
  110 |     await page.click('button:has-text("Sign In")');
  111 |     await page.waitForURL('**/');
  112 | 
  113 |     // Navigate to recipes list
  114 |     await page.click('nav a:has-text("Recipes")');
  115 |     await expect(page.locator('h2')).toContainText('Recipe Inventory');
  116 |     await expect(page.locator('h3')).toContainText('Traditional Sourdough');
  117 | 
  118 |     // View & Scale details
  119 |     await page.click('button:has-text("View & Scale")');
  120 |     await page.waitForURL('**/recipes/rec-1');
  121 |     await expect(page.locator('h2')).toContainText('Traditional Sourdough');
  122 |     await expect(page.locator('h3:has-text("Hybrid Scaling Tool")')).toBeVisible();
  123 | 
  124 |     // Trigger Active Kitchen Mode
  125 |     await page.click('button:has-text("Active Kitchen Mode")');
  126 |     await page.waitForURL('**/recipes/rec-1/kitchen');
  127 |     await expect(page.locator('h2')).toContainText('Traditional Sourdough');
  128 | 
  129 |     // Verify checklist checkoff works
  130 |     const stepCard = page.locator('main main > div').first();
  131 |     await stepCard.click();
  132 |     await expect(stepCard).toHaveClass(/opacity-40/);
  133 |   });
  134 | 
  135 |   test('should navigate to vessels manager and see list of vessels', async ({ page }) => {
  136 |     await page.goto('/login');
  137 |     await page.fill('input[type="email"]', 'conar@dtown.cafe');
  138 |     await page.fill('input[type="password"]', 'password');
  139 |     await page.click('button:has-text("Sign In")');
  140 |     await page.waitForURL('**/');
  141 | 
  142 |     // Navigate to vessels manager
  143 |     await page.click('nav a:has-text("Vessels Manager")');
  144 |     await expect(page.locator('h2')).toContainText('Vessels Manager');
  145 |     await expect(page.locator('h3')).toContainText('9" Pullman Pan');
  146 |   });
  147 | });
  148 | 
```