# Architectural Audit: Direct HTTP Fetch Violations

**Date:** 7/15/2026
**Scope:** Frontend Apps and Domain Packages (excluding \`packages/api-client\`, \`apps/api\`, \`apps/cli\`)
**Rule:** All frontend network requests must go through our unified \`packages/api-client\`. Native \`fetch()\` or \`axios\` is strictly prohibited.

## Summary of Violations

Found **112** violation(s) across the frontend apps and domain packages.

| File Path | Line Number | Code Snippet |
| :--- | :--- | :--- |
| \`apps/pos-simulator/src/components/PosSimulator.tsx\` | 19 | \`const res = await fetch("/api/pos/items");\` |
| \`apps/pos-simulator/src/components/PosSimulator.tsx\` | 48 | \`const res = await fetch("/api/pos/simulate-webhook", {\` |
| \`apps/web/src/app/(fullscreen)/kds/page.tsx\` | 90 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/organizations?limit=1\`);\` |
| \`apps/web/src/app/(fullscreen)/kds/page.tsx\` | 105 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/pos-items\`);\` |
| \`apps/web/src/app/(fullscreen)/kds/page.tsx\` | 130 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/pos/orders\`);\` |
| \`apps/web/src/app/(fullscreen)/kds/page.tsx\` | 201 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/pos-transactions/bulk\`, {\` |
| \`apps/web/src/app/(fullscreen)/kds/page.tsx\` | 219 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/pos-items/${itemId}\`, {\` |
| \`apps/web/src/app/(fullscreen)/recipes/[id]/kitchen/page.tsx\` | 14 | \`const res = await fetch(\`${baseUrl}/recipes/${id}\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` | 33 | \`const res = await fetch(\`/api/ingestion/${id}\`);\` |
| \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` | 86 | \`const res = await fetch(\`/api/ingestion/review/${id}/commit\`, {\` |
| \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` | 103 | \`const res = await fetch(\`/api/ingestion/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/@modal/signage/[deckId]/preview/page.tsx\` | 36 | \`fetch(\`/api/signage/layouts/${deckId}\`)\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 22 | \`await fetch("/api/signage/displays", {\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 31 | \`await fetch(\`/api/signage/displays/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 36 | \`await fetch(\`/api/signage/displays/${displayId}\`, {\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 45 | \`await fetch("/api/signage/displays/pair/confirm", {\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 54 | \`await fetch(\`/api/signage/devices/${deviceId}\`, {\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 63 | \`const res = await fetch(\`/api/signage/devices/${deviceId}\`);\` |
| \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` | 69 | \`await fetch(\`/api/devices/${id}/revoke\`, { method: "POST" });\` |
| \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` | 19 | \`fetch(\`${baseUrl}/signage/displays\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` | 20 | \`fetch(\`${baseUrl}/signage/layouts\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` | 21 | \`fetch(\`${baseUrl}/devices\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/catalog/CatalogView.tsx\` | 74 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos-simulator/items/${editingItem.id}\`, {\` |
| \`apps/web/src/app/(workspace)/catalog/page.tsx\` | 10 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos/catalog\`, { cache: 'no-store' });\` |
| \`apps/web/src/app/(workspace)/dashboard/page.tsx\` | 31 | \`const res = await fetch(\`${baseUrl}/dashboard/stats\`, {\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` | 29 | \`const res = await fetch(\`/api/ingestion/${id}\`);\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` | 81 | \`const res = await fetch(\`/api/ingestion/review/${id}/commit\`, {\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` | 98 | \`const res = await fetch(\`/api/ingestion/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` | 112 | \`const res = await fetch("/api/ingestion/alias", {\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/use-visual-builder-data.ts\` | 10 | \`const res = await fetch("/api/items");\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/use-visual-builder-data.ts\` | 24 | \`const res = await fetch("/api/vendors");\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` | 24 | \`const res = await fetch("/api/items", {\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` | 56 | \`const res = await fetch("/api/items", {\` |
| \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` | 150 | \`const res = await fetch("/api/vendors", {\` |
| \`apps/web/src/app/(workspace)/inventory/@modal/(.)vendors/add/page.tsx\` | 38 | \`const res = await fetch("/api/vendors", {\` |
| \`apps/web/src/app/(workspace)/inventory/invoices/page.tsx\` | 78 | \`const res = await fetch("/api/ingestion/submit", {\` |
| \`apps/web/src/app/(workspace)/inventory/invoices/page.tsx\` | 143 | \`const res = await fetch(\`/api/integrations/google-drive/search?q=${encodeURIComponent(query)}&folderId=${folderId \|\| ""}\`);\` |
| \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` | 31 | \`const res = await fetch(url, {\` |
| \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` | 50 | \`const res = await fetch(\`/api/items/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` | 62 | \`const res = await fetch(\`/api/recipes/usda/search?query=${encodeURIComponent(query)}\`);\` |
| \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` | 109 | \`await fetch("/api/items", {\` |
| \`apps/web/src/app/(workspace)/inventory/items/page.tsx\` | 12 | \`const res = await fetch(\`${baseUrl}/items\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 22 | \`const res = await fetch("/api/purchase-orders/draft-item", {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 33 | \`const res = await fetch("/api/whiteboard", {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 52 | \`const res = await fetch(\`/api/purchase-orders/items/${itemId}\`, {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 66 | \`const res = await fetch(\`/api/whiteboard/${id}\`, {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 71 | \`const res = await fetch(\`/api/purchase-orders/items/${id}\`, {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 83 | \`const res = await fetch(\`/api/purchase-orders/${poId}/submit\`, {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 98 | \`await fetch(\`/api/whiteboard/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 100 | \`await fetch(\`/api/purchase-orders/items/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 105 | \`await fetch("/api/purchase-orders/draft-item", {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` | 111 | \`await fetch("/api/whiteboard", {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/[id]/shop/page.tsx\` | 23 | \`const res = await fetch(\` |
| \`apps/web/src/app/(workspace)/inventory/orders/[id]/shop/page.tsx\` | 175 | \`const res = await fetch("/api/ingestion", {\` |
| \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` | 14 | \`fetch(\`${baseUrl}/vendors\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` | 15 | \`fetch(\`${baseUrl}/whiteboard\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` | 16 | \`fetch(\`${baseUrl}/purchase-orders\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/inventory/vendors/add/page.tsx\` | 31 | \`const res = await fetch("/api/vendors", {\` |
| \`apps/web/src/app/(workspace)/inventory/vendors/page.tsx\` | 11 | \`const res = await fetch(\`${baseUrl}/vendors\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/inventory/vendors/vendors-client.tsx\` | 21 | \`const res = await fetch(url, {\` |
| \`apps/web/src/app/(workspace)/inventory/vendors/vendors-client.tsx\` | 39 | \`const res = await fetch(\`/api/vendors/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/layout.tsx\` | 15 | \`const res = await fetch(\`${process.env.API_BASE_URL \|\| process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:6001'}/notifications/unread\`, {\` |
| \`apps/web/src/app/(workspace)/pos-orders/page.tsx\` | 10 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos/orders\`, { cache: 'no-store' });\` |
| \`apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx\` | 26 | \`fetch('/api/recipes/ingredients')\` |
| \`apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx\` | 42 | \`const res = await fetch(url, {\` |
| \`apps/web/src/app/(workspace)/recipes/RecipesClientPage.tsx\` | 14 | \`const res = await fetch(\`/api/recipes/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx\` | 33 | \`fetch('/api/recipes/ingredients')\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx\` | 94 | \`const res = await fetch(\`/api/recipes/${recipe.id}/cost?wastePct=${wastePct}&portions=${portions}\`);\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` | 18 | \`fetch(\`${baseUrl}/recipes/${id}\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` | 19 | \`fetch(\`${baseUrl}/recipes/vessels\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` | 20 | \`fetch(\`${baseUrl}/recipes/ingredients\`, { cache: "no-store" })\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` | 20 | \`fetch(\`${baseUrl}/recipes/${id}\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` | 21 | \`fetch(\`${baseUrl}/recipes/vessels\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` | 22 | \`fetch(\`${baseUrl}/recipes/${id}/cost\`, { cache: "no-store" }).catch(() => null),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` | 23 | \`fetch(\`${baseUrl}/recipes/${id}/nutrition\`, { cache: "no-store" }).catch(() => null),\` |
| \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` | 24 | \`fetch(\`${baseUrl}/recipes/${id}/versions\`, { cache: "no-store" }).catch(() => null)\` |
| \`apps/web/src/app/(workspace)/recipes/new/page.tsx\` | 14 | \`fetch(\`${baseUrl}/recipes/vessels\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/recipes/new/page.tsx\` | 15 | \`fetch(\`${baseUrl}/recipes/ingredients\`, { cache: "no-store" })\` |
| \`apps/web/src/app/(workspace)/recipes/page.tsx\` | 11 | \`const res = await fetch(\`${baseUrl}/recipes\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/settings/page.tsx\` | 11 | \`const res = await fetch(\`${baseUrl}/integrations/status\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/settings/settings-client.tsx\` | 67 | \`const res = await fetch(\`/api/integrations/disconnect/${provider.toLowerCase()}?orgId=default\`, {\` |
| \`apps/web/src/app/(workspace)/settings/settings-client.tsx\` | 75 | \`const res = await fetch(\`/api/integrations/square/${action}?orgId=default\`, {\` |
| \`apps/web/src/app/(workspace)/signage/[deckId]/page.tsx\` | 19 | \`fetch(\`${baseUrl}/signage/layouts/${deckId}\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/signage/[deckId]/page.tsx\` | 20 | \`fetch(\`${baseUrl}/pos-simulator/items\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/(workspace)/signage/[deckId]/preview/page.tsx\` | 20 | \`const res = await fetch(\`${base}/api/signage/layouts/${deckId}\`, {\` |
| \`apps/web/src/app/(workspace)/signage/[deckId]/tv-signage-editor-client.tsx\` | 73 | \`const res = await fetch(\`/api/signage/layouts/${deckId}\`, {\` |
| \`apps/web/src/app/(workspace)/signage/[deckId]/tv-signage-editor-client.tsx\` | 92 | \`const res = await fetch(\`/api/signage/layouts/${deckId}\`, {\` |
| \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` | 31 | \`const res = await fetch("/api/signage/layouts", {\` |
| \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` | 58 | \`const res = await fetch(\`/api/signage/layouts/${deckToDelete}\`, {\` |
| \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` | 78 | \`const res = await fetch(\`/api/signage/layouts/${id}\`, {\` |
| \`apps/web/src/app/(workspace)/signage/page.tsx\` | 12 | \`const res = await fetch(\`${baseUrl}/signage/layouts\`, { cache: "no-store" });\` |
| \`apps/web/src/app/(workspace)/team/page.tsx\` | 26 | \`const response = await fetch("/api/devices/pair/confirm", {\` |
| \`apps/web/src/app/(workspace)/transactions/page.tsx\` | 10 | \`const res = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos/transactions\`, { cache: 'no-store' });\` |
| \`apps/web/src/app/(workspace)/vendors/page.tsx\` | 19 | \`const res = await fetch("/api/vendors");\` |
| \`apps/web/src/app/(workspace)/vendors/page.tsx\` | 41 | \`const res = await fetch("/api/vendors", {\` |
| \`apps/web/src/app/(workspace)/vendors/page.tsx\` | 68 | \`const res = await fetch(\`/api/vendors/${id}\`, { method: "DELETE" });\` |
| \`apps/web/src/app/actions/auth.ts\` | 8 | \`await fetch(\`${process.env.API_BASE_URL \|\| process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:3001'}/auth/logout\`, {\` |
| \`apps/web/src/app/display/[id]/blocks/modifier-group-block.tsx\` | 43 | \`const resGrp = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos-modifier-groups/${modifierGroupId}\`);\` |
| \`apps/web/src/app/display/[id]/blocks/modifier-group-block.tsx\` | 52 | \`const resOpts = await fetch(\`${process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:6001"}/pos-modifier-groups/${modifierGroupId}/options\`);\` |
| \`apps/web/src/app/display/[id]/helpers.ts\` | 48 | \`const res = await fetch(registerUrl, {\` |
| \`apps/web/src/app/display/[id]/page.tsx\` | 26 | \`const displayRes = await fetch(\`${baseUrl}/signage/displays/${displayId}\`, { cache: "no-store" });\` |
| \`apps/web/src/app/display/[id]/page.tsx\` | 44 | \`fetch(\`${baseUrl}/signage/layouts/${initialDisplay.deckId}\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/display/[id]/page.tsx\` | 45 | \`fetch(\`${baseUrl}/pos-simulator/items?organizationId=${initialDisplay.organizationId}\`, { cache: "no-store" }),\` |
| \`apps/web/src/app/display/[id]/use-display-player.ts\` | 32 | \`const displayRes = await fetch(\`/api/signage/displays/${displayId}\`);\` |
| \`apps/web/src/app/display/[id]/use-display-player.ts\` | 55 | \`fetch(\`/api/signage/layouts/${displayObj.deckId}\`),\` |
| \`apps/web/src/app/display/[id]/use-display-player.ts\` | 56 | \`fetch(\`/api/pos/items?organizationId=${displayObj.organizationId}\`),\` |
| \`apps/web/src/components/GoogleDriveBrowserWrapper.tsx\` | 13 | \`const res = await fetch(\`/api/integrations/google/files?q=${encodeURIComponent(query)}&folderId=${folderId \|\| ""}\`);\` |
| \`apps/web/src/components/GoogleDriveBrowserWrapper.tsx\` | 33 | \`const res = await fetch("/api/integrations/google/import-file", {\` |
| \`packages/domain-pos/src/components/POSRegister/pos.container.tsx\` | 181 | \`const res = await fetch("/api/integrations/checkout", {\` |
| \`packages/domain-recipes/src/ComplianceSearch.tsx\` | 89 | \`const res = await fetch(\` |
| \`packages/logger/src/browser.ts\` | 11 | \`fetch(url, {\` |
| \`packages/logger/src/browser.ts\` | 56 | \`fetch('https://log-api.newrelic.com/log/v1', {\` |


## Detailed Violations Log

### 1. \`apps/pos-simulator/src/components/PosSimulator.tsx\` (Line 19)
```typescript
const res = await fetch("/api/pos/items");
```

### 2. \`apps/pos-simulator/src/components/PosSimulator.tsx\` (Line 48)
```typescript
const res = await fetch("/api/pos/simulate-webhook", {
```

### 3. \`apps/web/src/app/(fullscreen)/kds/page.tsx\` (Line 90)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/organizations?limit=1`);
```

### 4. \`apps/web/src/app/(fullscreen)/kds/page.tsx\` (Line 105)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/pos-items`);
```

### 5. \`apps/web/src/app/(fullscreen)/kds/page.tsx\` (Line 130)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/pos/orders`);
```

### 6. \`apps/web/src/app/(fullscreen)/kds/page.tsx\` (Line 201)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/pos-transactions/bulk`, {
```

### 7. \`apps/web/src/app/(fullscreen)/kds/page.tsx\` (Line 219)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/pos-items/${itemId}`, {
```

### 8. \`apps/web/src/app/(fullscreen)/recipes/[id]/kitchen/page.tsx\` (Line 14)
```typescript
const res = await fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" });
```

### 9. \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` (Line 33)
```typescript
const res = await fetch(`/api/ingestion/${id}`);
```

### 10. \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` (Line 86)
```typescript
const res = await fetch(`/api/ingestion/review/${id}/commit`, {
```

### 11. \`apps/web/src/app/(workspace)/@modal/(.)ingestion/review/[id]/page.tsx\` (Line 103)
```typescript
const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
```

### 12. \`apps/web/src/app/(workspace)/@modal/signage/[deckId]/preview/page.tsx\` (Line 36)
```typescript
fetch(`/api/signage/layouts/${deckId}`)
```

### 13. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 22)
```typescript
await fetch("/api/signage/displays", {
```

### 14. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 31)
```typescript
await fetch(`/api/signage/displays/${id}`, { method: "DELETE" });
```

### 15. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 36)
```typescript
await fetch(`/api/signage/displays/${displayId}`, {
```

### 16. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 45)
```typescript
await fetch("/api/signage/displays/pair/confirm", {
```

### 17. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 54)
```typescript
await fetch(`/api/signage/devices/${deviceId}`, {
```

### 18. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 63)
```typescript
const res = await fetch(`/api/signage/devices/${deviceId}`);
```

### 19. \`apps/web/src/app/(workspace)/admin/devices/devices-client-wrapper.tsx\` (Line 69)
```typescript
await fetch(`/api/devices/${id}/revoke`, { method: "POST" });
```

### 20. \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` (Line 19)
```typescript
fetch(`${baseUrl}/signage/displays`, { cache: "no-store" }),
```

### 21. \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` (Line 20)
```typescript
fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" }),
```

### 22. \`apps/web/src/app/(workspace)/admin/devices/page.tsx\` (Line 21)
```typescript
fetch(`${baseUrl}/devices`, { cache: "no-store" }),
```

### 23. \`apps/web/src/app/(workspace)/catalog/CatalogView.tsx\` (Line 74)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos-simulator/items/${editingItem.id}`, {
```

### 24. \`apps/web/src/app/(workspace)/catalog/page.tsx\` (Line 10)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/catalog`, { cache: 'no-store' });
```

### 25. \`apps/web/src/app/(workspace)/dashboard/page.tsx\` (Line 31)
```typescript
const res = await fetch(`${baseUrl}/dashboard/stats`, {
```

### 26. \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` (Line 29)
```typescript
const res = await fetch(`/api/ingestion/${id}`);
```

### 27. \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` (Line 81)
```typescript
const res = await fetch(`/api/ingestion/review/${id}/commit`, {
```

### 28. \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` (Line 98)
```typescript
const res = await fetch(`/api/ingestion/${id}`, { method: "DELETE" });
```

### 29. \`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx\` (Line 112)
```typescript
const res = await fetch("/api/ingestion/alias", {
```

### 30. \`apps/web/src/app/(workspace)/ingestion/review/[id]/use-visual-builder-data.ts\` (Line 10)
```typescript
const res = await fetch("/api/items");
```

### 31. \`apps/web/src/app/(workspace)/ingestion/review/[id]/use-visual-builder-data.ts\` (Line 24)
```typescript
const res = await fetch("/api/vendors");
```

### 32. \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` (Line 24)
```typescript
const res = await fetch("/api/items", {
```

### 33. \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` (Line 56)
```typescript
const res = await fetch("/api/items", {
```

### 34. \`apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx\` (Line 150)
```typescript
const res = await fetch("/api/vendors", {
```

### 35. \`apps/web/src/app/(workspace)/inventory/@modal/(.)vendors/add/page.tsx\` (Line 38)
```typescript
const res = await fetch("/api/vendors", {
```

### 36. \`apps/web/src/app/(workspace)/inventory/invoices/page.tsx\` (Line 78)
```typescript
const res = await fetch("/api/ingestion/submit", {
```

### 37. \`apps/web/src/app/(workspace)/inventory/invoices/page.tsx\` (Line 143)
```typescript
const res = await fetch(`/api/integrations/google-drive/search?q=${encodeURIComponent(query)}&folderId=${folderId || ""}`);
```

### 38. \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` (Line 31)
```typescript
const res = await fetch(url, {
```

### 39. \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` (Line 50)
```typescript
const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
```

### 40. \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` (Line 62)
```typescript
const res = await fetch(`/api/recipes/usda/search?query=${encodeURIComponent(query)}`);
```

### 41. \`apps/web/src/app/(workspace)/inventory/items/items-ledger-client.tsx\` (Line 109)
```typescript
await fetch("/api/items", {
```

### 42. \`apps/web/src/app/(workspace)/inventory/items/page.tsx\` (Line 12)
```typescript
const res = await fetch(`${baseUrl}/items`, { cache: "no-store" });
```

### 43. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 22)
```typescript
const res = await fetch("/api/purchase-orders/draft-item", {
```

### 44. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 33)
```typescript
const res = await fetch("/api/whiteboard", {
```

### 45. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 52)
```typescript
const res = await fetch(`/api/purchase-orders/items/${itemId}`, {
```

### 46. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 66)
```typescript
const res = await fetch(`/api/whiteboard/${id}`, {
```

### 47. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 71)
```typescript
const res = await fetch(`/api/purchase-orders/items/${id}`, {
```

### 48. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 83)
```typescript
const res = await fetch(`/api/purchase-orders/${poId}/submit`, {
```

### 49. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 98)
```typescript
await fetch(`/api/whiteboard/${id}`, { method: "DELETE" });
```

### 50. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 100)
```typescript
await fetch(`/api/purchase-orders/items/${id}`, { method: "DELETE" });
```

### 51. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 105)
```typescript
await fetch("/api/purchase-orders/draft-item", {
```

### 52. \`apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx\` (Line 111)
```typescript
await fetch("/api/whiteboard", {
```

### 53. \`apps/web/src/app/(workspace)/inventory/orders/[id]/shop/page.tsx\` (Line 23)
```typescript
const res = await fetch(
```

### 54. \`apps/web/src/app/(workspace)/inventory/orders/[id]/shop/page.tsx\` (Line 175)
```typescript
const res = await fetch("/api/ingestion", {
```

### 55. \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` (Line 14)
```typescript
fetch(`${baseUrl}/vendors`, { cache: "no-store" }),
```

### 56. \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` (Line 15)
```typescript
fetch(`${baseUrl}/whiteboard`, { cache: "no-store" }),
```

### 57. \`apps/web/src/app/(workspace)/inventory/orders/page.tsx\` (Line 16)
```typescript
fetch(`${baseUrl}/purchase-orders`, { cache: "no-store" }),
```

### 58. \`apps/web/src/app/(workspace)/inventory/vendors/add/page.tsx\` (Line 31)
```typescript
const res = await fetch("/api/vendors", {
```

### 59. \`apps/web/src/app/(workspace)/inventory/vendors/page.tsx\` (Line 11)
```typescript
const res = await fetch(`${baseUrl}/vendors`, { cache: "no-store" });
```

### 60. \`apps/web/src/app/(workspace)/inventory/vendors/vendors-client.tsx\` (Line 21)
```typescript
const res = await fetch(url, {
```

### 61. \`apps/web/src/app/(workspace)/inventory/vendors/vendors-client.tsx\` (Line 39)
```typescript
const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
```

### 62. \`apps/web/src/app/(workspace)/layout.tsx\` (Line 15)
```typescript
const res = await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/notifications/unread`, {
```

### 63. \`apps/web/src/app/(workspace)/pos-orders/page.tsx\` (Line 10)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/orders`, { cache: 'no-store' });
```

### 64. \`apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx\` (Line 26)
```typescript
fetch('/api/recipes/ingredients')
```

### 65. \`apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx\` (Line 42)
```typescript
const res = await fetch(url, {
```

### 66. \`apps/web/src/app/(workspace)/recipes/RecipesClientPage.tsx\` (Line 14)
```typescript
const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
```

### 67. \`apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx\` (Line 33)
```typescript
fetch('/api/recipes/ingredients')
```

### 68. \`apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx\` (Line 94)
```typescript
const res = await fetch(`/api/recipes/${recipe.id}/cost?wastePct=${wastePct}&portions=${portions}`);
```

### 69. \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` (Line 18)
```typescript
fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
```

### 70. \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` (Line 19)
```typescript
fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
```

### 71. \`apps/web/src/app/(workspace)/recipes/[id]/edit/page.tsx\` (Line 20)
```typescript
fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
```

### 72. \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` (Line 20)
```typescript
fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
```

### 73. \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` (Line 21)
```typescript
fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
```

### 74. \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` (Line 22)
```typescript
fetch(`${baseUrl}/recipes/${id}/cost`, { cache: "no-store" }).catch(() => null),
```

### 75. \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` (Line 23)
```typescript
fetch(`${baseUrl}/recipes/${id}/nutrition`, { cache: "no-store" }).catch(() => null),
```

### 76. \`apps/web/src/app/(workspace)/recipes/[id]/page.tsx\` (Line 24)
```typescript
fetch(`${baseUrl}/recipes/${id}/versions`, { cache: "no-store" }).catch(() => null)
```

### 77. \`apps/web/src/app/(workspace)/recipes/new/page.tsx\` (Line 14)
```typescript
fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
```

### 78. \`apps/web/src/app/(workspace)/recipes/new/page.tsx\` (Line 15)
```typescript
fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
```

### 79. \`apps/web/src/app/(workspace)/recipes/page.tsx\` (Line 11)
```typescript
const res = await fetch(`${baseUrl}/recipes`, { cache: "no-store" });
```

### 80. \`apps/web/src/app/(workspace)/settings/page.tsx\` (Line 11)
```typescript
const res = await fetch(`${baseUrl}/integrations/status`, { cache: "no-store" });
```

### 81. \`apps/web/src/app/(workspace)/settings/settings-client.tsx\` (Line 67)
```typescript
const res = await fetch(`/api/integrations/disconnect/${provider.toLowerCase()}?orgId=default`, {
```

### 82. \`apps/web/src/app/(workspace)/settings/settings-client.tsx\` (Line 75)
```typescript
const res = await fetch(`/api/integrations/square/${action}?orgId=default`, {
```

### 83. \`apps/web/src/app/(workspace)/signage/[deckId]/page.tsx\` (Line 19)
```typescript
fetch(`${baseUrl}/signage/layouts/${deckId}`, { cache: "no-store" }),
```

### 84. \`apps/web/src/app/(workspace)/signage/[deckId]/page.tsx\` (Line 20)
```typescript
fetch(`${baseUrl}/pos-simulator/items`, { cache: "no-store" }),
```

### 85. \`apps/web/src/app/(workspace)/signage/[deckId]/preview/page.tsx\` (Line 20)
```typescript
const res = await fetch(`${base}/api/signage/layouts/${deckId}`, {
```

### 86. \`apps/web/src/app/(workspace)/signage/[deckId]/tv-signage-editor-client.tsx\` (Line 73)
```typescript
const res = await fetch(`/api/signage/layouts/${deckId}`, {
```

### 87. \`apps/web/src/app/(workspace)/signage/[deckId]/tv-signage-editor-client.tsx\` (Line 92)
```typescript
const res = await fetch(`/api/signage/layouts/${deckId}`, {
```

### 88. \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` (Line 31)
```typescript
const res = await fetch("/api/signage/layouts", {
```

### 89. \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` (Line 58)
```typescript
const res = await fetch(`/api/signage/layouts/${deckToDelete}`, {
```

### 90. \`apps/web/src/app/(workspace)/signage/decks-list-client.tsx\` (Line 78)
```typescript
const res = await fetch(`/api/signage/layouts/${id}`, {
```

### 91. \`apps/web/src/app/(workspace)/signage/page.tsx\` (Line 12)
```typescript
const res = await fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" });
```

### 92. \`apps/web/src/app/(workspace)/team/page.tsx\` (Line 26)
```typescript
const response = await fetch("/api/devices/pair/confirm", {
```

### 93. \`apps/web/src/app/(workspace)/transactions/page.tsx\` (Line 10)
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/transactions`, { cache: 'no-store' });
```

### 94. \`apps/web/src/app/(workspace)/vendors/page.tsx\` (Line 19)
```typescript
const res = await fetch("/api/vendors");
```

### 95. \`apps/web/src/app/(workspace)/vendors/page.tsx\` (Line 41)
```typescript
const res = await fetch("/api/vendors", {
```

### 96. \`apps/web/src/app/(workspace)/vendors/page.tsx\` (Line 68)
```typescript
const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
```

### 97. \`apps/web/src/app/actions/auth.ts\` (Line 8)
```typescript
await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
```

### 98. \`apps/web/src/app/display/[id]/blocks/modifier-group-block.tsx\` (Line 43)
```typescript
const resGrp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos-modifier-groups/${modifierGroupId}`);
```

### 99. \`apps/web/src/app/display/[id]/blocks/modifier-group-block.tsx\` (Line 52)
```typescript
const resOpts = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos-modifier-groups/${modifierGroupId}/options`);
```

### 100. \`apps/web/src/app/display/[id]/helpers.ts\` (Line 48)
```typescript
const res = await fetch(registerUrl, {
```

### 101. \`apps/web/src/app/display/[id]/page.tsx\` (Line 26)
```typescript
const displayRes = await fetch(`${baseUrl}/signage/displays/${displayId}`, { cache: "no-store" });
```

### 102. \`apps/web/src/app/display/[id]/page.tsx\` (Line 44)
```typescript
fetch(`${baseUrl}/signage/layouts/${initialDisplay.deckId}`, { cache: "no-store" }),
```

### 103. \`apps/web/src/app/display/[id]/page.tsx\` (Line 45)
```typescript
fetch(`${baseUrl}/pos-simulator/items?organizationId=${initialDisplay.organizationId}`, { cache: "no-store" }),
```

### 104. \`apps/web/src/app/display/[id]/use-display-player.ts\` (Line 32)
```typescript
const displayRes = await fetch(`/api/signage/displays/${displayId}`);
```

### 105. \`apps/web/src/app/display/[id]/use-display-player.ts\` (Line 55)
```typescript
fetch(`/api/signage/layouts/${displayObj.deckId}`),
```

### 106. \`apps/web/src/app/display/[id]/use-display-player.ts\` (Line 56)
```typescript
fetch(`/api/pos/items?organizationId=${displayObj.organizationId}`),
```

### 107. \`apps/web/src/components/GoogleDriveBrowserWrapper.tsx\` (Line 13)
```typescript
const res = await fetch(`/api/integrations/google/files?q=${encodeURIComponent(query)}&folderId=${folderId || ""}`);
```

### 108. \`apps/web/src/components/GoogleDriveBrowserWrapper.tsx\` (Line 33)
```typescript
const res = await fetch("/api/integrations/google/import-file", {
```

### 109. \`packages/domain-pos/src/components/POSRegister/pos.container.tsx\` (Line 181)
```typescript
const res = await fetch("/api/integrations/checkout", {
```

### 110. \`packages/domain-recipes/src/ComplianceSearch.tsx\` (Line 89)
```typescript
const res = await fetch(
```

### 111. \`packages/logger/src/browser.ts\` (Line 11)
```typescript
fetch(url, {
```

### 112. \`packages/logger/src/browser.ts\` (Line 56)
```typescript
fetch('https://log-api.newrelic.com/log/v1', {
```

