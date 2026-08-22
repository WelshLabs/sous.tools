import { Resolver, Query, Context } from "@nestjs/graphql";
import { RecipeMetaService } from "./recipe-meta.service";
import { RecipeCategoryGQL, RecipeTagGQL } from "./recipe.types";

@Resolver(() => RecipeCategoryGQL)
export class RecipeMetaResolver {
  constructor(private readonly recipeMetaService: RecipeMetaService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [RecipeCategoryGQL], { name: "recipeCategories" })
  async getRecipeCategories(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.recipeMetaService.findAllCategories(orgId);
  }

  @Query(() => [RecipeTagGQL], { name: "recipeTags" })
  async getRecipeTags(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.recipeMetaService.findAllTags(orgId);
  }
}
