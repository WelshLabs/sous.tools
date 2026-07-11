import { Test, TestingModule } from "@nestjs/testing";
import { LayoutsController } from "./layouts.controller";
import { LayoutsService } from "./layouts.service";
import { SignageGateway } from "./signage.gateway";
import { supabase } from "../../lib/supabase";
import { Server } from "socket.io";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("LayoutsController", () => {
  let controller: LayoutsController;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LayoutsController],
      providers: [LayoutsService, SignageGateway],
    }).compile();

    controller = module.get<LayoutsController>(LayoutsController);
    gateway = module.get<SignageGateway>(SignageGateway);

    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  it("should list layouts successfully", async () => {
    const mockLayouts = [{ id: "layout-1", name: "Main Menu" }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockLayouts, error: null }),
    });

    const response = await controller.findAll();
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockLayouts);
  });

  it("should create a deck successfully", async () => {
    const mockDeck = { id: "deck-1", name: "New Deck", slug: "new-deck" };
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDeck, error: null }),
    });

    const response = await controller.create("New Deck");
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockDeck);
  });
});
