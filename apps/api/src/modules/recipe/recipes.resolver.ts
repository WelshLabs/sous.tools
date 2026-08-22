import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { RecipesService } from "./recipes.service";
import {
  RecipeGQL,
  CreateRecipeInputGQL,
  UpdateRecipeInputGQL,
} from "./recipe.types";

@Resolver(() => RecipeGQL)
export class RecipesResolver {
  constructor(private readonly recipesService: RecipesService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [RecipeGQL], { name: "recipes" })
  async getRecipes(
    @Args("search", { nullable: true }) _search: string,
    @Context() ctx: any,
  ): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.recipesService.findAll(orgId);
  }

  @Query(() => RecipeGQL, { name: "recipe", nullable: true })
  async getRecipe(@Args("id") id: string): Promise<any> {
    return this.recipesService.findOne(id);
  }

  @Mutation(() => RecipeGQL, { name: "createRecipe" })
  async createRecipe(
    @Args("input") input: CreateRecipeInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.recipesService.create(
      orgId,
      {
        title: input.name,
        yieldCount: input.yield_quantity,
        yieldUnit: input.yield_unit,
        instructions: input.instructions,
      } as any,
      (input.ingredients || []) as any,
    );
  }

  @Mutation(() => RecipeGQL, { name: "updateRecipe" })
  async updateRecipe(
    @Args("id") id: string,
    @Args("input") input: UpdateRecipeInputGQL,
  ): Promise<any> {
    return this.recipesService.update(
      id,
      {
        title: input.name,
        yieldCount: input.yield_quantity,
        yieldUnit: input.yield_unit,
        instructions: input.instructions,
      } as any,
      input.ingredients as any,
    );
  }

  @Mutation(() => RecipeGQL, { name: "deleteRecipe" })
  async deleteRecipe(@Args("id") id: string): Promise<any> {
    return this.recipesService.remove(id);
  }
}
