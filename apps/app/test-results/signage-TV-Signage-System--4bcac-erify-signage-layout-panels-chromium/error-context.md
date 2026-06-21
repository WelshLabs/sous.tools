# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: signage.spec.ts >> TV Signage System E2E >> should login, navigate dashboard, and verify signage layout panels
- Location: e2e/signage.spec.ts:4:7

# Error details

```
Error: page.goto: net::ERR_NETWORK_CHANGED at http://localhost:5001/login
Call log:
  - navigating to "http://localhost:5001/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('TV Signage System E2E', () => {
  4   |   test('should login, navigate dashboard, and verify signage layout panels', async ({ page }) => {
  5   |     // 1. Mock Supabase Auth API responses for offline/placeholder stability
  6   |     await page.route('**/auth/v1/token?grant_type=password', async route => {
  7   |       await route.fulfill({
  8   |         status: 200,
  9   |         contentType: 'application/json',
  10  |         body: JSON.stringify({
  11  |           access_token: 'mock-jwt-token',
  12  |           token_type: 'bearer',
  13  |           expires_in: 3600,
  14  |           refresh_token: 'mock-refresh-token',
  15  |           user: {
  16  |             id: 'd0000000-0000-0000-0000-000000000000',
  17  |             email: 'conar@dtown.cafe',
  18  |             role: 'authenticated',
  19  |             aud: 'authenticated',
  20  |           }
  21  |         })
  22  |       });
  23  |     });
  24  | 
  25  |     await page.route('**/auth/v1/user', async route => {
  26  |       await route.fulfill({
  27  |         status: 200,
  28  |         contentType: 'application/json',
  29  |         body: JSON.stringify({
  30  |           id: 'd0000000-0000-0000-0000-000000000000',
  31  |           email: 'conar@dtown.cafe',
  32  |           role: 'authenticated',
  33  |           aud: 'authenticated',
  34  |         })
  35  |       });
  36  |     });
  37  | 
  38  |     await page.route('**/api/signage/layouts', async route => {
  39  |       if (route.request().method() === 'POST') {
  40  |         await route.fulfill({
  41  |           status: 200,
  42  |           contentType: 'application/json',
  43  |           body: JSON.stringify({
  44  |             success: true,
  45  |             data: {
  46  |               id: 'deck-1',
  47  |               name: 'Deck 1',
  48  |               slug: 'deck-1',
  49  |               config: { slides: [] }
  50  |             }
  51  |           })
  52  |         });
  53  |       } else {
  54  |         await route.fulfill({
  55  |           status: 200,
  56  |           contentType: 'application/json',
  57  |           body: JSON.stringify({ success: true, data: [] })
  58  |         });
  59  |       }
  60  |     });
  61  | 
  62  |     await page.route('**/api/signage/layouts/deck-1', async route => {
  63  |       await route.fulfill({
  64  |         status: 200,
  65  |         contentType: 'application/json',
  66  |         body: JSON.stringify({
  67  |           success: true,
  68  |           data: {
  69  |             id: 'deck-1',
  70  |             name: 'Deck 1',
  71  |             slug: 'deck-1',
  72  |             config: { slides: [] }
  73  |           }
  74  |         })
  75  |       });
  76  |     });
  77  | 
  78  |     await page.route('**/api/pos/items', async route => {
  79  |       await route.fulfill({
  80  |         status: 200,
  81  |         contentType: 'application/json',
  82  |         body: JSON.stringify({ success: true, data: [] })
  83  |       });
  84  |     });
  85  | 
  86  |     // 2. Navigate to login page
> 87  |     await page.goto('/login');
      |                ^ Error: page.goto: net::ERR_NETWORK_CHANGED at http://localhost:5001/login
  88  |     await expect(page.locator('h1')).toContainText('Kitchen Login');
  89  | 
  90  |     // 3. Perform admin login
  91  |     await page.fill('input[type="email"]', 'conar@dtown.cafe');
  92  |     await page.fill('input[type="password"]', 'password');
  93  |     await page.click('button:has-text("Sign In")');
  94  | 
  95  |     // 4. Verify redirection to dashboard page
  96  |     await page.waitForURL('**/');
  97  |     await expect(page.locator('h1')).toContainText('Kitchen Dashboard');
  98  | 
  99  |     // 5. Verify responsive sidebar rendering and mobile hamburger trigger
  100 |     const hamburger = page.locator('button[aria-label="Close menu"]').first();
  101 |     await expect(hamburger).toBeVisible();
  102 | 
  103 |     // Check navigation links present in the sidebar
  104 |     const sidebar = page.locator('nav');
  105 |     await expect(sidebar).toContainText('Kitchen Dashboard');
  106 |     await expect(sidebar).toContainText('TV Signage');
  107 |     await expect(sidebar).toContainText('Devices');
  108 |     await expect(sidebar).toContainText('POS Simulator');
  109 | 
  110 |     // 6. Navigate to TV Signage layouts builder page
  111 |     await page.click('nav a:has-text("TV Signage")');
  112 |     await expect(page.locator('text=TV Signage').first()).toBeVisible({ timeout: 15000 });
  113 | 
  114 |     // Click button to create a deck and navigate to editor
  115 |     await page.click('button:has-text("Create Your First Deck")');
  116 |     await page.waitForURL('**/tv/deck-1');
  117 | 
  118 |     // Verify new WYSIWYG toolbar controls exist
  119 |     await expect(page.locator('#editor-top-bar-add-slide')).toBeVisible();
  120 |     await expect(page.locator('button:has-text("Styles")')).toBeVisible();
  121 |     await expect(page.locator('button:has-text("Preview")')).toBeVisible();
  122 |     await expect(page.locator('button:has-text("Save")')).toBeVisible();
  123 | 
  124 |     // 7. Verify the Styles panel opens on click
  125 |     await page.click('button:has-text("Styles")');
  126 |     await expect(page.locator('text=Slide Settings').first()).toBeVisible({ timeout: 5000 });
  127 | 
  128 |     // 8. Verify displays pairing list
  129 |     await page.click('nav a:has-text("Devices")');
  130 |     await expect(page.locator('h2')).toContainText('Display Manager');
  131 | 
  132 |     // 9. Go to POS Simulator tab and verify Mock POS Simulator renders
  133 |     await page.click('nav a:has-text("POS Simulator")');
  134 |     await expect(page.locator('h2')).toContainText('POS Simulator Panel');
  135 |   });
  136 | });
  137 | 
```