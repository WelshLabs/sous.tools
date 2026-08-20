import { Test, TestingModule } from "@nestjs/testing";
import { DisplaysController } from "./displays.controller";
import { DisplaysService } from "./displays.service";
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

describe("DisplaysController", () => {
  let controller: DisplaysController;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisplaysController],
      providers: [DisplaysService, SignageGateway],
    }).compile();

    controller = module.get<DisplaysController>(DisplaysController);
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

    const response = await controller.create("Test TV");
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockDisplay);
  });

  it("should assign a deck to a display", async () => {
    const mockDisplay = {
      id: "display-1",
      name: "Test TV",
      deck_id: "deck-abc",
    };
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDisplay, error: null }),
    });

    const response = await controller.update(
      "display-1",
      undefined,
      "deck-abc",
    );
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockDisplay);
  });
});
