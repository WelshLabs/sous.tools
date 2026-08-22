import { Test, TestingModule } from "@nestjs/testing";
import { SignageResolver } from "./signage.resolver";
import { DisplaysService } from "./displays.service";
import { LayoutsService } from "./layouts.service";
import { SignageGateway } from "./signage.gateway";
import { supabase } from "../../core/database/supabase";
import { Server } from "socket.io";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("SignageResolver Displays", () => {
  let resolver: SignageResolver;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignageResolver,
        DisplaysService,
        LayoutsService,
        SignageGateway,
      ],
    }).compile();

    resolver = module.get<SignageResolver>(SignageResolver);
    gateway = module.get<SignageGateway>(SignageGateway);

    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  it("should create a browser display successfully", async () => {
    const mockDisplay = {
      id: "display-1",
      name: "Test TV",
      deck_id: null,
      device_id: null,
    };
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDisplay, error: null }),
    });

    const response = await resolver.createDisplay(
      { name: "Test TV" },
      { req: {} },
    );
    expect(response).toEqual(mockDisplay);
  });
});
