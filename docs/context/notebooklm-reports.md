# Code Quality Gauntlet Reports

### e2e-test-report.txt

```text

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/app.controller.ts: Decorators cannot be used to decorate parameters. (48:13)

  46 |
  47 |   @Get("favicon.ico")
> 48 |   getFavicon(@Res() res: Response) {
     |              ^
  49 |     const pixel = Buffer.from(
  50 |       "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  51 |       "base64",

   at apps/api/src/app.controller.spec.ts:48


    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/app.controller.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/devices/devices.controller.ts: Decorators cannot be used to decorate parameters. (51:4)

  49 |   @Get(":deviceId/status")
  50 |   async getStatus(
> 51 |     @Param("deviceId") deviceId: string,
     |     ^
  52 |   ): Promise<
  53 |     ApiResponse<{
  54 |       paired: boolean;

   at apps/api/src/modules/devices/devices.spec.ts:51

  49 |       id: "device-1",
  50 |       organizationId: "org-1",
> 51 |       name: "Device 1",
     |    ^
  52 |       pairingCode: "XYZ1",
  53 |       isPaired: true,
  54 |       lastSeenAt: null,
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/devices/devices.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/integrations/integrations.controller.ts: Decorators cannot be used to decorate parameters. (32:4)

  30 |   @Get("connect/:provider")
  31 |   connect(
> 32 |     @Param("provider") provider: string,
     |     ^
  33 |     @Query("orgId") orgId: string,
  34 |     @Res() res: Response,
  35 |   ): void {

   at apps/api/src/modules/integrations/integrations.spec.ts:32

  30 |
  31 |   it("should be defined", () => {
> 32 |     expect(controller).toBeDefined();
     |    ^
  33 |     expect(service).toBeDefined();
  34 |   });
  35 |
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/integrations/integrations.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/integrations/webhooks.controller.ts: Decorators cannot be used to decorate parameters. (35:14)

  33 |   private readonly logger = new Logger(WebhooksController.name);
  34 |
> 35 |   constructor(@InjectQueue("pos-sync") private readonly posSyncQueue: Queue) {}
     |               ^
  36 |
  37 |   @Post(":provider")
  38 |   @HttpCode(HttpStatus.OK)

   at apps/api/src/modules/integrations/webhooks.spec.ts:35

  33 |           useValue: mockQueue,
  34 |         },
> 35 |       ],
     |              ^
  36 |     }).compile();
  37 |
  38 |     controller = module.get<WebhooksController>(WebhooksController);
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/integrations/webhooks.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/pos-simulator/pos-simulator.controller.ts: Decorators cannot be used to decorate parameters. (30:4)

  28 |   @Get("items")
  29 |   async getItems(
> 30 |     @Query("organizationId") organizationId?: string,
     |     ^
  31 |   ): Promise<ApiResponse<unknown[]>> {
  32 |     return runControllerAction(async () => {
  33 |       const orgId = organizationId || this.defaultOrgId;

   at apps/api/src/modules/pos-simulator/pos-simulator.spec.ts:30

  28 |     controller = module.get<PosSimulatorController>(PosSimulatorController);
  29 |     gateway = module.get<SignageGateway>(SignageGateway);
> 30 |
     | ^
  31 |     gateway.server = {
  32 |       to: jest.fn().mockReturnThis(),
  33 |       emit: jest.fn(),
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/pos-simulator/pos-simulator.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/recipe/recipes.controller.ts: Decorators cannot be used to decorate parameters. (44:4)

  42 |   @Get(":id/cost")
  43 |   async getRecipeCost(
> 44 |     @Param("id") id: string,
     |     ^
  45 |     @Query("wastePct") wastePct?: string,
  46 |     @Query("portions") portions?: string,
  47 |   ): Promise<ApiResponse<unknown>> {

   at apps/api/src/modules/recipe/recipe.spec.ts:44

  42 |       select: jest.fn().mockReturnThis(),
  43 |       eq: jest.fn().mockReturnThis(),
> 44 |       order: jest.fn().mockResolvedValue({ data: mockVessels, error: null }),
     |    ^
  45 |     });
  46 |
  47 |     const response = await vesselsController.findAll();
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/recipe/recipe.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/signage/displays.controller.ts: Decorators cannot be used to decorate parameters. (54:16)

  52 |
  53 |   @Get(":id")
> 54 |   async findOne(@Param("id") id: string): Promise<ApiResponse<unknown>> {
     |                 ^
  55 |     return runControllerAction(() => this.displaysService.findOne(id));
  56 |   }
  57 |

   at apps/api/src/modules/signage/displays.spec.ts:54

  52 |     expect(response.success).toBe(true);
  53 |     expect(response.data).toEqual(mockDisplay);
> 54 |   });
     |                ^
  55 |
  56 |   it("should assign a deck to a display", async () => {
  57 |     const mockDisplay = {
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/signage/displays.spec.ts:2:1)

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/modules/signage/layouts.controller.ts: Decorators cannot be used to decorate parameters. (34:4)

  32 |   @Get("slug/:orgSlug/:deckSlug")
  33 |   async findBySlug(
> 34 |     @Param("orgSlug") _orgSlug: string,
     |     ^
  35 |     @Param("deckSlug") deckSlug: string,
  36 |   ): Promise<ApiResponse<unknown>> {
  37 |     return runControllerAction(() =>

   at apps/api/src/modules/signage/layouts.spec.ts:34

  32 |
  33 |     gateway.server = {
> 34 |       to: jest.fn().mockReturnThis(),
     |    ^
  35 |       emit: jest.fn(),
  36 |     } as unknown as Server;
  37 |   });
    at Object.<anonymous> (/home/runner/work/sous.tools/sous.tools/apps/api/src/modules/signage/layouts.spec.ts:2:1)

Error: Cannot find module '/home/runner/work/sous.tools/sous.tools/packages/design-system/node_modules/next/navigation' imported from /home/runner/work/sous.tools/sous.tools/packages/design-system/src/components/OmniBar/use-omni-socket.hook.ts
Did you mean to import "next/navigation.js"?

TypeError: Cannot read properties of undefined (reading 'config')

   at packages/design-system/src/utils/scaling.test.ts:5

  3 | import { type RecipeIngredient } from "@soustools/api-types";
  4 |
> 5 | describe("convertUnit", () => {
    | ^
  6 |   it("converts within the same unit", () => {
  7 |     expect(convertUnit(10, "g", "g")).toBe(10);
  8 |     expect(convertUnit(500, "ml", "ml")).toBe(500);
    at initSuite (/home/runner/work/sous.tools/sous.tools/node_modules/.pnpm/@vitest+runner@4.1.10/node_modules/@vitest/runner/dist/chunk-artifact.js:1848:23)
    at createSuiteCollector (/home/runner/work/sous.tools/sous.tools/node_modules/.pnpm/@vitest+runner@4.1.10/node_modules/@vitest/runner/dist/chunk-artifact.js:1709:2)
    at Object.suiteFn (/home/runner/work/sous.tools/sous.tools/node_modules/.pnpm/@vitest+runner@4.1.10/node_modules/@vitest/runner/dist/chunk-artifact.js:1951:10)
    at describe (/home/runner/work/sous.tools/sous.tools/node_modules/.pnpm/@vitest+runner@4.1.10/node_modules/@vitest/runner/dist/chunk-artifact.js:599:14)
    at /home/runner/work/sous.tools/sous.tools/packages/design-system/src/utils/scaling.test.ts:5:1



```

### knip-report.txt

```text
$ knip
[93m[4mUnused files[24m[39m (35)
apps/setup-portal/src/components/BootstrapStep.tsx
apps/setup-portal/src/components/PairingStep.tsx
apps/setup-portal/src/components/WifiStep.tsx
apps/web/public/sw.js
apps/web/src/app/(workspace)/home/components/FinancialPulse.tsx
apps/web/src/app/(workspace)/home/components/MenuProfitability.tsx
apps/web/src/app/(workspace)/home/components/PurchasingAlerts.tsx
apps/web/src/app/(workspace)/home/components/SystemHealth.tsx
apps/web/src/app/display/[id]/block-renderer.tsx
apps/web/src/app/display/[id]/blocks/callout-block.tsx
apps/web/src/app/display/[id]/blocks/category-header-block.tsx
apps/web/src/app/display/[id]/blocks/exploded-item-block.tsx
apps/web/src/app/display/[id]/blocks/media-carousel-block.tsx
apps/web/src/app/display/[id]/blocks/menu-list-block.tsx
apps/web/src/app/display/[id]/blocks/modifier-group-block.tsx
apps/web/src/app/display/[id]/blocks/nested-item-block.tsx
apps/web/src/app/display/[id]/blocks/pos-item-block.tsx
apps/web/src/app/display/[id]/menu-item-style-utils.ts
apps/web/src/app/display/[id]/menu-slide-renderer.tsx
apps/web/src/app/display/[id]/scale-wrapper.tsx
apps/web/src/components/layout/app-bar.tsx
apps/web/src/components/layout/bottom-nav.tsx
apps/web/src/components/layout/hamburger.tsx
apps/web/src/components/layout/sidebar.tsx
apps/web/src/components/layout/theme-toggle.tsx
apps/web/src/sw.ts
ecosystem.config.js
packages/config/src/cli.ts
packages/design-system/src/components/logos/index.ts
scripts/create-index.js
scripts/create-signage-stubs.js
scripts/fix_seed.mjs
scripts/generate-icons.mjs
scripts/scan-violations.js
scripts/seed-globalmaster-staples.ts
[93m[4mUnused dependencies[24m[39m (20)
@as-integrations/express4  apps/api/package.json:20:6
@nestjs/platform-express   apps/cli/package.json:25:6
@soustools/api-types       apps/cli/package.json:26:6
@soustools/logger          apps/cli/package.json:28:6
@soustools/config          apps/pos-simulator/package.json:15:6
@supabase/supabase-js      apps/pos-simulator/package.json:17:6
@hello-pangea/dnd          apps/web/package.json:14:6
@hookform/resolvers        apps/web/package.json:15:6
@supabase/supabase-js      apps/web/package.json:22:6
react-hook-form            apps/web/package.json:35:6
recharts                   apps/web/package.json:36:6
serwist                    apps/web/package.json:37:6
zod                        apps/web/package.json:40:6
eslint-plugin-react        package.json:49:6
@infisical/sdk             packages/config/package.json:14:6
dotenv                     packages/config/package.json:15:6
zod                        packages/config/package.json:16:6
@radix-ui/react-tooltip    packages/design-system/package.json:38:6
@soustools/api-types       packages/domain-pos/package.json:32:6
sonner                     packages/domain-settings/package.json:36:6
[93m[4mUnused devDependencies[24m[39m (29)
@types/supertest        apps/api/package.json:62:6
source-map-support      apps/api/package.json:65:6
supertest               apps/api/package.json:66:6
ts-loader               apps/api/package.json:68:6
ts-node                 apps/api/package.json:69:6
tsconfig-paths          apps/api/package.json:70:6
webpack                 apps/api/package.json:73:6
webpack-node-externals  apps/api/package.json:74:6
@nestjs/testing         apps/cli/package.json:38:6
@types/express          apps/cli/package.json:40:6
@types/supertest        apps/cli/package.json:43:6
source-map-support      apps/cli/package.json:45:6
supertest               apps/cli/package.json:46:6
ts-loader               apps/cli/package.json:48:6
tailwindcss             apps/pos-simulator/package.json:33:6
autoprefixer            apps/setup-portal/package.json:28:6
tailwindcss             apps/setup-portal/package.json:31:6
tailwindcss             apps/web/package.json:53:6
@soustools/tsconfig     package.json:26:6
png-to-ico              package.json:36:6
sharp                   package.json:39:6
tsx                     packages/config/package.json:21:6
autoprefixer            packages/design-system/package.json:26:6
postcss                 packages/design-system/package.json:29:6
@soustools/tsconfig     packages/eslint-config/package.json:22:6
eslint-plugin-prettier  packages/eslint-config/package.json:23:6
eslint-config-prettier  packages/eslint-config/package.json:24:6
prettier                packages/eslint-config/package.json:25:6
pino-pretty             packages/logger/package.json:34:6
[93m[4mUnlisted dependencies[24m[39m (2)
[90m[39m[97meslint-plugin-prettier[39m[90m/recommended[39m  apps/cli/eslint.config.mjs:3:46
@tailwindcss/postcss                apps/setup-portal/postcss.config.mjs
[93m[4mUnlisted binaries[24m[39m (2)
tsx    package.json
xclip  package.json
[93m[4mUnused exports[24m[39m (26)
SupabaseClientWrapper                    class     apps/api/src/lib/supabase.ts:20:14
addToPurchaseOrderTool                             apps/api/src/modules/commands/commands-tools.ts:3:14
addToWhiteboardTool                                apps/api/src/modules/commands/commands-tools.ts:18:14
getRecipeCostTool                                  apps/api/src/modules/commands/commands-tools.ts:32:14
ingestVendorInvoiceTool                            apps/api/src/modules/commands/commands-tools.ts:44:14
updateItemStatusTool                               apps/api/src/modules/commands/commands-tools.ts:56:14
adjustThrottleTimeTool                             apps/api/src/modules/commands/commands-tools.ts:69:14
reconcileInventoryTool                             apps/api/src/modules/commands/commands-tools.ts:81:14
IngestionSuggestionDto                   class     apps/api/src/modules/ingestion/ingestion.controller.ts:20:14
IngestionLineItemDto                     class     apps/api/src/modules/ingestion/ingestion.controller.ts:34:14
PolymorphicExtractionResponseDto         class     apps/api/src/modules/ingestion/ingestion.controller.ts:66:14
PolymorphicExtractionResponseWrapperDto  class     apps/api/src/modules/ingestion/ingestion.controller.ts:90:14
generatePairingCode                      function  apps/api/src/modules/signage/displays.helpers.ts:26:17
dbRegisterPairingCode                    function  apps/api/src/modules/signage/displays.helpers.ts:41:23
dbConfirmPairing                         function  apps/api/src/modules/signage/displays.helpers.ts:74:23
baseContentBlock                                   apps/cli/src/ingestion/gemini-parser.schemas.ts:3:14
ingredientSchema                                   apps/cli/src/ingestion/gemini-parser.schemas.ts:8:14
preprocessArray                                    apps/cli/src/ingestion/gemini-parser.schemas.ts:15:14
preprocessStringArray                              apps/cli/src/ingestion/gemini-parser.schemas.ts:25:14
contentBlockSchema                                 apps/cli/src/ingestion/gemini-parser.schemas.ts:35:14
default                                            apps/cli/src/ingestion/prompt-templates.ts:55:16
default                                            apps/pos-simulator/src/components/PosSimulator.container.tsx:105:16
default                                            apps/pos-simulator/src/components/PosSimulator.tsx:70:16
CardDescription                          function  packages/design-system/src/components/Card.tsx:47:17
getCategory                                        packages/domain-pos/src/components/POSRegister/pos.helpers.ts:32:14
BLOCK_GROUPS                                       packages/domain-signage/src/block-palette-items.ts:31:14
[93m[4mUnused exported types[24m[39m (75)
SquareCatalogObject             interface  apps/api/src/modules/integrations/square-client.helper.ts:3:18
POSCategoryUpsert               interface  apps/api/src/modules/integrations/square-mapper.helper.ts:74:18
POSDiscountUpsert               interface  apps/api/src/modules/integrations/square-mapper.helper.ts:82:18
POSOrderUpsert                  interface  apps/api/src/modules/integrations/square-mapper.helper.ts:92:18
POSModifierGroupUpsert          interface  apps/api/src/modules/integrations/square-mapper.helper.ts:106:18
POSModifierOptionUpsert         interface  apps/api/src/modules/integrations/square-mapper.helper.ts:116:18
POSItemUpsert                   interface  apps/api/src/modules/integrations/square-mapper.helper.ts:127:18
POSItemModifierGroupUpsert      interface  apps/api/src/modules/integrations/square-mapper.helper.ts:140:18
POSTransactionUpsert            interface  apps/api/src/modules/integrations/square-mapper.helper.ts:145:18
SquareModifier                  interface  apps/api/src/modules/integrations/square-seed-types.ts:1:18
SquareModifierListInfo          interface  apps/api/src/modules/integrations/square-seed-types.ts:10:18
SquareVariation                 interface  apps/api/src/modules/integrations/square-seed-types.ts:17:18
StockRow                        interface  apps/api/src/modules/items/inventory.service.ts:29:18
ClassifiedDietInfo              interface  apps/api/src/modules/items/items-query.helper.ts:22:18
ApiResponse                     interface  apps/api/src/modules/items/items.controller.ts:14:18
ApiResponse                     interface  apps/api/src/modules/items/price-history.controller.ts:7:18
ApiResponse                     interface  apps/api/src/modules/items/wastage.controller.ts:4:18
WastageReportRow                interface  apps/api/src/modules/items/wastage.service.ts:22:18
UsdaMatch                       interface  apps/api/src/modules/nutrition/usda-resolver.service.ts:4:18
MockPosItem                     type       apps/api/src/modules/pos-simulator/pos-simulator.helpers.ts:5:15
MockPosItem                     interface  apps/api/src/modules/pos-simulator/pos-simulator.mock.ts:1:18
LinkRecipeDto                   interface  apps/api/src/modules/pos/pos-links.service.ts:4:18
RecordTransactionDto            interface  apps/api/src/modules/pos/pos-transactions.service.ts:4:18
VelocityRow                     interface  apps/api/src/modules/pos/pos-transactions.service.ts:14:18
CostIngredient                  interface  apps/api/src/modules/recipe/recipe-cost.service.ts:4:18
RecipeCost                      interface  apps/api/src/modules/recipe/recipe-cost.service.ts:11:18
ApiResponse                     interface  apps/api/src/modules/recipe/recipe-versions.controller.ts:4:18
PosItemCardProps                interface  apps/pos-simulator/src/components/PosItemCard.tsx:7:18
PosSimulatorProps               interface  apps/pos-simulator/src/components/PosSimulator.tsx:9:18
PosItem                         interface  apps/web/src/app/(workspace)/catalog/CatalogView.tsx:8:18
PosCategory                     interface  apps/web/src/app/(workspace)/catalog/CatalogView.tsx:17:18
PosModifierGroup                interface  apps/web/src/app/(workspace)/catalog/CatalogView.tsx:23:18
PosDiscount                     interface  apps/web/src/app/(workspace)/catalog/CatalogView.tsx:30:18
InvoiceItemRowProps             interface  apps/web/src/app/(workspace)/ingestion/review/[id]/invoice-item-row.tsx:8:18
PageHeaderProps                 interface  apps/web/src/app/(workspace)/ingestion/review/[id]/page-header.tsx:7:18
RecipeIngredientRowProps        interface  …web/src/app/(workspace)/ingestion/review/[id]/recipe-ingredient-row.tsx:6:18
RecipeSectionProps              interface  apps/web/src/app/(workspace)/ingestion/review/[id]/recipe-section.tsx:7:18
VendorSectionProps              interface  apps/web/src/app/(workspace)/ingestion/review/[id]/vendor-section.tsx:8:18
OrdersClientProps               interface  apps/web/src/app/(workspace)/inventory/orders/OrdersClient.tsx:9:18
VendorsClientProps              interface  apps/web/src/app/(workspace)/inventory/vendors/vendors-client.tsx:9:18
PosOrder                        interface  apps/web/src/app/(workspace)/pos-orders/PosOrdersView.tsx:13:18
RecipeViewerClientProps         interface  apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx:9:18
RecipeBuilderClientProps        interface  apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx:9:18
SettingsClientProps             interface  apps/web/src/app/(workspace)/settings/settings-client.tsx:16:18
TeamPortalViewProps             interface  apps/web/src/app/(workspace)/team/team.view.tsx:7:18
Transaction                     interface  apps/web/src/app/(workspace)/transactions/TransactionsView.tsx:21:18
MenuItemCardProps               interface  apps/web/src/app/display/[id]/menu-item-card.tsx:14:18
ConfirmModalProps               type       apps/web/src/components/ui/confirm-modal.tsx:7:15
AppBarNotifDropdownProps        interface  packages/design-system/src/components/AppBarNotifDropdown.tsx:7:18
AppBarProfileDropdownProps      interface  packages/design-system/src/components/AppBarProfileDropdown.tsx:7:18
GlobalAppBarContainerProps      interface  …ges/design-system/src/components/GlobalAppBar/GlobalAppBarContainer.tsx:5:18
OrderSupplier                   interface  packages/design-system/src/components/InsightsSidebar.tsx:3:18
DocumentViewerProps             interface  packages/design-system/src/components/OmniBar/DocumentViewer.tsx:8:18
OmniBarState                    interface  packages/design-system/src/components/OmniBar/OmniBarContext.ts:11:18
OmniChatWindowProps             interface  packages/design-system/src/components/OmniBar/OmniChatWindow.tsx:10:18
OmniInputPillProps              interface  packages/design-system/src/components/OmniBar/OmniInputPill.tsx:12:18
UnifiedItemRowProps             interface  packages/design-system/src/components/OmniBar/UnifiedItemRow.tsx:10:18
QuickAddBarProps                interface  packages/design-system/src/components/QuickAddBar.tsx:14:18
SupplierHeaderProps             interface  packages/domain-inventory/src/components/Supplier/SupplierHeader.tsx:6:18
OrderItemRowProps               interface  packages/domain-inventory/src/components/Supplier/SupplierLineItem.tsx:7:18
VendorCardFormProps             interface  packages/domain-inventory/src/vendor-card-form.tsx:16:18
ActiveKitchenStepProps          interface  packages/domain-recipes/src/ActiveKitchenStep.tsx:6:18
ActiveKitchenTimerRowProps      interface  packages/domain-recipes/src/ActiveKitchenTimerRow.tsx:6:18
ComplianceSearchFormProps       interface  packages/domain-recipes/src/ComplianceSearchForm.tsx:6:18
ComplianceSearchResultItemPro…  interface  packages/domain-recipes/src/ComplianceSearchResultItem.tsx:5:18
RecipeBatchSummaryProps         interface  packages/domain-recipes/src/RecipeBatchSummary.tsx:8:18
RecipeBuilderFormFieldsProps    interface  packages/domain-recipes/src/RecipeBuilderFormFields.tsx:6:18
RecipeBuilderIngredientRowPro…  interface  packages/domain-recipes/src/RecipeBuilderIngredientRow.tsx:9:18
RecipeCostTableProps            interface  packages/domain-recipes/src/RecipeCostTable.tsx:5:18
RecipeViewerHeaderProps         interface  packages/domain-recipes/src/RecipeViewerHeader.tsx:7:18
VesselDialogFormProps           interface  packages/domain-recipes/src/VesselDialogForm.tsx:6:18
VesselManagerHeaderProps        interface  packages/domain-recipes/src/VesselManagerHeader.tsx:5:18
WastageEntryFormProps           interface  packages/domain-recipes/src/WastageEntryForm.tsx:7:18
BlockSettingsPanelProps         interface  packages/domain-signage/src/block-settings-panel.tsx:13:18
BlockTypeConfigFieldsProps      interface  packages/domain-signage/src/block-type-config-fields.tsx:21:18
[93m[4mDuplicate exports[24m[39m (10)
GEMINI_SPREAD_PROMPT|default   apps/cli/src/ingestion/prompt-templates.ts
PosSimulatorContainer|default  apps/pos-simulator/src/components/PosSimulator.container.tsx
PosSimulator|default           apps/pos-simulator/src/components/PosSimulator.tsx
DisplayManager|default         packages/domain-signage/src/display-manager.tsx
EditorTopBar|default           packages/domain-signage/src/editor-top-bar.tsx
LayoutBuilder|default          packages/domain-signage/src/layout-builder.tsx
LayoutPreview|default          packages/domain-signage/src/layout-preview.tsx
baseConfig|default             packages/eslint-config/base.js
nestjsConfig|default           packages/eslint-config/nestjs.js
nextConfig|default             packages/eslint-config/next.js
[33m[4mConfiguration hints[24m (33)[39m
apps/web                                   …p.jsonc  [90mAdd [97mentry[90m and/or refine [97mproject[90m files in [97mworkspaces["apps/web"][90m (2…[39m
. [90m(root)[39m                                   …p.jsonc  [90mAdd [97mentry[90m and/or refine [97mproject[90m files in [97mworkspaces["."][90m (7 unused…[39m
apps/setup-portal                          …p.jsonc  [90mAdd [97mentry[90m and/or refine [97mproject[90m files in [97mworkspaces["apps/setup-po[90m…[39m
**/*.spec.{ts,tsx}                         …p.jsonc  [90mRemove from [97mignore[90m[39m
**/*.e2e-spec.ts                           …p.jsonc  [90mRemove from [97mignore[90m[39m
**/*.test.{ts,tsx}                         …p.jsonc  [90mRemove from [97mignore[90m[39m
.config/**                                 …p.jsonc  [90mRemove from [97mignore[90m[39m
.agents/**                                 …p.jsonc  [90mRemove from [97mignore[90m[39m
apps/cli/test/**                           …p.jsonc  [90mRemove from [97mignore[90m[39m
husky                                      …p.jsonc  [90mRemove from [97mignoreDependencies[90m[39m
lint-staged                                …p.jsonc  [90mRemove from [97mignoreDependencies[90m[39m
nest                                       …p.jsonc  [90mRemove from [97mignoreBinaries[90m[39m
next.config.mjs       apps/web             …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/app/layout.tsx    apps/web             …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/app/page.tsx      apps/web             …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
…/instrumentation.ts  apps/web             …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
playwright.config.ts  apps/web             …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/index.ts          …s/domain-inventory  …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/index.ts          …es/domain-settings  …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/index.ts          …ges/domain-recipes  …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
src/index.ts          …ges/domain-signage  …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
next.config.mjs       apps/pos-simulator   …p.jsonc  [90mRemove redundant [97mentry[90m pattern[39m
… more similar hints                                 [90m[39m
[ELIFECYCLE] Command failed with exit code 1.

```

### lint-report.txt

```text
$ turbo lint

   • Packages in scope: @soustools/api-client, @soustools/api-types, @soustools/config, @soustools/design-system, @soustools/domain-inventory, @soustools/domain-pos, @soustools/domain-recipes, @soustools/domain-settings, @soustools/domain-signage, @soustools/eslint-config, @soustools/logger, @soustools/setup-portal, @soustools/supabase, @soustools/tsconfig, api, cli, pos-simulator, web
   • Running lint in 18 packages
   • Remote caching disabled

::group::@soustools/api-types:build
cache hit, replaying logs fe63bff9d5ecbea1
$ tsc
::endgroup::
::group::@soustools/config:build
cache hit, replaying logs e03a7a788b75a11f
$ tsc
::endgroup::
::group::@soustools/logger:build
cache hit, replaying logs 88ead55ab70e20a4
$ tsc
::endgroup::
::group::@soustools/eslint-config:lint
cache miss, executing 2798371b72e32f7b
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/logger:lint
cache miss, executing fea87e1e1db3f520
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/config:lint
cache miss, executing a0e43c477fc0e8b9
$ eslint . --max-warnings 0
::endgroup::
::group::cli:lint
cache miss, executing f93ac97ed90bcdaf
$ eslint . --max-warnings 0
(node:6426) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/runner/work/sous.tools/sous.tools/apps/cli/eslint.config.js?mtime=1784235319297 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/runner/work/sous.tools/sous.tools/apps/cli/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
::endgroup::
::group::@soustools/api-client:lint
cache miss, executing 0d6be077400ac2f2
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/api-types:lint
cache miss, executing ab85f319b864b352
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/supabase:lint
cache miss, executing 655f3e0fc301cae7
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/domain-pos:lint
cache miss, executing e3cab8410ead8b55
$ eslint . --max-warnings 0
::endgroup::
[;31m@soustools/setup-portal:lint[;0m
cache miss, executing fe73f0632ab2fc09
$ eslint . --max-warnings 0

/home/runner/work/sous.tools/sous.tools/apps/setup-portal/src/components/BootstrapStep.tsx
  3:1  error  All imports in the declaration are only used as types. Use `import type`  @typescript-eslint/consistent-type-imports

/home/runner/work/sous.tools/sous.tools/apps/setup-portal/src/components/SetupWizard.tsx
  100:7  warning  Unexpected console statement. Only these console methods are allowed: error, warn  no-console
  247:1  error    File has too many lines (211). Maximum allowed is 200                              max-lines

✖ 3 problems (2 errors, 1 warning)
  1 error and 0 warnings potentially fixable with the `--fix` option.

[ELIFECYCLE] Command failed with exit code 1.
::group::api:lint
cache miss, executing 2fcac998a5639fb3
::endgroup::
::group::@soustools/design-system:lint
cache miss, executing a40723211aa0aff3
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/domain-signage:lint
cache miss, executing 2f73971da37b62d6
$ eslint . --max-warnings 0
[ELIFECYCLE] Command failed.
::endgroup::
::group::pos-simulator:lint
cache miss, executing 2f583feb6c89a69e
::endgroup::
::group::web:lint
cache miss, executing 814dd94e5206c1dc
::endgroup::
::group::@soustools/domain-settings:lint
cache miss, executing 97a9f15aa27c86fc
$ eslint . --max-warnings 0
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-inventory:lint
cache miss, executing b81a42e882686ad8
$ eslint . --max-warnings 0
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-recipes:lint
cache miss, executing cb02eeefdb54dd77
$ eslint . --max-warnings 0
[ELIFECYCLE] Command failed.
::endgroup::
::error::command (/home/runner/work/sous.tools/sous.tools/apps/setup-portal) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run lint exited (1)
@soustools/setup-portal#lint:  ERROR  command (/home/runner/work/sous.tools/sous.tools/apps/setup-portal) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run lint exited (1)

 Tasks:    11 successful, 20 total
Cached:    3 cached, 20 total
  Time:    8.133s
Failed:    @soustools/setup-portal#lint

 ERROR  run failed: command  exited (1)
[ELIFECYCLE] Command failed with exit code 1.

```

### typecheck-report.txt

```text
$ turbo typecheck

Attention:
Turborepo now collects completely anonymous telemetry regarding usage.
This information is used to shape the Turborepo roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://turborepo.dev/docs/telemetry


   • Packages in scope: @soustools/api-client, @soustools/api-types, @soustools/config, @soustools/design-system, @soustools/domain-inventory, @soustools/domain-pos, @soustools/domain-recipes, @soustools/domain-settings, @soustools/domain-signage, @soustools/eslint-config, @soustools/logger, @soustools/setup-portal, @soustools/supabase, @soustools/tsconfig, api, cli, pos-simulator, web
   • Running typecheck in 18 packages
   • Remote caching disabled

::group::@soustools/api-types:build
cache miss, executing fe63bff9d5ecbea1
$ tsc
::endgroup::
::group::@soustools/api-types:typecheck
cache miss, executing 58fccc65a224b629
$ tsc --noEmit
::endgroup::
::group::@soustools/config:build
cache miss, executing e03a7a788b75a11f
$ tsc
::endgroup::
::group::@soustools/config:typecheck
cache miss, executing c1d6b409462fb3f2
$ tsc --noEmit
::endgroup::
::group::@soustools/api-client:typecheck
cache miss, executing b8f0580ca2b5b2f4
$ tsc --noEmit
::endgroup::
::group::@soustools/logger:typecheck
cache miss, executing ede241e0958061b3
$ tsc --noEmit
::endgroup::
::group::@soustools/logger:build
cache miss, executing 88ead55ab70e20a4
$ tsc
::endgroup::
::group::@soustools/supabase:typecheck
cache miss, executing 44a852ec9b931816
$ tsc --noEmit
::endgroup::
[;31m@soustools/design-system:typecheck[;0m
cache miss, executing 7f149ca6984f2de0
$ tsc --noEmit
src/components/logos/index.ts(1,15): error TS2307: Cannot find module './Lettermark' or its corresponding type declarations.
src/components/logos/index.ts(2,15): error TS2307: Cannot find module './MicroIcon' or its corresponding type declarations.
src/components/logos/index.ts(3,15): error TS2307: Cannot find module './PrimaryLogo' or its corresponding type declarations.
[ELIFECYCLE] Command failed with exit code 2.
::group::web:typecheck
cache miss, executing 63750c7ff99532b1
::endgroup::
::group::pos-simulator:typecheck
cache miss, executing 8a28dc30c3a0efed
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/setup-portal:typecheck
cache miss, executing dd6ad8eb45bdaf68
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-recipes:typecheck
cache miss, executing 87fdd10237cb9e01
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-inventory:typecheck
cache miss, executing 8803da4392ea883a
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-pos:typecheck
cache miss, executing c15867b7bbe75111
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::cli:typecheck
cache miss, executing 7562462bca73bf3c
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::api:typecheck
cache miss, executing d3ae566158fe3b44
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-signage:typecheck
cache miss, executing 56415d61a3bd131e
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::group::@soustools/domain-settings:typecheck
cache miss, executing c8a804aac094cf9a
$ tsc --noEmit
[ELIFECYCLE] Command failed.
::endgroup::
::error::command (/home/runner/work/sous.tools/sous.tools/packages/design-system) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run typecheck exited (2)
@soustools/design-system#typecheck:  ERROR  command (/home/runner/work/sous.tools/sous.tools/packages/design-system) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run typecheck exited (2)

 Tasks:    8 successful, 19 total
Cached:    0 cached, 19 total
  Time:    23.264s
Failed:    @soustools/design-system#typecheck

 ERROR  run failed: command  exited (2)
[ELIFECYCLE] Command failed with exit code 2.

```

### unit-test-report.txt

```text
$ INFISICAL_MOCK=true turbo test -- --coverage

   • Packages in scope: @soustools/api-client, @soustools/api-types, @soustools/config, @soustools/design-system, @soustools/domain-inventory, @soustools/domain-pos, @soustools/domain-recipes, @soustools/domain-settings, @soustools/domain-signage, @soustools/eslint-config, @soustools/logger, @soustools/setup-portal, @soustools/supabase, @soustools/tsconfig, api, cli, pos-simulator, web
   • Running test in 18 packages
   • Remote caching disabled

::group::@soustools/api-types:build
cache miss, executing 0ad0cc808757acd1
$ tsc
::endgroup::
::group::@soustools/config:build
cache miss, executing 2081cae84a6b2554
$ tsc
::endgroup::
::group::@soustools/logger:build
cache miss, executing 16c22feada2cdeca
$ tsc
::endgroup::
[;31mcli:test[;0m
cache miss, executing 3010851716d98ae6
$ jest --coverage
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /home/runner/work/sous.tools/sous.tools/apps/cli/src
  12 files checked.
  testMatch:  - 0 matches
  testPathIgnorePatterns: /node_modules/ - 12 matches
  testRegex: .*\.spec\.ts$ - 0 matches
Pattern:  - 0 matches
[ELIFECYCLE] Test failed. See above for more details.
::group::api:test
cache miss, executing afa34a52924d9eb8
$ jest --coverage
[ELIFECYCLE] Test failed. See above for more details.
::endgroup::
::error::command (/home/runner/work/sous.tools/sous.tools/apps/cli) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run test --coverage exited (1)
cli#test:  ERROR  command (/home/runner/work/sous.tools/sous.tools/apps/cli) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run test --coverage exited (1)

 Tasks:    3 successful, 5 total
Cached:    0 cached, 5 total
  Time:    3.654s
Failed:    cli#test

 ERROR  run failed: command  exited (1)
[ELIFECYCLE] Test failed. See above for more details.

```
