import { Injectable, Logger } from '@nestjs/common';
import { RecipeNutritionCache } from '@soustools/api-types';

@Injectable()
export class LabelRendererService {
  private readonly logger = new Logger(LabelRendererService.name);

  async renderSvg(cache: RecipeNutritionCache): Promise<string> {
    this.logger.debug(`Rendering FDA label for recipe ${cache.recipeId}`);

    const n = cache.perServingNutrition;
    const s = cache.servings;

    // FDA Standard Formatting logic (simplified SVG string)
    const svg = `
      <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg" style="font-family: Arial, sans-serif; background-color: white;">
        <rect width="100%" height="100%" fill="white" />
        <rect x="10" y="10" width="280" height="380" fill="none" stroke="black" stroke-width="2" />
        <text x="20" y="40" font-size="28" font-weight="900" fill="black">Nutrition Facts</text>
        <line x1="15" y1="50" x2="285" y2="50" stroke="black" stroke-width="8" />
        
        <text x="20" y="70" font-size="14" fill="black">${s} servings per container</text>
        <text x="20" y="90" font-size="14" font-weight="bold" fill="black">Serving size</text>
        <text x="280" y="90" font-size="14" font-weight="bold" text-anchor="end" fill="black">1 serving</text>
        <line x1="15" y1="100" x2="285" y2="100" stroke="black" stroke-width="4" />
        
        <text x="20" y="120" font-size="12" font-weight="bold" fill="black">Amount per serving</text>
        <text x="20" y="150" font-size="28" font-weight="900" fill="black">Calories</text>
        <text x="280" y="150" font-size="28" font-weight="900" text-anchor="end" fill="black">${Math.round(n.calories || 0)}</text>
        <line x1="15" y1="160" x2="285" y2="160" stroke="black" stroke-width="4" />
        
        <text x="280" y="175" font-size="12" font-weight="bold" text-anchor="end" fill="black">% Daily Value*</text>
        
        <!-- Total Fat -->
        <text x="20" y="195" font-size="12" font-weight="bold" fill="black">Total Fat ${Math.round(n.total_fat_g || 0)}g</text>
        <line x1="15" y1="205" x2="285" y2="205" stroke="black" stroke-width="1" />
        
        <!-- Cholesterol -->
        <text x="20" y="220" font-size="12" font-weight="bold" fill="black">Cholesterol ${Math.round(n.cholesterol_mg || 0)}mg</text>
        <line x1="15" y1="230" x2="285" y2="230" stroke="black" stroke-width="1" />
        
        <!-- Sodium -->
        <text x="20" y="245" font-size="12" font-weight="bold" fill="black">Sodium ${Math.round(n.sodium_mg || 0)}mg</text>
        <line x1="15" y1="255" x2="285" y2="255" stroke="black" stroke-width="1" />
        
        <!-- Total Carbs -->
        <text x="20" y="270" font-size="12" font-weight="bold" fill="black">Total Carbohydrate ${Math.round(n.total_carbohydrate_g || 0)}g</text>
        <line x1="15" y1="280" x2="285" y2="280" stroke="black" stroke-width="1" />
        
        <!-- Protein -->
        <text x="20" y="295" font-size="12" font-weight="bold" fill="black">Protein ${Math.round(n.protein_g || 0)}g</text>
        <line x1="15" y1="305" x2="285" y2="305" stroke="black" stroke-width="4" />
        
        <text x="20" y="325" font-size="10" fill="black">* The % Daily Value (DV) tells you how much a nutrient in</text>
        <text x="20" y="340" font-size="10" fill="black">a serving of food contributes to a daily diet.</text>
      </svg>
    `;

    return svg;
  }
}
