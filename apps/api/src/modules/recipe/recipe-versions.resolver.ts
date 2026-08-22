import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { RecipeVersionsService } from "./recipe-versions.service";
import { RecipeVersionGQL, RecipeGQL } from "./recipe.types";

@Resolver(() => RecipeVersionGQL)
export class RecipeVersionsResolver {
  constructor(
    private readonly recipeVersionsService: RecipeVersionsService,
  ) {}

  @Query(() => [RecipeVersionGQL], { name: "recipeVersions" })
  async getVersions(@Args("recipeId") recipeId: string): Promise<any[]> {
    const versions = await this.recipeVersionsService.getVersions(recipeId);
    return versions.map((v) => ({
      id: v.id,
      recipe_id: v.recipeId,
      version_number: v.versionNumber,
      change_summary: v.title,
      snapshot_data: v,
      created_at: v.createdAt,
    }));
  }

  @Mutation(() => RecipeVersionGQL, { name: "createRecipeVersion" })
  async createVersion(@Args("recipeId") recipeId: string): Promise<any> {
    const v = await this.recipeVersionsService.createSnapshot(recipeId);
    return {
      id: v.id,
      recipe_id: v.recipeId,
      version_number: v.versionNumber,
      change_summary: v.title,
      snapshot_data: v,
      created_at: v.createdAt,
    };
  }

  @Mutation(() => RecipeGQL, { name: "restoreRecipeVersion" })
  async restoreVersion(
    @Args("recipeId") recipeId: string,
    @Args("versionNumber") versionNumber: number,
  ): Promise<any> {
    return this.recipeVersionsService.restoreVersion(recipeId, versionNumber);
  }
}
