import { Test, TestingModule } from "@nestjs/testing";
import { RecipeMathService } from "./recipe-math.service";

describe("RecipeMathService", () => {
  let service: RecipeMathService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeMathService],
    }).compile();

    service = module.get<RecipeMathService>(RecipeMathService);
  });

  describe("determineCalculationType", () => {
    it("should classify weight units as fixed_weight", () => {
      expect(service.determineCalculationType("g")).toBe("fixed_weight");
      expect(service.determineCalculationType("grams")).toBe("fixed_weight");
      expect(service.determineCalculationType("kg")).toBe("fixed_weight");
      expect(service.determineCalculationType("oz")).toBe("fixed_weight");
      expect(service.determineCalculationType("lbs")).toBe("fixed_weight");
      expect(service.determineCalculationType("pound")).toBe("fixed_weight");
    });

    it("should classify volume units as fixed_volume", () => {
      expect(service.determineCalculationType("ml")).toBe("fixed_volume");
      expect(service.determineCalculationType("L")).toBe("fixed_volume");
      expect(service.determineCalculationType("cup")).toBe("fixed_volume");
      expect(service.determineCalculationType("tbsp")).toBe("fixed_volume");
      expect(service.determineCalculationType("tsp")).toBe("fixed_volume");
      expect(service.determineCalculationType("fl oz")).toBe("fixed_volume");
    });

    it("should classify percent as bakers_percentage", () => {
      expect(service.determineCalculationType("%")).toBe("bakers_percentage");
      expect(service.determineCalculationType("percent")).toBe(
        "bakers_percentage",
      );
      expect(service.determineCalculationType("bakers_percentage")).toBe(
        "bakers_percentage",
      );
    });

    it("should classify count, piece, bunch, and discrete units as each", () => {
      expect(service.determineCalculationType("ea")).toBe("each");
      expect(service.determineCalculationType("each")).toBe("each");
      expect(service.determineCalculationType("clove")).toBe("each");
      expect(service.determineCalculationType("cloves")).toBe("each");
      expect(service.determineCalculationType("bunch")).toBe("each");
      expect(service.determineCalculationType("bunches")).toBe("each");
      expect(service.determineCalculationType("stalk")).toBe("each");
      expect(service.determineCalculationType("sprig")).toBe("each");
      expect(service.determineCalculationType("stick")).toBe("each");
      expect(service.determineCalculationType("can")).toBe("each");
      expect(service.determineCalculationType("pinch")).toBe("each");
    });
  });

  describe("Culinary Encyclopedia & Weight Estimation", () => {
    it("should estimate weights for discrete count items", () => {
      const eggEst = service.getEstimatedWeight("Large Egg", 2, "ea");
      expect(eggEst).not.toBeNull();
      expect(eggEst?.totalWeightG).toBe(100);

      const garlicEst = service.getEstimatedWeight("Garlic Clove", 3, "cloves");
      expect(garlicEst).not.toBeNull();
      expect(garlicEst?.totalWeightG).toBe(12);

      const butterEst = service.getEstimatedWeight("Butter", 1, "stick");
      expect(butterEst).not.toBeNull();
      expect(butterEst?.totalWeightG).toBe(113.4);
    });

    it("should estimate weights for bunches and produce items", () => {
      const scallionEst = service.getEstimatedWeight("Scallions", 2, "bunch");
      expect(scallionEst).not.toBeNull();
      expect(scallionEst?.totalWeightG).toBe(200);

      const cilantroEst = service.getEstimatedWeight(
        "Fresh Cilantro",
        1,
        "bunch",
      );
      expect(cilantroEst).not.toBeNull();
      expect(cilantroEst?.totalWeightG).toBe(55);

      const lemonEst = service.getEstimatedWeight("Fresh Lemon", 2, "ea");
      expect(lemonEst).not.toBeNull();
      expect(lemonEst?.totalWeightG).toBe(200);
      expect(lemonEst?.subComponents).toBeDefined();
    });

    it("should calculate volumetric mass with density", () => {
      const waterWeight = service.calculateStandardWeightG({
        name: "Water",
        amount: 250,
        unit: "ml",
        densityGMl: 1.0,
      });
      expect(waterWeight).toBe(250);

      const customDensityWeight = service.calculateStandardWeightG({
        name: "Honey",
        amount: 100,
        unit: "ml",
        densityGMl: 1.42,
      });
      expect(customDensityWeight).toBe(142);
    });
  });

  describe("Baker's Math & Hydration Calculations", () => {
    it("should compute Baker's percentages and hydration accurately", () => {
      const formula = service.calculateBakersFormula([
        { name: "Bread Flour", amount: 500, unit: "g" },
        { name: "Water", amount: 350, unit: "ml", densityGMl: 1.0 },
        { name: "Salt", amount: 10, unit: "g" },
        { name: "Instant Yeast", amount: 5, unit: "g" },
      ]);

      expect(formula.summary.totalFlourWeightG).toBe(500);
      expect(formula.summary.totalLiquidWeightG).toBe(350);
      expect(formula.summary.hydrationPercentage).toBe(70);
      expect(formula.summary.isBakersRecipe).toBe(true);

      const flourItem = formula.items.find((i) => i.name === "Bread Flour");
      expect(flourItem?.isReference).toBe(true);
      expect(flourItem?.bakersPercentage).toBe(100);

      const waterItem = formula.items.find((i) => i.name === "Water");
      expect(waterItem?.bakersPercentage).toBe(70);

      const saltItem = formula.items.find((i) => i.name === "Salt");
      expect(saltItem?.bakersPercentage).toBe(2);

      const yeastItem = formula.items.find((i) => i.name === "Instant Yeast");
      expect(yeastItem?.bakersPercentage).toBe(1);
    });

    it("should normalize raw pieces/bunches into standardized gram weights during database ingestion", () => {
      const normalized = service.normalizeRecipeIngredients([
        { rawName: "Bread Flour", quantity: 500, unit: "g" },
        { rawName: "Water", quantity: 375, unit: "ml" },
        { rawName: "Scallions", quantity: 2, unit: "bunch" },
        { rawName: "Garlic", quantity: 3, unit: "cloves" },
      ]);

      expect(normalized).toHaveLength(4);

      // Scallions: 2 bunches -> 200g standardAmount
      const scallion = normalized.find((n) => n.rawName === "Scallions");
      expect(scallion).toBeDefined();
      expect(scallion?.standardWeightG).toBe(200);
      expect(scallion?.standardAmount).toBe(200);
      expect(scallion?.standardUnit).toBe("g");
      expect(scallion?.bakersPercentage).toBe(40);
      expect(scallion?.originalInputString).toBe("2 bunch Scallions");

      // Garlic: 3 cloves -> 12g standardAmount
      const garlic = normalized.find((n) => n.rawName === "Garlic");
      expect(garlic).toBeDefined();
      expect(garlic?.standardWeightG).toBe(12);
      expect(garlic?.standardAmount).toBe(12);
      expect(garlic?.standardUnit).toBe("g");
      expect(garlic?.bakersPercentage).toBe(2.4);
      expect(garlic?.originalInputString).toBe("3 cloves Garlic");
    });
  });

  describe("Unit Conversion", () => {
    it("should convert between units seamlessly", () => {
      // 1 lb to g
      expect(service.convertUnit(1, "lb", "g")).toBeCloseTo(453.59, 1);
      // 1000g to kg
      expect(service.convertUnit(1000, "g", "kg")).toBe(1);
      // 2 cloves garlic to g
      expect(
        service.convertUnit(
          2,
          "clove",
          "g",
          1.0,
          undefined,
          undefined,
          "Garlic Clove",
        ),
      ).toBe(8);
    });
  });
});
