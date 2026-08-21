import { Test, TestingModule } from "@nestjs/testing";
import { RecipeVersionsService } from "./recipe-versions.service";
import { supabase } from "../../core/database/supabase";

jest.mock("../../core/database/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("RecipeVersionsService", () => {
  let service: RecipeVersionsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeVersionsService],
    }).compile();

    service = module.get<RecipeVersionsService>(RecipeVersionsService);
  });

  describe("createSnapshot", () => {
    it("should create a new recipe version snapshot with incremented version number", async () => {
      const mockRecipe = {
        id: "recipe-1",
        title: "Country Sourdough",
        yield_count: 2,
        yield_unit: "loaves",
        vessel_id: "vessel-1",
        instructions: [{ stepNumber: 1, text: "Mix flour and water" }],
        recipe_ingredients: [
          {
            id: "ri-1",
            recipe_id: "recipe-1",
            raw_name: "Bread Flour",
            amount: 500,
            unit: "g",
            calculation_type: "bakers_percentage",
            base_calculation_group: true,
            is_reference: true,
            bakers_percentage: 100,
            standard_weight_g: 500,
          },
        ],
      };

      const mockExistingVersions = [{ version_number: 1 }];
      const mockInsertedVersion = {
        id: "ver-2",
        recipe_id: "recipe-1",
        version_number: 2,
        title: "Country Sourdough",
        yield_count: 2,
        yield_unit: "loaves",
        vessel_id: "vessel-1",
        instructions: mockRecipe.instructions,
        ingredients: mockRecipe.recipe_ingredients,
        created_at: "2026-08-21T00:00:00Z",
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "recipes") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockRecipe, error: null }),
          };
        }
        if (table === "formula_versions") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest
              .fn()
              .mockResolvedValue({ data: mockExistingVersions, error: null }),
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest
                  .fn()
                  .mockResolvedValue({
                    data: mockInsertedVersion,
                    error: null,
                  }),
              }),
            }),
          };
        }
        return {};
      });

      const result = await service.createSnapshot("recipe-1");
      expect(result).toBeDefined();
      expect(result.versionNumber).toBe(2);
      expect(result.title).toBe("Country Sourdough");
      expect(result.ingredients).toHaveLength(1);
    });
  });

  describe("getVersions", () => {
    it("should return all versions for a recipe ordered by version number", async () => {
      const mockVersions = [
        {
          id: "ver-2",
          recipe_id: "recipe-1",
          version_number: 2,
          title: "v2",
          yield_count: 2,
          yield_unit: "loaves",
          instructions: [],
          ingredients: [],
          created_at: "2026-08-21T01:00:00Z",
        },
        {
          id: "ver-1",
          recipe_id: "recipe-1",
          version_number: 1,
          title: "v1",
          yield_count: 2,
          yield_unit: "loaves",
          instructions: [],
          ingredients: [],
          created_at: "2026-08-21T00:00:00Z",
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockVersions, error: null }),
      });

      const results = await service.getVersions("recipe-1");
      expect(results).toHaveLength(2);
      expect(results[0].versionNumber).toBe(2);
      expect(results[1].versionNumber).toBe(1);
    });
  });

  describe("restoreVersion", () => {
    it("should restore a recipe and re-insert ingredients from snapshot", async () => {
      const mockSnapshot = {
        id: "ver-1",
        recipe_id: "recipe-1",
        version_number: 1,
        title: "Original Sourdough",
        yield_count: 1,
        yield_unit: "loaf",
        vessel_id: null,
        instructions: [{ stepNumber: 1, text: "Autolyse" }],
        ingredients: [
          {
            rawName: "Bread Flour",
            amount: 400,
            unit: "g",
            calculationType: "fixed_weight",
            standardWeightG: 400,
          },
        ],
        created_at: "2026-08-20T00:00:00Z",
      };

      const mockRestoredRecipe = {
        id: "recipe-1",
        title: "Original Sourdough",
        yield_count: 1,
        yield_unit: "loaf",
        vessel_id: null,
        instructions: [{ stepNumber: 1, text: "Autolyse" }],
        recipe_ingredients: mockSnapshot.ingredients,
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "formula_versions") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockSnapshot, error: null }),
          };
        }
        if (table === "recipes") {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest
              .fn()
              .mockResolvedValue({ data: mockRestoredRecipe, error: null }),
          };
        }
        if (table === "recipe_ingredients") {
          return {
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const restored = await service.restoreVersion("recipe-1", 1);
      expect(restored.title).toBe("Original Sourdough");
      expect(restored.yieldCount).toBe(1);
    });
  });
});
