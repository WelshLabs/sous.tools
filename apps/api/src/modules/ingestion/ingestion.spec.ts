import { Test, TestingModule } from "@nestjs/testing";
import { IngestionService } from "./ingestion.service";
import { IngestionProcessor } from "./ingestion.processor";
import { RecipeMathService } from "../recipe/recipe-math.service";
import { UsdaResolverService } from "../nutrition/usda-resolver.service";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { CommandsGateway } from "../commands/commands.gateway";
import { ChatPersistenceService } from "../commands/chat-persistence.service";
import { supabase } from "../../core/database/supabase";
import { createHash } from "crypto";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    single: jest.fn().mockResolvedValue({ data: null }),
    limit: jest.fn().mockResolvedValue({ data: [] }),
    rpc: jest.fn(),
  },
}));

describe("Ingestion Module", () => {
  let service: IngestionService;
  let processor: IngestionProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        IngestionProcessor,
        RecipeMathService,
        {
          provide: UsdaResolverService,
          useValue: {
            searchTop5: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: Neo4jSyncService,
          useValue: {
            syncData: jest.fn().mockResolvedValue(undefined),
            handleWebhook: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: CommandsGateway,
          useValue: {
            emitIngestionUpdate: jest.fn(),
            emitChatMessageToConversation: jest.fn(),
          },
        },
        {
          provide: ChatPersistenceService,
          useValue: {
            appendMessage: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    processor = module.get<IngestionProcessor>(IngestionProcessor);
    jest.clearAllMocks();
  });

  describe("IngestionService", () => {
    it("should match confirmed vendor alias with score 1.0", async () => {
      const mockAliasSingle = jest.fn().mockResolvedValue({
        data: { item_id: "item-123", vendor_item_string: "SYSCO ONIONS" },
      });
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

    it("should compute deterministic idempotency hash for vendor_id + invoice_id + date", () => {
      const vendorId = "v-sysco-123";
      const invoiceId = "INV-2026-001";
      const date = "2026-08-21";

      const hash = service.computeIdempotencyHash(vendorId, invoiceId, date);
      const expected = createHash("sha256")
        .update("v-sysco-123:inv-2026-001:2026-08-21")
        .digest("hex");

      expect(hash).toBe(expected);
    });

    it("should prevent duplicate ingestion review insertion when hash matches existing review", async () => {
      const existingReview = {
        id: "rev-existing-123",
        organization_id: "org-1",
        parsed_data: {
          idempotencyHash: "hash-123",
          pages: [],
        },
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: existingReview }),
      });

      const result = await service.createReviewRecord({
        organizationId: "org-1",
        source: "upload",
        documentHash: "hash-123",
        parsedData: {
          pages: [],
          idempotencyHash: "hash-123",
        },
      });

      expect(result).toEqual(existingReview);
    });

    it("should detect duplicate invoice by invoice_number and organization_id", async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest
          .fn()
          .mockResolvedValue({ data: { id: "inv-existing" } }),
      });

      const isDup = await service.checkDuplicateInvoice(
        "org-1",
        "vendor-1",
        "INV-100",
        "2026-08-21",
      );

      expect(isDup).toBe(true);
    });
  });

  describe("IngestionProcessor Promise.allSettled Resilience", () => {
    it("should catch errors in ingredient resolution, mark resolutionError: true, and continue processing", async () => {
      // Mock LiteLLM fetch to return recipe with 2 ingredients
      global.fetch = jest.fn().mockImplementation(async (url: string) => {
        if (typeof url === "string" && url.includes("/chat/completions")) {
          return {
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      blocks: [
                        {
                          type: "RECIPE",
                          title: "Test Recipe",
                          ingredients: [
                            { rawName: "Salt", quantity: 1, unit: "tsp" },
                            {
                              rawName: "Failing Item",
                              quantity: 2,
                              unit: "tbsp",
                            },
                          ],
                        },
                      ],
                    }),
                  },
                },
              ],
            }),
          } as any;
        }
        return { ok: false, text: async () => "Not found" } as any;
      });

      // Mock getEmbedding to succeed for Salt, fail for Failing Item
      jest
        .spyOn(service, "getEmbedding")
        .mockImplementation(async (text: string) => {
          if (text === "Failing Item") {
            throw new Error("Embedding API failure");
          }
          return [0.1, 0.2];
        });

      jest
        .spyOn(service, "searchMasterItemsTop5")
        .mockResolvedValue([{ id: "item-1", name: "Salt", score: 0.95 }]);

      const extractResult = await (processor as any).extractPageBlocks(
        "Recipe with Salt and Failing Item",
        undefined,
        undefined,
        "org-1",
      );

      expect(extractResult.blocks.length).toBeGreaterThan(0);
      const recipeBlock = extractResult.blocks.find(
        (b: any) => b.type === "RECIPE",
      );
      expect(recipeBlock).toBeDefined();
      expect(recipeBlock.ingredients.length).toBe(2);

      // First ingredient succeeded
      expect(recipeBlock.ingredients[0].rawName).toBe("Salt");
      expect(recipeBlock.ingredients[0].resolutionError).toBe(false);
      expect(recipeBlock.ingredients[0].autoAccepted).toBe(true);

      // Second ingredient caught error and marked resolutionError: true
      expect(recipeBlock.ingredients[1].rawName).toBe("Failing Item");
      expect(recipeBlock.ingredients[1].resolutionError).toBe(true);
      expect(recipeBlock.ingredients[1].autoAccepted).toBe(false);
    });

    it("should catch errors in invoice line item resolution, mark resolutionError: true, and continue processing", async () => {
      global.fetch = jest.fn().mockImplementation(async (url: string) => {
        if (typeof url === "string" && url.includes("/chat/completions")) {
          return {
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      blocks: [
                        {
                          type: "INVOICE",
                          vendorName: "Sysco",
                          invoiceNumber: "INV-999",
                          date: "2026-08-21",
                          lineItems: [
                            {
                              rawName: "Olive Oil",
                              unitPrice: 20,
                              extendedPrice: 40,
                            },
                            {
                              rawName: "Crashing Line Item",
                              unitPrice: 10,
                              extendedPrice: 10,
                            },
                          ],
                        },
                      ],
                    }),
                  },
                },
              ],
            }),
          } as any;
        }
        return { ok: false, text: async () => "Not found" } as any;
      });

      jest
        .spyOn(service, "getEmbedding")
        .mockImplementation(async (text: string) => {
          if (text === "Crashing Line Item") {
            throw new Error("Service Timeout");
          }
          return [0.1, 0.2];
        });

      jest
        .spyOn(service, "searchMasterItemsTop5")
        .mockResolvedValue([
          { id: "item-olive-oil", name: "Olive Oil", score: 0.99 },
        ]);

      const extractResult = await (processor as any).extractPageBlocks(
        "Invoice Sysco total 270",
        undefined,
        undefined,
        "org-1",
      );

      const invoiceBlock = extractResult.blocks.find(
        (b: any) => b.type === "INVOICE",
      );
      expect(invoiceBlock).toBeDefined();
      expect(invoiceBlock.idempotencyHash).toBeDefined();
      expect(invoiceBlock.lineItems.length).toBe(2);

      // Succeeded line item
      expect(invoiceBlock.lineItems[0].rawName).toBe("Olive Oil");
      expect(invoiceBlock.lineItems[0].resolutionError).toBe(false);

      // Failed line item caught error
      expect(invoiceBlock.lineItems[1].rawName).toBe("Crashing Line Item");
      expect(invoiceBlock.lineItems[1].resolutionError).toBe(true);
    });
  });
});
