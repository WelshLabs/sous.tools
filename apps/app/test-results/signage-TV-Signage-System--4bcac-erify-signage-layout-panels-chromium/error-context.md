# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: signage.spec.ts >> TV Signage System E2E >> should login, navigate dashboard, and verify signage layout panels
- Location: e2e/signage.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
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
  39  |       await route.fulfill({
  40  |         status: 200,
  41  |         contentType: 'application/json',
  42  |         body: JSON.stringify({ success: true, data: [] })
  43  |       });
  44  |     });
  45  | 
  46  |     await page.route('**/api/pos/items', async route => {
  47  |       await route.fulfill({
  48  |         status: 200,
  49  |         contentType: 'application/json',
  50  |         body: JSON.stringify({ success: true, data: [] })
  51  |       });
  52  |     });
  53  | 
  54  |     // 2. Navigate to login page
> 55  |     await page.goto('/login');
      |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  56  |     await expect(page.locator('h1')).toContainText('Kitchen Login');
  57  | 
  58  |     // 3. Perform admin login
  59  |     await page.fill('input[type="email"]', 'conar@dtown.cafe');
  60  |     await page.fill('input[type="password"]', 'password');
  61  |     await page.click('button:has-text("Sign In")');
  62  | 
  63  |     // 4. Verify redirection to dashboard page
  64  |     await page.waitForURL('**/');
  65  |     await expect(page.locator('h1')).toContainText('Kitchen Dashboard');
  66  | 
  67  |     // 5. Verify responsive sidebar rendering and mobile hamburger trigger
  68  |     const hamburger = page.locator('button[aria-label="Close menu"]').first();
  69  |     await expect(hamburger).toBeVisible();
  70  | 
  71  |     // Check navigation links present in the sidebar
  72  |     const sidebar = page.locator('nav');
  73  |     await expect(sidebar).toContainText('Kitchen Dashboard');
  74  |     await expect(sidebar).toContainText('TV Signage');
  75  |     await expect(sidebar).toContainText('Devices');
  76  |     await expect(sidebar).toContainText('POS Simulator');
  77  | 
  78  |     // 6. Navigate to TV Signage layouts builder page
  79  |     await page.click('nav a:has-text("TV Signage")');
  80  |     await expect(page.locator('text=TV Signage').first()).toBeVisible({ timeout: 15000 });
  81  | 
  82  |     // Verify new WYSIWYG toolbar controls exist
  83  |     await expect(page.locator('#editor-top-bar-add-slide')).toBeVisible();
  84  |     await expect(page.locator('button:has-text("Styles")')).toBeVisible();
  85  |     await expect(page.locator('button:has-text("Preview")')).toBeVisible();
  86  |     await expect(page.locator('button:has-text("Save")')).toBeVisible();
  87  | 
  88  |     // 7. Verify the Styles panel opens on click
  89  |     await page.click('button:has-text("Styles")');
  90  |     await expect(page.locator('text=Slide Settings').first()).toBeVisible({ timeout: 5000 });
  91  | 
  92  |     // 8. Verify displays pairing list
  93  |     await page.click('nav a:has-text("Devices")');
  94  |     await expect(page.locator('h2')).toContainText('Display Manager');
  95  | 
  96  |     // 9. Go to POS Simulator tab and verify Mock POS Simulator renders
  97  |     await page.click('nav a:has-text("POS Simulator")');
  98  |     await expect(page.locator('h2')).toContainText('POS Simulator Panel');
  99  |   });
  100 | });
  101 | 
```