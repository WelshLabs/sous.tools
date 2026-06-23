import { Injectable, Logger } from '@nestjs/common';
import { config } from '@soustools/config';

@Injectable()
export class UsdaResolverService {
  private readonly logger = new Logger(UsdaResolverService.name);
  private readonly baseUrl = 'https://api.nal.usda.gov/fdc/v1';
  private readonly apiKey = 'DEMO_KEY'; // Can be moved to config if needed

  async resolveIngredient(query: string): Promise<any> {
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

  private mapUsdaToMacros(foodItem: any): Record<string, any> {
    // 1008 = Calories, 1003 = Protein, 1004 = Total lipid (fat), 1005 = Carbohydrate
    // Using NAL IDs. 
    const nutrients = foodItem.foodNutrients || [];
    const getNutrient = (id: number) => nutrients.find((n: any) => n.nutrientId === id)?.value || 0;

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
      verified: true
    };
  }
}
