import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jSyncController } from "./neo4j-sync.controller";
import { Neo4jSyncService } from "./neo4j-sync.service";
import { Neo4jService } from "./neo4j.service";
import { UnauthorizedException, BadRequestException } from "@nestjs/common";

// Mock the Neo4jService and config
jest.mock("./neo4j.service");
jest.mock("@soustools/config", () => ({
  config: {
    IS_MOCK_ENV: false,
    SUPABASE_WEBHOOK_SECRET: "my-test-secret",
  },
}));

describe("Neo4jSync", () => {
  let controller: Neo4jSyncController;
  let service: Neo4jSyncService;

  const mockNeo4jService = {
    runQuery: jest.fn(),
  };

  beforeEach(async () => {
    mockNeo4jService.runQuery.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [Neo4jSyncController],
      providers: [
        Neo4jSyncService,
        {
          provide: Neo4jService,
          useValue: mockNeo4jService,
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
      expect(mockNeo4jService.runQuery).toHaveBeenCalled();
    });
  });

  describe("Neo4jSyncService", () => {
    it("should run MERGE on user INSERT/UPDATE", async () => {
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

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (u:User {id: $id})"),
        expect.objectContaining({
          id: "user-1",
          properties: {
            email: "test@example.com",
            role: "authenticated",
            fullName: "Conar Welsh",
            createdAt: "2026-07-19T00:00:00Z",
            updatedAt: "2026-07-19T00:00:00Z",
          },
        }),
      );
    });

    it("should run DETACH DELETE on user DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "users",
        schema: "auth",
        record: null,
        old_record: { id: "user-1" },
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (u:User {id: $id})"),
        expect.objectContaining({ id: "user-1" }),
      );
    });

    it("should run MERGE on recipe INSERT/UPDATE", async () => {
      const payload = {
        type: "UPDATE" as const,
        table: "recipes",
        schema: "public",
        record: {
          id: "recipe-1",
          organization_id: "org-1",
          title: "Chocolate Cake",
          yield_count: "8",
          yield_unit: "slices",
          status: "APPROVED",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (r:Recipe {id: $id})"),
        expect.objectContaining({
          id: "recipe-1",
          organizationId: "org-1",
          properties: expect.objectContaining({
            title: "Chocolate Cake",
            yieldCount: 8,
            yieldUnit: "slices",
            status: "APPROVED",
          }),
        }),
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

    it("should run DETACH DELETE on recipe DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "recipes",
        schema: "public",
        record: null,
        old_record: { id: "recipe-1" },
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (r:Recipe {id: $id})"),
        expect.objectContaining({ id: "recipe-1" }),
      );
    });

    it("should run MERGE on recipe_ingredients INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "recipe_ingredients",
        schema: "public",
        record: {
          id: "ri-1",
          recipe_id: "recipe-123",
          item_id: "item-456",
          amount: "2.5",
          unit: "oz",
          prep_notes: "chopped",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (ri:RecipeIngredient {id: $id})"),
        expect.objectContaining({
          id: "ri-1",
          recipeId: "recipe-123",
          itemId: "item-456",
          amount: 2.5,
          unit: "oz",
          prepNotes: "chopped",
        }),
      );
    });

    it("should run DETACH DELETE on recipe_ingredients DELETE", async () => {
      const payload = {
        type: "DELETE" as const,
        table: "recipe_ingredients",
        schema: "public",
        record: null,
        old_record: { id: "ri-1" },
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MATCH (ri:RecipeIngredient {id: $id})"),
        expect.objectContaining({ id: "ri-1" }),
      );
    });

    it("should run MERGE on vendor_item_aliases INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "vendor_item_aliases",
        schema: "public",
        record: {
          id: "via-1",
          organization_id: "org-1",
          vendor_id: "vendor-1",
          vendor_item_name: "Sysco Potatoes",
          internal_item_id: "item-123",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (via:VendorItemAlias {id: $id})"),
        expect.objectContaining({
          id: "via-1",
          vendorId: "vendor-1",
          internalItemId: "item-123",
          vendorItemName: "Sysco Potatoes",
        }),
      );
    });

    it("should run MERGE on tickets INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "tickets",
        schema: "public",
        record: {
          id: "ticket-1",
          organization_id: "org-1",
          employee_id: "employee-123",
          table_number: "Table 4",
          section: "Patio",
          status: "OPEN",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (t:Ticket {id: $id})"),
        expect.objectContaining({
          id: "ticket-1",
          organizationId: "org-1",
          employeeId: "employee-123",
          properties: {
            tableNumber: "Table 4",
            section: "Patio",
            status: "OPEN",
            createdAt: null,
          },
        }),
      );
    });

    it("should run MERGE on order_items INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "order_items",
        schema: "public",
        record: {
          id: "oi-1",
          order_id: "order-123",
          recipe_id: "recipe-456",
          quantity: "2",
          unit_price: "15.50",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (oi:OrderItem {id: $id})"),
        expect.objectContaining({
          id: "oi-1",
          orderId: "order-123",
          recipeId: "recipe-456",
          quantity: 2,
        }),
      );
    });

    it("should run MERGE on wastage_logs INSERT/UPDATE", async () => {
      const payload = {
        type: "INSERT" as const,
        table: "wastage_logs",
        schema: "public",
        record: {
          id: "wl-1",
          organization_id: "org-1",
          item_id: "item-123",
          recipe_id: "recipe-456",
          quantity: "500",
          reason: "spoiled",
          recorded_by: "user-789",
        },
        old_record: null,
      };

      await service.handleWebhook(payload);

      expect(mockNeo4jService.runQuery).toHaveBeenCalledWith(
        expect.stringContaining("MERGE (wl:WastageLog {id: $id})"),
        expect.objectContaining({
          id: "wl-1",
          organizationId: "org-1",
          itemId: "item-123",
          recipeId: "recipe-456",
          recordedBy: "user-789",
        }),
      );
    });
  });
});
