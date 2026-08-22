import { Test, TestingModule } from "@nestjs/testing";
import { RecipesResolver } from "./recipes.resolver";
import { RecipesService } from "./recipes.service";
import { RecipeCostService } from "./recipe-cost.service";
import { IngredientsService } from "./ingredients.service";
import { VesselsResolver } from "./vessels.resolver";
import { VesselsService } from "./vessels.service";
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

describe("Recipe Module Resolvers", () => {
  let recipesResolver: RecipesResolver;
  let vesselsResolver: VesselsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesResolver,
        RecipesService,
        RecipeCostService,
        IngredientsService,
        VesselsResolver,
        VesselsService,
        RecipeVersionsService,
        RecipeMathService,
        {
          provide: Neo4jSyncService,
          useValue: { handleWebhook: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    recipesResolver = module.get<RecipesResolver>(RecipesResolver);
    vesselsResolver = module.get<VesselsResolver>(VesselsResolver);
  });

  it("should list recipes successfully", async () => {
    const mockRecipes = [{ id: "r-1", title: "Sourdough" }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockRecipes, error: null }),
    });

    const response = await recipesResolver.getRecipes("", { req: {} });
    expect(response?.[0].title).toBe("Sourdough");
  });

  it("should list vessels successfully", async () => {
    const mockVessels = [
      { id: "v-1", name: "Pullman Pan", shape: "RECTANGULAR", volume_liters: 2.3 },
    ];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockVessels, error: null }),
    });

    const response = await vesselsResolver.getVesselProfiles({ req: {} });
    expect(response?.[0].name).toBe("Pullman Pan");
  });
});
