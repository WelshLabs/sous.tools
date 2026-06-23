import { Injectable, Logger } from '@nestjs/common';
import { MasterIngredient } from '@soustools/api-types';

@Injectable()
export class DietaryClassifierService {
  private readonly logger = new Logger(DietaryClassifierService.name);

  classifyRecipe(ingredients: MasterIngredient[], perServingMacros: Record<string, any>): Record<string, boolean> {
    this.logger.debug(`Classifying recipe with ${ingredients.length} ingredients`);

    const hasAnimalProduct = ingredients.some(i => i.isAnimalProduct);
    const hasMeat = ingredients.some(i => i.isMeat);
    const hasSeafood = ingredients.some(i => i.isSeafood);
    const hasDairy = ingredients.some(i => i.isDairy);
    const hasEgg = ingredients.some(i => i.isEgg);
    const hasGlutenSource = ingredients.some(i => i.isGlutenSource);
    const hasTreeNuts = ingredients.some(i => i.allergens?.includes('tree_nuts'));
    const hasPeanuts = ingredients.some(i => i.allergens?.includes('peanuts'));

    // Keto rule: net carbs <= 20g
    const totalCarbs = perServingMacros['total_carbohydrate_g'] || 0;
    const fiber = perServingMacros['dietary_fiber_g'] || 0;
    const netCarbs = totalCarbs - fiber;
    
    const sodiumMg = perServingMacros['sodium_mg'] || 0;
    const proteinG = perServingMacros['protein_g'] || 0;

    return {
      vegan: !hasAnimalProduct,
      vegetarian: !hasMeat && !hasSeafood,
      pescetarian: !hasMeat,
      keto: netCarbs <= 20,
      gluten_free: !hasGlutenSource,
      dairy_free: !hasDairy,
      egg_free: !hasEgg,
      nut_free: !hasTreeNuts && !hasPeanuts,
      low_sodium: sodiumMg <= 140, // FDA definition
      high_protein: proteinG >= 10
    };
  }
}
