import { Test, TestingModule } from "@nestjs/testing";
import { IngestionService } from "./ingestion.service";
import { IngestionProcessor } from "./ingestion.processor";
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

    it("should detect line item math errors during Critic cross-examination", async () => {
      const invoiceBlock = {
        type: "INVOICE",
        vendorName: "Sysco",
        invoiceNumber: "INV-101",
        lineItems: [
          {
            rawName: "Olive Oil",
            quantity: 2,
            unitPrice: 25,
            extendedPrice: 60,
          }, // Error: 2 * 25 != 60
        ],
        totals: { subtotal: 60, tax: 5, total: 65 },
      };

      const critique = await processor.critiqueWithClaudeSonnet(
        [invoiceBlock],
        "Sysco Invoice 2 units of Olive Oil at $25 each. Total: $55",
        [],
      );

      expect(critique.passed).toBe(false);
      expect(critique.discrepancies.length).toBeGreaterThan(0);
      const mathError = critique.discrepancies.find(
        (d) => d.type === "MATH_ERROR",
      );
      expect(mathError).toBeDefined();
    });

    it("should execute multi-agent debate and reconcile discrepancies with Gemini 1.5 Pro", async () => {
      // Mock Gemini 1.5 Pro extraction and Claude 3.5 Sonnet critique
      global.fetch = jest
        .fn()
        .mockImplementation(async (url: string, opts: any) => {
          if (typeof url === "string" && url.includes("/chat/completions")) {
            const body = JSON.parse(opts.body || "{}");
            const model = body.model;

            if (
              model === "gemini-1.5-pro" &&
              body.messages[0].content[0].text.includes("Analyze this document")
            ) {
              // Step 2: Primary extraction with deliberate math discrepancy
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
                              vendorName: "Sysco Foods",
                              invoiceNumber: "INV-999",
                              date: "2026-08-21",
                              lineItems: [
                                {
                                  rawName: "Heavy Cream",
                                  quantity: 2,
                                  unitPrice: 15,
                                  extendedPrice: 35,
                                }, // 2*15 != 35
                              ],
                              totals: { subtotal: 35, tax: 3, total: 38 },
                            },
                          ],
                        }),
                      },
                    },
                  ],
                }),
              } as any;
            }

            if (model === "claude-3-5-sonnet") {
              // Step 3: Claude 3.5 Sonnet identifies the discrepancy
              return {
                ok: true,
                json: async () => ({
                  choices: [
                    {
                      message: {
                        content: JSON.stringify({
                          passed: false,
                          confidenceScore: 0.65,
                          critiqueNotes:
                            "Line item 2 * $15 should equal $30, not $35.",
                          discrepancies: [
                            {
                              blockIndex: 0,
                              type: "MATH_ERROR",
                              field: "lineItems[0].extendedPrice",
                              issue: "2 * 15 != 35",
                              suggestedFix: {
                                extendedPrice: 30,
                                subtotal: 30,
                                total: 33,
                              },
                            },
                          ],
                        }),
                      },
                    },
                  ],
                }),
              } as any;
            }

            if (
              model === "gemini-1.5-pro" &&
              body.messages[0].content[0].text.includes(
                "Reconcile your extraction",
              )
            ) {
              // Step 4: Gemini 1.5 Pro reconciles the debate and produces corrected output
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
                              vendorName: "Sysco Foods",
                              invoiceNumber: "INV-999",
                              date: "2026-08-21",
                              lineItems: [
                                {
                                  rawName: "Heavy Cream",
                                  quantity: 2,
                                  unitPrice: 15,
                                  extendedPrice: 30,
                                },
                              ],
                              totals: { subtotal: 30, tax: 3, total: 33 },
                            },
                          ],
                        }),
                      },
                    },
                  ],
                }),
              } as any;
            }
          }
          return { ok: false, text: async () => "Not found" } as any;
        });

      jest.spyOn(service, "getEmbedding").mockResolvedValue([0.1, 0.2, 0.3]);

      jest
        .spyOn(service, "searchMasterItemsTop5")
        .mockResolvedValue([
          { id: "item-cream-1", name: "Heavy Cream", score: 0.98 },
        ]);

      const result = await (processor as any).extractPageBlocks(
        "Sysco Foods Invoice #INV-999. 2x Heavy Cream @ $15 = $30. Tax: $3, Total: $33",
        undefined,
        "conv-123",
        "org-1",
        "user-1",
      );

      expect(result.debateOccurred).toBe(true);
      expect(result.blocks.length).toBe(1);
      const invoiceBlock = result.blocks[0];
      expect(invoiceBlock.type).toBe("INVOICE");
      expect(invoiceBlock.debateOccurred).toBe(true);
      expect(invoiceBlock.lineItems?.[0].extendedPrice).toBe(30);
      expect(invoiceBlock.totals?.subtotal).toBe(30);
      expect(invoiceBlock.totals?.total).toBe(33);
      expect(invoiceBlock.lineItems?.[0].normalizedName).toBe(
        "Cream, fluid, heavy whipping",
      );
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
