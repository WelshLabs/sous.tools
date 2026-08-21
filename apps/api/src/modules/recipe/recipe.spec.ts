import { Test, TestingModule } from "@nestjs/testing";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { RecipeCostService } from "./recipe-cost.service";
import { IngredientsController } from "./ingredients.controller";
import { IngredientsService } from "./ingredients.service";
import { VesselsController } from "./vessels.controller";
import { VesselsService } from "./vessels.service";
import { RecipeVersionsController } from "./recipe-versions.controller";
import { RecipeVersionsService } from "./recipe-versions.service";
import { RecipeMathService } from "./recipe-math.service";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";
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

describe("Recipe Module Controllers", () => {
  let recipesController: RecipesController;
  let ingredientsController: IngredientsController;
  let vesselsController: VesselsController;
  let versionsController: RecipeVersionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        RecipesController,
        IngredientsController,
        VesselsController,
        RecipeVersionsController,
      ],
      providers: [
        RecipesService,
        RecipeCostService,
        IngredientsService,
        VesselsService,
        RecipeVersionsService,
        RecipeMathService,
        {
          provide: Neo4jSyncService,
          useValue: { handleWebhook: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    recipesController = module.get<RecipesController>(RecipesController);
    ingredientsController = module.get<IngredientsController>(
      IngredientsController,
    );
    vesselsController = module.get<VesselsController>(VesselsController);
    versionsController = module.get<RecipeVersionsController>(
      RecipeVersionsController,
    );
  });

  it("should list vessels successfully", async () => {
    const mockVessels = [
      { id: "v-1", name: "Pullman Pan", shape: "RECTANGULAR", volume_ml: 2300 },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockVessels, error: null }),
    });

    const response = await vesselsController.findAll();
    expect(response.success).toBe(true);
    expect(response.data?.[0].volumeMl).toBe(2300);
  });

  it("should list ingredients successfully", async () => {
    const mockIngredients = [
      { id: "i-1", name: "Bread Flour", density_g_ml: 0.57 },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: mockIngredients, error: null }),
    });

    const response = await ingredientsController.findAll();
    expect(response.success).toBe(true);
    expect(response.data?.[0].densityGMl).toBe(0.57);
  });

  it("should create recipe successfully", async () => {
    const mockRecipe = {
      id: "r-1",
      title: "Sourdough",
      yield_count: 2,
      yield_unit: "loaves",
    };

    const singleMock = jest
      .fn()
      .mockResolvedValue({ data: mockRecipe, error: null });
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: singleMock,
      eq: jest.fn().mockReturnThis(),
    });

    const response = await recipesController.create(
      {
        title: "Sourdough",
        yieldCount: 2,
        yieldUnit: "loaves",
        vesselId: null,
        instructions: [],
      },
      [],
    );
    expect(response.success).toBe(true);
    expect(response.data?.title).toBe("Sourdough");
  });

  it("should create snapshot version successfully", async () => {
    const mockRecipe = {
      id: "r-1",
      title: "Sourdough",
      yield_count: 2,
      yield_unit: "loaves",
      vessel_id: null,
      instructions: [],
      recipe_ingredients: [],
    };
    const mockSnapshot = {
      id: "ver-1",
      recipe_id: "r-1",
      version_number: 1,
      title: "Sourdough",
      yield_count: 2,
      yield_unit: "loaves",
      instructions: [],
      ingredients: [],
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
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockSnapshot, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await versionsController.createVersion("r-1");
    expect(res.success).toBe(true);
    expect(res.data?.versionNumber).toBe(1);
  });
});
