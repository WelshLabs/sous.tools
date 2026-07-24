import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jSyncController } from "./neo4j-sync.controller";
import { Neo4jSyncService } from "./neo4j-sync.service";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";

// Mock the config
jest.mock("@soustools/config/server", () => ({
  serverConfig: {
    IS_MOCK_ENV: false,
    SUPABASE_WEBHOOK_SECRET: "my-test-secret",
  },
}));
jest.mock("@soustools/config", () => ({
  config: {
    IS_MOCK_ENV: false,
    SUPABASE_WEBHOOK_SECRET: "my-test-secret",
  },
  serverConfig: {
    IS_MOCK_ENV: false,
    SUPABASE_WEBHOOK_SECRET: "my-test-secret",
  },
}));

describe("Neo4jSync", () => {
  let controller: Neo4jSyncController;
  let service: Neo4jSyncService;

  const mockRepository = {
    upsertNode: jest.fn(),
    deleteNode: jest.fn(),
    createRelationship: jest.fn(),
    createDirectRelationship: jest.fn(),
    deleteRelationship: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [Neo4jSyncController],
      providers: [
        Neo4jSyncService,
        {
          provide: "INeo4jSyncRepository",
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<Neo4jSyncController>(Neo4jSyncController);
    service = module.get<Neo4jSyncService>(Neo4jSyncService);
  });

  describe("Neo4jSyncController", () => {
    it("should compile and be defined", () => {
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    it("should throw UnauthorizedException if signature is missing or incorrect", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "users",
        schema: "auth",
        record: { id: "user-1" },
        old_record: null,
      };

      await expect(
        controller.handleWebhook(payload, "")
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        controller.handleWebhook(payload, "wrong-sig")
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should process webhook and return success: true when signature matches", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "users",
        schema: "auth",
        record: { id: "user-1", email: "test@example.com" },
        old_record: null,
      };

      const result = await controller.handleWebhook(payload, "my-test-secret");
      expect(result).toEqual({ success: true });
      expect(mockRepository.upsertNode).toHaveBeenCalled();
    });
  });

  describe("Neo4jSyncService", () => {
    it("should run upsertNode on user INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "users",
        schema: "auth",
        record: {
          id: "user-1",
          email: "test@example.com",
          role: "authenticated",
          created_at: "2026-07-19T00:00:00Z",
          updated_at: "2026-07-19T00:00:00Z",
          raw_user_meta_data: { full_name: "Conar Welsh" },
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.upsertNode).toHaveBeenCalledWith(
        "User",
        "user-1",
        expect.objectContaining({
          email: "test@example.com",
          role: "authenticated",
          fullName: "Conar Welsh",
        })
      );
    });

    it("should run deleteNode on user DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "users",
        schema: "auth",
        record: null,
        old_record: { id: "user-1" },
      };

      await service.handleWebhook(payload);

      expect(mockRepository.deleteNode).toHaveBeenCalledWith("User", "user-1");
    });

    it("should run upsertNode and create relationships on recipe INSERT/UPDATE", async () => {
      const payload = {
        type: "UPDATE" as const,
        table: "recipes",
        schema: "public",
        record: {
          id: "recipe-1",
          organization_id: "org-1",
          vessel_id: "vessel-1",
          title: "Chocolate Cake",
          yield_count: "8",
          yield_unit: "slices",
          status: "APPROVED",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.upsertNode).toHaveBeenCalledWith(
        "Recipe",
        "recipe-1",
        expect.objectContaining({
          title: "Chocolate Cake",
          yieldCount: 8,
          yieldUnit: "slices",
          status: "APPROVED",
        })
      );

      expect(mockRepository.createRelationship).toHaveBeenCalledWith(
        "Recipe",
        "recipe-1",
        "Organization",
        "org-1",
        "BELONGS_TO",
        "out"
      );

      expect(mockRepository.createRelationship).toHaveBeenCalledWith(
        "Recipe",
        "recipe-1",
        "VesselProfile",
        "vessel-1",
        "USES_VESSEL",
        "out"
      );
    });

    it("should throw BadRequestException if recipe INSERT is missing organization_id", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "recipes",
        schema: "public",
        record: {
          id: "recipe-1",
          title: "Chocolate Cake",
        },
        old_record: null,
      };

      await expect(service.handleWebhook(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should run deleteNode on recipe DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "recipes",
        schema: "public",
        record: null,
        old_record: { id: "recipe-1" },
      };

      await service.handleWebhook(payload);

      expect(mockRepository.deleteNode).toHaveBeenCalledWith("Recipe", "recipe-1");
    });

    it("should run upsertNode and create relationships on recipe_ingredients INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "recipe_ingredients",
        schema: "public",
        record: {
          id: "ri-1",
          recipe_id: "recipe-123",
          master_item_id: "mi-456",
          amount: "2.5",
          unit: "oz",
          prep_notes: "chopped",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.upsertNode).toHaveBeenCalledWith(
        "RecipeIngredient",
        "ri-1",
        expect.objectContaining({
          amount: 2.5,
          unit: "oz",
          prepNotes: "chopped",
        })
      );

      expect(mockRepository.createRelationship).toHaveBeenCalledWith(
        "RecipeIngredient",
        "ri-1",
        "Recipe",
        "recipe-123",
        "INGREDIENT_OF",
        "out"
      );

      expect(mockRepository.createRelationship).toHaveBeenCalledWith(
        "RecipeIngredient",
        "ri-1",
        "MasterItem",
        "mi-456",
        "OF_INGREDIENT",
        "out"
      );
    });

    it("should handle Join Tables on INSERT/UPDATE without creating node", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "org_members",
        schema: "public",
        record: {
          user_id: "user-1",
          organization_id: "org-1",
          role: "ADMIN",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.upsertNode).not.toHaveBeenCalled();
      expect(mockRepository.createDirectRelationship).toHaveBeenCalledWith(
        "User",
        "user-1",
        "Organization",
        "org-1",
        "MEMBER_OF",
        expect.objectContaining({ role: "ADMIN" })
      );
    });

    it("should handle Join Tables on DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "org_members",
        schema: "public",
        record: null,
        old_record: {
          user_id: "user-1",
          organization_id: "org-1",
        },
      };

      await service.handleWebhook(payload);

      expect(mockRepository.deleteNode).not.toHaveBeenCalled();
      expect(mockRepository.deleteRelationship).toHaveBeenCalledWith(
        "User",
        "user-1",
        "Organization",
        "org-1",
        "MEMBER_OF"
      );
    });

    it("should handle pos_order_line_items INSERT and create CONTAINS_ITEM relationship with quantity", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "pos_order_line_items",
        schema: "public",
        record: {
          id: "oli-1",
          organization_id: "org-1",
          pos_order_id: "order-123",
          pos_item_id: "item-456",
          external_id: "line-item-uid-1",
          name: "Cheeseburger",
          quantity: "2.5",
          base_price_money: "12.50",
          gross_sales_money: "31.25",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.upsertNode).not.toHaveBeenCalled();
      expect(mockRepository.createDirectRelationship).toHaveBeenCalledWith(
        "PosOrder",
        "order-123",
        "PosItem",
        "item-456",
        "CONTAINS_ITEM",
        expect.objectContaining({
          quantity: 2.5,
          basePriceMoney: 12.5,
          grossSalesMoney: 31.25,
        })
      );
    });

    it("should gracefully skip pos_order_line_items if pos_item_id is null", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "pos_order_line_items",
        schema: "public",
        record: {
          id: "oli-2",
          organization_id: "org-1",
          pos_order_id: "order-123",
          pos_item_id: null,
          external_id: "line-item-uid-2",
          name: "Custom Fee",
          quantity: "1",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockRepository.createDirectRelationship).not.toHaveBeenCalled();
    });
  });
});
