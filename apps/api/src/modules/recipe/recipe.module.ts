import { Module } from "@nestjs/common";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { IngredientsController } from "./ingredients.controller";
import { IngredientsService } from "./ingredients.service";
import { VesselsController } from "./vessels.controller";
import { VesselsService } from "./vessels.service";

@Module({
  controllers: [RecipesController, IngredientsController, VesselsController],
  providers: [RecipesService, IngredientsService, VesselsService],
  exports: [RecipesService, IngredientsService, VesselsService],
})
export class RecipeModule {}
