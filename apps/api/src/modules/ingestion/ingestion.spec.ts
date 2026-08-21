import { Test, TestingModule } from "@nestjs/testing";
import { IngestionService, IngestionReviewPayload } from "./ingestion.service";
import { IngestionProcessor } from "./ingestion.processor";
import { RecipeMathService } from "../recipe/recipe-math.service";
import { UsdaResolverService } from "../nutrition/usda-resolver.service";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
import { CommandsGateway } from "../commands/commands.gateway";
import { ChatPersistenceService } from "../commands/chat-persistence.service";
import { normalizeCulinaryTerms } from "./culinary-normalizer";
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
    upsert: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    single: jest.fn().mockResolvedValue({ data: null }),
    limit: jest.fn().mockResolvedValue({ data: [] }),
    rpc: jest.fn(),
  },
}));

describe("Ingestion Module", () => {
  let service: IngestionService;
  let processor: IngestionProcessor;
  let neo4jSync: Neo4jSyncService;

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
    neo4jSync = module.get<Neo4jSyncService>(Neo4jSyncService);
    jest.clearAllMocks();
  });

  describe("normalizeCulinaryTerms", () => {
    it("should normalize EVOO to extra virgin olive oil", async () => {
      const normalized = await normalizeCulinaryTerms("EVOO");
      expect(normalized).toBe("Oil, olive, extra virgin");
    });

    it("should normalize AP flour with package notes", async () => {
      const normalized = await normalizeCulinaryTerms("50lb AP Flour Sysco");
      expect(normalized).toBe("Flour, wheat, all-purpose");
    });

    it("should normalize Heavy Cream and Butter variations", async () => {
      const cream = await normalizeCulinaryTerms("Heavy Whipping Cream");
      expect(cream).toBe("Cream, fluid, heavy whipping");

      const butter = await normalizeCulinaryTerms("Unsalted Butter");
      expect(butter).toBe("Butter, without salt");
    });

    it("should normalize Kosher Salt and Aromatics", async () => {
      const salt = await normalizeCulinaryTerms("Kosher Salt");
      expect(salt).toBe("Salt, table");

      const garlic = await normalizeCulinaryTerms("Minced Garlic");
      expect(garlic).toBe("Garlic, raw");

      const onion = await normalizeCulinaryTerms("Yellow Onions 10lb");
      expect(onion).toBe("Onions, yellow, raw");
    });
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

  describe("Human-in-the-Loop Feedback Learning & Upsert Aliases (Task #193)", () => {
    it("should upsert vendor_item_aliases on approval and notify Neo4j sync", async () => {
      const mockUpsertResult = {
        id: "alias-1",
        organization_id: "org-1",
        vendor_id: "vendor-sysco",
        vendor_item_string: "SYSCO CHICKEN BREAST",
        item_id: "item-chicken-1",
      };

      (supabase.from as jest.Mock).mockReturnValue({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockUpsertResult }),
      });

      const result = await service.upsertVendorItemAlias({
        organizationId: "org-1",
        vendorId: "vendor-sysco",
        vendorItemString: "SYSCO CHICKEN BREAST",
        itemId: "item-chicken-1",
      });

      expect(result).toEqual(mockUpsertResult);
      expect(neo4jSync.handleWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "INSERT",
          table: "vendor_item_aliases",
          record: mockUpsertResult,
        }),
      );
    });

    it("should capture human delta corrections on commitReviewPayload and persist into vector memory", async () => {
      jest.spyOn(service, "getEmbedding").mockResolvedValue([0.05, 0.08]);

      const originalPayload: IngestionReviewPayload = {
        pages: [
          {
            pageNumber: 1,
            blocks: [
              {
                id: "b-1",
                type: "INVOICE",
                bbox: [0, 0, 1000, 1000],
                vendorId: "vendor-sysco",
                vendorName: "Sysco",
                lineItems: [
                  {
                    rawName: "EVOO 1Gal",
                    guessName: "EVOO",
                    selectedTenantId: "item-old-id",
                    selectedUsdaId: 1001,
                    unitPrice: 30,
                    tenantMatches: [{ id: "item-old-id", name: "Old EVOO" }],
                    usdaMatches: [
                      { fdcId: 1001, description: "Old USDA EVOO" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const approvedPayload: IngestionReviewPayload = {
        pages: [
          {
            pageNumber: 1,
            blocks: [
              {
                id: "b-1",
                type: "INVOICE",
                bbox: [0, 0, 1000, 1000],
                vendorId: "vendor-sysco",
                vendorName: "Sysco",
                lineItems: [
                  {
                    rawName: "EVOO 1Gal",
                    guessName: "Extra Virgin Olive Oil",
                    selectedTenantId: "item-new-correct-id",
                    selectedUsdaId: 171413,
                    unitPrice: 30,
                    tenantMatches: [
                      {
                        id: "item-new-correct-id",
                        name: "Olive Oil, Extra Virgin",
                      },
                    ],
                    usdaMatches: [
                      {
                        fdcId: 171413,
                        description: "Oil, olive, extra virgin",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "ingestion_reviews") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: "rev-1", parsed_data: originalPayload },
            }),
            update: jest.fn().mockReturnThis(),
          };
        }
        if (table === "vendor_item_aliases") {
          return {
            upsert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: "alias-evoo",
                item_id: "item-new-correct-id",
                vendor_item_string: "EVOO 1Gal",
              },
            }),
          };
        }
        if (table === "core_knowledge_vectors") {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: "vector-corr-1",
                document_type: "CORRECTION",
              },
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null }),
          single: jest.fn().mockResolvedValue({ data: { id: "record-1" } }),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
        };
      });

      const commitRes = await service.commitReviewPayload(
        "rev-1",
        approvedPayload,
        "org-1",
        "user-1",
      );

      expect(commitRes.success).toBe(true);
      expect(commitRes.correctionsCaptured).toBe(1);
    });

    it("should generate few-shot training prompt from stored human corrections and confirmed aliases", async () => {
      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "vendor_item_aliases") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  vendor_item_string: "SYSCO CHIK 10LB",
                  item_id: "master-chicken-uuid",
                },
              ],
            }),
          };
        }
        if (table === "core_knowledge_vectors") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  content: "Correction content",
                  source_meta: {
                    rawInput: "EVOO 1L",
                    correctedExtraction: {
                      canonicalName: "Oil, olive, extra virgin",
                      selectedTenantName: "Olive Oil EV",
                      selectedUsdaDescription: "Oil, olive, extra virgin",
                      unit: "liter",
                      unitPrice: 15,
                    },
                  },
                },
              ],
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [] }),
        };
      });

      const promptSection = await service.getFewShotExamples({
        organizationId: "org-1",
        vendorId: "vendor-sysco",
      });

      expect(promptSection).toContain("FEW-SHOT TRAINING EXAMPLES");
      expect(promptSection).toContain("SYSCO CHIK 10LB");
      expect(promptSection).toContain("master-chicken-uuid");
      expect(promptSection).toContain("EVOO 1L");
      expect(promptSection).toContain("Oil, olive, extra virgin");
    });

    it("should aggregate raw_unmapped_data across reviews in weekly cron job", async () => {
      const mockReviews = [
        {
          id: "r1",
          organization_id: "org-1",
          parsed_data: {
            pages: [
              {
                pageNumber: 1,
                blocks: [
                  {
                    type: "INVOICE",
                    rawUnmappedData: {
                      delivery_notes: "Leave at backdoor dock 3",
                      fuel_surcharge: 12.5,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          id: "r2",
          organization_id: "org-1",
          parsed_data: {
            pages: [
              {
                pageNumber: 1,
                blocks: [
                  {
                    type: "INVOICE",
                    rawUnmappedData: {
                      delivery_notes: "Ring bell before 9am",
                      freight_fee: 25.0,
                    },
                  },
                ],
              },
            ],
          },
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockReviews }),
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const report = await service.aggregateRawUnmappedData("org-1");

      expect(report.totalReviewsAnalyzed).toBe(2);
      expect(report.totalUnmappedEntries).toBe(4);
      expect(report.keyFrequency["delivery_notes"]).toBe(2);
      expect(report.recommendedSchemaAdditions.length).toBeGreaterThan(0);
      expect(report.recommendedSchemaAdditions[0]).toContain("delivery_notes");
    });
  });

  describe("Multi-Agent Debate Pipeline & Critic Verification", () => {
    it("should triage document input correctly via heuristics or Ollama", async () => {
      const invoiceTriage = await processor.triageInput(
        "Sysco Invoice #1234 Total: $250.00 Subtotal: $230.00 Tax: $20.00",
      );
      expect(invoiceTriage.documentType).toBe("INVOICE");

      const recipeTriage = await processor.triageInput(
        "Classic French Onion Soup Recipe. Servings: 6. Ingredients: 4 tbsp butter, 3 lbs onions, 2 tsp salt",
      );
      expect(recipeTriage.documentType).toBe("RECIPE");
    });

    it("should auto-commit items when pgvector similarity >= 0.95", async () => {
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
                          invoiceNumber: "INV-101",
                          date: "2026-08-21",
                          lineItems: [
                            {
                              rawName: "Yellow Onions 50lb",
                              unitPrice: 20,
                              extendedPrice: 20,
                            },
                          ],
                          totals: { subtotal: 20, tax: 0, total: 20 },
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

      jest.spyOn(service, "getEmbedding").mockResolvedValue([0.1, 0.2]);

      // High pgvector similarity (0.96 >= 0.95)
      jest
        .spyOn(service, "searchMasterItemsTop5")
        .mockResolvedValue([
          { id: "item-onions", name: "Yellow Onions", score: 0.96 },
        ]);

      const result = await (processor as any).extractPageBlocks(
        "Sysco Invoice Yellow Onions 50lb $20",
        undefined,
        undefined,
        "org-1",
      );

      expect(result.blocks.length).toBe(1);
      const invoice = result.blocks[0];
      expect(invoice.lineItems[0].autoAccepted).toBe(true);
      expect(invoice.lineItems[0].selectedTenantId).toBe("item-onions");
    });

    it("should not auto-commit items when pgvector similarity is below 0.95", async () => {
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
                          invoiceNumber: "INV-102",
                          date: "2026-08-21",
                          lineItems: [
                            {
                              rawName: "Mystery Spice Blend",
                              unitPrice: 10,
                              extendedPrice: 10,
                            },
                          ],
                          totals: { subtotal: 10, tax: 0, total: 10 },
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

      jest.spyOn(service, "getEmbedding").mockResolvedValue([0.1, 0.2]);

      // Low similarity (0.80 < 0.95)
      jest
        .spyOn(service, "searchMasterItemsTop5")
        .mockResolvedValue([
          { id: "item-spice", name: "Mixed Spice", score: 0.8 },
        ]);

      const result = await (processor as any).extractPageBlocks(
        "Sysco Invoice Mystery Spice Blend $10",
        undefined,
        undefined,
        "org-1",
      );

      expect(result.blocks.length).toBe(1);
      const invoice = result.blocks[0];
      expect(invoice.lineItems[0].autoAccepted).toBe(false);
    });
  });

  describe("IngestionProcessor Promise.allSettled Resilience", () => {
    it("should catch errors in ingredient resolution, mark resolutionError: true, and continue processing", async () => {
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
        .mockResolvedValue([{ id: "item-1", name: "Salt", score: 0.98 }]);

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

      // First ingredient succeeded with high score
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
