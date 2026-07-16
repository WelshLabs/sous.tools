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
