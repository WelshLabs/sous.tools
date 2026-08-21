import { HealthController } from "./health.controller";
import { HealthCheckService, MemoryHealthIndicator } from "@nestjs/terminus";

describe("HealthController", () => {
  let controller: HealthController;
  let mockHealth: jest.Mocked<HealthCheckService>;
  let mockMemory: jest.Mocked<MemoryHealthIndicator>;

  beforeEach(() => {
    mockHealth = {
      check: jest
        .fn()
        .mockImplementation(async (indicators: Array<() => any>) => {
          const results = await Promise.all(indicators.map((fn) => fn()));
          return {
            status: "ok",
            info: Object.assign({}, ...results),
            error: {},
            details: Object.assign({}, ...results),
          };
        }),
    } as any;

    mockMemory = {
      checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: "up" } }),
      checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: "up" } }),
    } as any;

    controller = new HealthController(mockHealth, mockMemory);
  });

  it("performs terminus health checks for heap, rss, and application status", async () => {
    const result = await controller.check();

    expect(mockHealth.check).toHaveBeenCalled();
    expect(mockMemory.checkHeap).toHaveBeenCalled();
    expect(mockMemory.checkRSS).toHaveBeenCalled();
    expect(result.status).toBe("ok");
    expect(result.info?.app?.status).toBe("up");
    expect(result.info?.memory_heap?.status).toBe("up");
  });
});
