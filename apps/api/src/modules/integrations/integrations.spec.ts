import { Test, TestingModule } from "@nestjs/testing";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    upsert: jest.fn().mockReturnThis(),
  },
}));

describe("Integrations", () => {
  let controller: IntegrationsController;
  let service: IntegrationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationsController],
      providers: [IntegrationsService],
    }).compile();

    controller = module.get<IntegrationsController>(IntegrationsController);
    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should generate OAuth URLs correctly", () => {
    const squareUrl = service.getOAuthUrl("square", "org-1");
    expect(squareUrl).toContain("squareupsandbox.com");
    expect(squareUrl).toContain("state=org-1");

    const googleUrl = service.getOAuthUrl("google", "org-2");
    expect(googleUrl).toContain("accounts.google.com");
    expect(googleUrl).toContain("state=org-2");
  });

  it("should return integration status correctly", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ provider: "SQUARE", metadata: { connectedAs: "My Business" } }],
        error: null,
      }),
    });

    const status = await service.getIntegrationStatus("org-1");
    expect(status).toEqual([
      { provider: "SQUARE", connected: true, connectedAs: "My Business" },
      { provider: "GOOGLE", connected: false, connectedAs: undefined },
    ]);
  });

  it("should disconnect correctly", async () => {
    const thenMock = jest.fn().mockImplementation((callback) => callback({ error: null }));
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: thenMock,
    });

    await service.disconnect("square", "org-1");
    expect(supabase.from).toHaveBeenCalledWith("integrations");
  });
});
