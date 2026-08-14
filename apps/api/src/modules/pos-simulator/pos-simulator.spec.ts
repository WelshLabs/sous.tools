import { Test, TestingModule } from "@nestjs/testing";
import { PosSimulatorController } from "./pos-simulator.controller";
import { SignageGateway } from "../signage/signage.gateway";
import { supabase } from "../../lib/supabase";
import { Server } from "socket.io";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  },
}));

describe("PosSimulatorController", () => {
  let controller: PosSimulatorController;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PosSimulatorController],
      providers: [SignageGateway],
    }).compile();

    controller = module.get<PosSimulatorController>(PosSimulatorController);
    gateway = module.get<SignageGateway>(SignageGateway);

    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  it("should list items successfully", async () => {
    const mockItems = [
      { id: "item-1", name: "Coffee", pos_provider: "SQUARE" },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest
        .fn()
        .mockImplementation((cb) => cb({ data: mockItems, error: null })),
    });

    const response = await controller.getItems();
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockItems);
  });

  it("should toggle sold out and broadcast layout updates to paired TVs", async () => {
    const mockItem = {
      id: "item-1",
      external_id: "sq-item-1",
      name: "Coffee",
      is_sold_out: true,
    };
    const mockDecks = [{ id: "deck-1", config: {} }];

    const fromMock = jest.fn().mockImplementation((table: string) => {
      if (table === "pos_items") {
        return {
          select: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockItem, error: null }),
          then: jest
            .fn()
            .mockImplementation((cb) => cb({ data: [mockItem], error: null })),
        };
      }
      if (table === "integrations") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === "signage_decks") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockDecks, error: null }),
        };
      }
      return null;
    });

    (supabase.from as jest.Mock).mockImplementation(fromMock);

    const response = await controller.toggleSoldOut("item-1", undefined, true);
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockItem);
    expect(gateway.server.to).toHaveBeenCalledWith("deck:deck-1");
  });
});
