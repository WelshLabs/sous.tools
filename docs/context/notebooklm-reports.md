# Code Quality Gauntlet Reports

### e2e-test-report.txt

```text

SyntaxError: /home/runner/work/sous.tools/sous.tools/apps/api/src/app.controller.ts: Decorators cannot be used to decorate parameters. (49:13)

  47 |
  48 |   @Get("favicon.ico")
> 49 |   getFavicon(@Res() res: Response) {
     |              ^
  50 |     const pixel = Buffer.from(
  51 |       "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  52 |       "base64",

   at apps/api/src/app.controller.spec.ts:49


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
[31mERROR[39m: Error loading /home/runner/work/sous.tools/sous.tools/.github/workflows/build-and-deploy-rpi-os.yml
Reason: Implicit keys need to be on a single line at line 62, column 1:

          cat > config <<'EOCFG'
IMG_NAME=soustools-signage
^

Configuration file load error? Visit https://knip.dev/reference/known-issues
[ELIFECYCLE] Command failed with exit code 2.

```

### lint-report.txt

```text
$ turbo lint

   • Packages in scope: @soustools/api-client, @soustools/api-types, @soustools/config, @soustools/design-system, @soustools/domain-inventory, @soustools/domain-pos, @soustools/domain-recipes, @soustools/domain-settings, @soustools/domain-signage, @soustools/eslint-config, @soustools/logger, @soustools/setup-portal, @soustools/supabase, @soustools/tsconfig, api, cli, pos-simulator, web
   • Running lint in 18 packages
   • Remote caching disabled

::group::@soustools/config:build
cache hit, replaying logs e03a7a788b75a11f
$ tsc
::endgroup::
::group::@soustools/api-types:build
cache hit, replaying logs fe63bff9d5ecbea1
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
::group::@soustools/domain-inventory:lint
cache miss, executing 5865057ce641fa8e
$ eslint . --max-warnings 0
::endgroup::
::group::cli:lint
cache miss, executing f93ac97ed90bcdaf
$ eslint . --max-warnings 0
(node:6437) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/runner/work/sous.tools/sous.tools/apps/cli/eslint.config.js?mtime=1784148945347 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/runner/work/sous.tools/sous.tools/apps/cli/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
::endgroup::
::group::@soustools/domain-settings:lint
cache miss, executing 80b6e9fc04ec90d1
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
::group::@soustools/api-client:lint
cache miss, executing 0d6be077400ac2f2
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/domain-pos:lint
cache miss, executing e4aa12eb60bf2594
$ eslint . --max-warnings 0
::endgroup::
::group::@soustools/design-system:lint
cache miss, executing 39135ad8d70e0228
$ eslint . --max-warnings 0
::endgroup::
::group::api:lint
cache miss, executing 8dfd1ae2d4f138d1
$ eslint . --max-warnings 0
(node:6498) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/runner/work/sous.tools/sous.tools/apps/api/eslint.config.js?mtime=1784148945344 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/runner/work/sous.tools/sous.tools/apps/api/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
::endgroup::
::group::@soustools/domain-recipes:lint
cache miss, executing 2c62c0389122d21a
$ eslint . --max-warnings 0
::endgroup::
::group::pos-simulator:lint
cache miss, executing cd86479452e18510
$ eslint . --max-warnings 0
(node:6800) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/runner/work/sous.tools/sous.tools/apps/pos-simulator/eslint.config.js?mtime=1784148945347 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/runner/work/sous.tools/sous.tools/apps/pos-simulator/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
::endgroup::
[;31m@soustools/setup-portal:lint[;0m
cache miss, executing 0073b4c64962de3e
$ eslint . --max-warnings 0

/home/runner/work/sous.tools/sous.tools/apps/setup-portal/src/app/api/progress/route.ts
  52:9   warning  Unexpected console statement. Only these console methods are allowed: error, warn  no-console
  55:18  error    'e' is defined but never used. Allowed unused caught errors must match /^_/u       @typescript-eslint/no-unused-vars
  63:9   warning  Unexpected console statement. Only these console methods are allowed: error, warn  no-console

/home/runner/work/sous.tools/sous.tools/apps/setup-portal/src/app/api/wifi/route.ts
  39:49  error  Unnecessary escape character: \.  no-useless-escape

/home/runner/work/sous.tools/sous.tools/apps/setup-portal/src/components/SetupWizard.tsx
  100:7  warning  Unexpected console statement. Only these console methods are allowed: error, warn  no-console
  247:1  error    File has too many lines (211). Maximum allowed is 200                              max-lines

✖ 6 problems (3 errors, 3 warnings)

[ELIFECYCLE] Command failed with exit code 1.
::group::@soustools/domain-signage:lint
cache miss, executing f78868a50e91ef1b
$ eslint . --max-warnings 0
[ELIFECYCLE] Command failed.
::endgroup::
::group::web:lint
cache miss, executing 49adf74f4334f364
$ eslint . --max-warnings 0
(node:6787) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/runner/work/sous.tools/sous.tools/apps/web/eslint.config.js?mtime=1784148945350 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/runner/work/sous.tools/sous.tools/apps/web/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
[ELIFECYCLE] Command failed.
::endgroup::
::error::command (/home/runner/work/sous.tools/sous.tools/apps/setup-portal) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run lint exited (1)
@soustools/setup-portal#lint:  ERROR  command (/home/runner/work/sous.tools/sous.tools/apps/setup-portal) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run lint exited (1)

 Tasks:    17 successful, 20 total
Cached:    3 cached, 20 total
  Time:    12.084s
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

::group::@soustools/api-types:typecheck
cache miss, executing 58fccc65a224b629
$ tsc --noEmit
::endgroup::
::group::@soustools/api-types:build
cache miss, executing fe63bff9d5ecbea1
$ tsc
::endgroup::
::group::@soustools/config:typecheck
cache miss, executing c1d6b409462fb3f2
$ tsc --noEmit
::endgroup::
::group::@soustools/config:build
cache miss, executing e03a7a788b75a11f
$ tsc
::endgroup::
::group::@soustools/logger:typecheck
cache miss, executing ede241e0958061b3
$ tsc --noEmit
::endgroup::
::group::@soustools/logger:build
cache miss, executing 88ead55ab70e20a4
$ tsc
::endgroup::
::group::@soustools/api-client:typecheck
cache miss, executing b8f0580ca2b5b2f4
$ tsc --noEmit
::endgroup::
::group::@soustools/supabase:typecheck
cache miss, executing 44a852ec9b931816
$ tsc --noEmit
::endgroup::
::group::@soustools/setup-portal:typecheck
cache miss, executing a2e0de5129bb02b1
$ tsc --noEmit
::endgroup::
::group::@soustools/design-system:typecheck
cache miss, executing 7f242f1440ea6207
$ tsc --noEmit
::endgroup::
::group::cli:typecheck
cache miss, executing 7562462bca73bf3c
$ tsc --noEmit
::endgroup::
::group::@soustools/domain-pos:typecheck
cache miss, executing fdf5f98e7327604a
$ tsc --noEmit
::endgroup::
::group::@soustools/domain-recipes:typecheck
cache miss, executing 9453589ff28a07be
$ tsc --noEmit
::endgroup::
::group::@soustools/domain-settings:typecheck
cache miss, executing 45f01873bab91b34
$ tsc --noEmit
::endgroup::
::group::@soustools/domain-inventory:typecheck
cache miss, executing 02f7db4bfb2167ee
$ tsc --noEmit
::endgroup::
::group::pos-simulator:typecheck
cache miss, executing 6748d106d85bd62c
$ tsc --noEmit
::endgroup::
::group::@soustools/domain-signage:typecheck
cache miss, executing 2f6d1599f12ae801
$ tsc --noEmit
::endgroup::
::group::api:typecheck
cache miss, executing 2d27e0adcf2765ae
$ tsc --noEmit
::endgroup::
::group::web:typecheck
cache miss, executing d8f41c70392e1440
$ tsc --noEmit
::endgroup::

 Tasks:    19 successful, 19 total
Cached:    0 cached, 19 total
  Time:    33.633s


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
cache miss, executing 33814e4cc8d1dd8e
$ jest --coverage
[ELIFECYCLE] Test failed. See above for more details.
::endgroup::
::error::command (/home/runner/work/sous.tools/sous.tools/apps/cli) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run test --coverage exited (1)
cli#test:  ERROR  command (/home/runner/work/sous.tools/sous.tools/apps/cli) /home/runner/setup-pnpm/node_modules/.bin/store/v11/links/@/pnpm/11.5.2/7be71a39f9a4ef59fa66a6737cd4d82e3e986d07d701d1922a727d1fa4113eff/bin/pnpm run test --coverage exited (1)

 Tasks:    3 successful, 5 total
Cached:    0 cached, 5 total
  Time:    3.678s
Failed:    cli#test

 ERROR  run failed: command  exited (1)
[ELIFECYCLE] Test failed. See above for more details.

```
