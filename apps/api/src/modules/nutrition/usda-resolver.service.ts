import { Injectable, Logger } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";

export interface UsdaMatch {
  serving_size_g?: number;
  calories?: number;
  total_fat_g?: number;
  saturated_fat_g?: number;
  trans_fat_g?: number;
  cholesterol_mg?: number;
  sodium_mg?: number;
  total_carbohydrate_g?: number;
  dietary_fiber_g?: number;
  total_sugars_g?: number;
  added_sugars_g?: number;
  protein_g?: number;
  vitamin_d_mcg?: number;
  calcium_mg?: number;
  iron_mg?: number;
  potassium_mg?: number;
  fdc_id?: number;
  fdc_food_name?: string;
  verified?: boolean;
  [key: string]: any;
}

@Injectable()
export class UsdaResolverService {
  private readonly logger = new Logger(UsdaResolverService.name);
  private readonly baseUrl = "https://api.nal.usda.gov/fdc/v1";
  private readonly apiKey = config.USDA_FDC_API_KEY;

  async resolveIngredient(query: string): Promise<UsdaMatch | null> {
    try {
      this.logger.log(`Resolving nutrition for query: ${query}`);
      const url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&api_key=${this.apiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`USDA API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.foods || data.foods.length === 0) {
        this.logger.warn(`No USDA match found for: ${query}`);
        return null;
      }

      const bestMatch = data.foods[0];
      return this.mapUsdaToMacros(bestMatch);
    } catch (error) {
      this.logger.error(`Failed to resolve USDA nutrition: ${error}`);
      return null;
    }
  }

  async searchTop5(
    query: string,
  ): Promise<Array<{ fdcId: number; description: string; score?: number }>> {
    try {
      // First query Foundation and SR Legacy for highest precision nutritional data
      let url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=5&dataType=Foundation,SR%20Legacy&api_key=${this.apiKey}`;
      let response = await fetch(url);
      let data: any = response.ok ? await response.json() : null;

      // If no Foundation/SR Legacy match found, broaden search across all databases
      if (!data?.foods || data.foods.length === 0) {
        url = `${this.baseUrl}/foods/search?query=${encodeURIComponent(query)}&pageSize=5&api_key=${this.apiKey}`;
        response = await fetch(url);
        if (response.ok) {
          data = await response.json();
        }
      }

      if (!data?.foods || !Array.isArray(data.foods)) return [];
      return data.foods.slice(0, 5).map((f: any) => ({
        fdcId: f.fdcId,
        description: f.description,
        score: typeof f.score === "number" ? f.score : undefined,
      }));
    } catch (err) {
      this.logger.error(`USDA searchTop5 failed for "${query}":`, err);
      return [];
    }
  }

  private mapUsdaToMacros(foodItem: {
    fdcId: number;
    description: string;
    foodNutrients?: Array<{ nutrientId: number; value?: number }>;
  }): UsdaMatch {
    // 1008 = Calories, 1003 = Protein, 1004 = Total lipid (fat), 1005 = Carbohydrate
    // Using NAL IDs.
    const nutrients = foodItem.foodNutrients || [];
    const getNutrient = (id: number) =>
      nutrients.find(
        (n: { nutrientId: number; value?: number }) => n.nutrientId === id,
      )?.value || 0;

    return {
      serving_size_g: 100, // USDA FDC responses are generally per 100g
      calories: getNutrient(1008),
      total_fat_g: getNutrient(1004),
      saturated_fat_g: getNutrient(1258),
      trans_fat_g: getNutrient(1257),
      cholesterol_mg: getNutrient(1253),
      sodium_mg: getNutrient(1093),
      total_carbohydrate_g: getNutrient(1005),
      dietary_fiber_g: getNutrient(1079),
      total_sugars_g: getNutrient(2000),
      added_sugars_g: getNutrient(1235),
      protein_g: getNutrient(1003),
      vitamin_d_mcg: getNutrient(1114),
      calcium_mg: getNutrient(1087),
      iron_mg: getNutrient(1089),
      potassium_mg: getNutrient(1092),
      fdc_id: foodItem.fdcId,
      fdc_food_name: foodItem.description,
      verified: true,
    };
  }
}
