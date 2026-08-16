import { Test, TestingModule } from "@nestjs/testing";
import { UnifiedIngestionService } from "./unified-ingestion.service";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { supabase } from "../../lib/supabase";

jest.mock("../../lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    limit: jest.fn().mockResolvedValue({ data: [] }),
    rpc: jest.fn(),
  },
}));

describe("UnifiedIngestionService", () => {
  let service: UnifiedIngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnifiedIngestionService,
        {
          provide: Neo4jSyncService,
          useValue: {
            syncData: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UnifiedIngestionService>(UnifiedIngestionService);
    jest.clearAllMocks();
  });

  it("should match confirmed vendor alias with score 1.0", async () => {
    // 1st query: vendor_item_aliases
    const mockAliasSingle = jest.fn().mockResolvedValue({
      data: { item_id: "item-123", vendor_item_string: "SYSCO ONIONS" },
    });
    // 2nd query: master_items
    const mockMasterSingle = jest.fn().mockResolvedValue({
      data: { id: "item-123", name: "Yellow Onions" },
    });

    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === "vendor_item_aliases") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          maybeSingle: mockAliasSingle,
        };
      }
      if (table === "master_items") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: mockMasterSingle,
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [] }),
      };
    });

    const results = await service.searchMasterItemsTop5([], {
      orgId: "org-1",
      vendorId: "v-1",
      rawItemName: "SYSCO ONIONS",
    });

    expect(results).toEqual([
      { id: "item-123", name: "Yellow Onions", score: 1.0 },
    ]);
  });

  it("should fallback to vector match RPC when no alias exists", async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      limit: jest.fn().mockResolvedValue({ data: [] }),
    });

    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: [{ id: "item-456", name: "Red Onions", similarity: 0.88 }],
      error: null,
    });

    const results = await service.searchMasterItemsTop5([0.1, 0.2, 0.3], {
      orgId: "org-1",
      vendorId: "v-1",
      rawItemName: "NEW VENDOR ITEM",
    });

    expect(results).toEqual([
      { id: "item-456", name: "Red Onions", score: 0.88 },
    ]);
  });

  it("should update review record state when reviewId is present", async () => {
    const mockUpdateSingle = jest.fn().mockResolvedValue({
      data: { id: "rev-123", status: "PENDING", parsed_data: { pages: [] } },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: mockUpdateSingle,
    });

    const result = await service.updateReviewRecordState("rev-123", {
      pages: [],
      fallbackUsed: false,
    });

    expect(result.id).toBe("rev-123");
    expect(supabase.from).toHaveBeenCalledWith("ingestion_reviews");
  });
});
