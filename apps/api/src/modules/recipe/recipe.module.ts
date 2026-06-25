import { Module } from "@nestjs/common";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { IngredientsController } from "./ingredients.controller";
import { IngredientsService } from "./ingredients.service";
import { VesselsController } from "./vessels.controller";
import { VesselsService } from "./vessels.service";
import { RecipeMetaController } from "./recipe-meta.controller";
import { RecipeMetaService } from "./recipe-meta.service";
import { RecipeCostService } from "./recipe-cost.service";
import { RecipeVersionsController } from "./recipe-versions.controller";

@Module({
  controllers: [RecipesController, IngredientsController, VesselsController, RecipeMetaController, RecipeVersionsController],
  providers: [RecipesService, IngredientsService, VesselsService, RecipeMetaService, RecipeCostService],
  exports: [RecipesService, IngredientsService, VesselsService, RecipeMetaService, RecipeCostService],
})
export class RecipeModule {}
