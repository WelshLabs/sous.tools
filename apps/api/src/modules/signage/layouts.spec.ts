import { Test, TestingModule } from "@nestjs/testing";
import { SignageResolver } from "./signage.resolver";
import { LayoutsService } from "./layouts.service";
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
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("SignageResolver Layouts", () => {
  let resolver: SignageResolver;
  let gateway: SignageGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignageResolver,
        LayoutsService,
        DisplaysService,
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

  it("should create a deck successfully", async () => {
    const mockDeck = { id: "deck-1", name: "New Deck", slug: "new-deck" };
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockDeck, error: null }),
    });

    const response = await resolver.createDeck(
      { name: "New Deck" },
      { req: {} },
    );
    expect(response).toEqual(mockDeck);
  });
});
