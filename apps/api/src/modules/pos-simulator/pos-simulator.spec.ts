import { Test, TestingModule } from "@nestjs/testing";
import { PosSimulatorResolver } from "./pos-simulator.resolver";
import { SignageGateway } from "../signage/signage.gateway";
import { supabase } from "../../core/database/supabase";
import { Server } from "socket.io";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  },
}));

describe("PosSimulatorResolver", () => {
  let resolver: PosSimulatorResolver;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PosSimulatorResolver, SignageGateway],
    }).compile();

    resolver = module.get<PosSimulatorResolver>(PosSimulatorResolver);
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

    const response = await resolver.getItems({ req: {} });
    expect(response).toEqual(mockItems);
  });
});
