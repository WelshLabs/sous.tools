import { Test, TestingModule } from "@nestjs/testing";
import { Server } from "socket.io";
import { LayoutsController } from "./layouts.controller";
import { LayoutsService } from "./layouts.service";
import { DisplaysController } from "./displays.controller";
import { DisplaysService } from "./displays.service";
import { SignageGateway } from "./signage.gateway";
import { PosSimulatorController } from "../pos-simulator/pos-simulator.controller";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
    upsert: jest.fn().mockReturnThis(),
  },
}));

describe("Signage Module & POS Simulator", () => {
  let layoutsController: LayoutsController;
  let displaysController: DisplaysController;
  let posController: PosSimulatorController;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        LayoutsController,
        DisplaysController,
        PosSimulatorController,
      ],
      providers: [LayoutsService, DisplaysService, SignageGateway],
    }).compile();

    layoutsController = module.get<LayoutsController>(LayoutsController);
    displaysController = module.get<DisplaysController>(DisplaysController);
    posController = module.get<PosSimulatorController>(PosSimulatorController);
    gateway = module.get<SignageGateway>(SignageGateway);

    // Mock WebSocket Server
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  it("should list layouts successfully", async () => {
    const mockLayouts = [{ id: "layout-1", name: "Main Menu" }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockLayouts, error: null }),
    });

    const response = await layoutsController.findAll();
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockLayouts);
  });

  it("should register pairing code successfully", async () => {
    const mockDisplay = {
      id: "display-1",
      pairing_code: "A1B2",
      is_paired: false,
    };
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDisplay, error: null }),
    });

    const response = await displaysController.register("Test TV");
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockDisplay);
  });

  it("should confirm pairing successfully and broadcast update", async () => {
    const mockUnpairedDisplay = {
      id: "display-1",
      name: "Test TV",
      pairing_code: "A1B2",
      is_paired: false,
    };
    const mockPairedDisplay = {
      id: "display-1",
      name: "Test TV",
      pairing_code: null,
      is_paired: true,
    };

    const eqMock = jest.fn();
    // First call: find by code, second call: update
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: eqMock,
      single: jest.fn(),
    });

    // Mock first single() return (find display)
    const singleMock = jest
      .fn()
      .mockResolvedValueOnce({ data: mockUnpairedDisplay, error: null })
      .mockResolvedValueOnce({ data: mockPairedDisplay, error: null });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: singleMock,
    });

    const response = await displaysController.confirm("A1B2", "Living Room");
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockPairedDisplay);
    expect(gateway.server.to).toHaveBeenCalledWith("display:display-1");
  });

  it("should toggle sold out and broadcast layout updates to paired TVs", async () => {
    const mockItem = { id: "item-1", name: "Coffee", is_sold_out: true };
    const mockDisplays = [{ id: "display-1" }, { id: "display-2" }];

    // Mock updates and display query
    const eqMock = jest.fn().mockReturnThis();
    const singleMock = jest
      .fn()
      .mockResolvedValue({ data: mockItem, error: null });

    const fromMock = jest.fn().mockImplementation((table: string) => {
      if (table === "square_items") {
        return {
          select: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          eq: eqMock,
          single: singleMock,
        };
      }
      if (table === "signage_displays") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: mockDisplays, error: null }),
        };
      }
      if (table === "integrations") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return null as any;
    });

    (supabase.from as jest.Mock).mockImplementation(fromMock);

    const response = await posController.toggleSoldOut(
      "item-1",
      undefined,
      true,
    );
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockItem);
    expect(gateway.server.to).toHaveBeenCalledWith("display:display-1");
    expect(gateway.server.to).toHaveBeenCalledWith("display:display-2");
  });
});
