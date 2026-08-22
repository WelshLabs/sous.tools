import { Resolver, Query, Context } from "@nestjs/graphql";
import { IngredientsService } from "./ingredients.service";
import { ItemGQL } from "../items/items.types";

@Resolver(() => ItemGQL)
export class IngredientsResolver {
  constructor(private readonly ingredientsService: IngredientsService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [ItemGQL], { name: "recipeIngredientsCatalog" })
  async getIngredientsCatalog(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const ings = await this.ingredientsService.findAll(orgId);
    return ings.map((i) => ({
      id: i.id,
      organization_id: i.organizationId,
      name: i.name,
      density_g_ml: i.densityGMl,
      allergens: i.allergens,
      nutrition_macros: i.nutritionMacros,
      current_cost_per_g: i.currentCostPerG,
      created_at: i.createdAt,
      updated_at: i.updatedAt,
    }));
  }
}
