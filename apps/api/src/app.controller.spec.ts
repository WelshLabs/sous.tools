import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Mock the config module to provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
// Ensure the path to config is correct relative to app.controller.spec.ts
jest.mock("../lib/config", () => ({
  config: {
    SUPABASE_URL: "http://localhost:54321", // Dummy URL for testing
    SUPABASE_SERVICE_ROLE_KEY: "dummy-service-role-key",
  },
}));

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return API response with greeting", () => {
      const response = appController.getHello();
      expect(response.success).toBe(true);
      expect(response.data?.message).toBe("Hello World from Sous Tools API!");
      expect(response.data?.version).toBe("1.0.0");
      expect(response.data?.status).toBe("healthy");
      expect(response.timestamp).toBeDefined();
    });
  });
});
