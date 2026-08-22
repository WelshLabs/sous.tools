import { Module } from "@nestjs/common";
import { RecipesService } from "./recipes.service";
import { RecipesResolver } from "./recipes.resolver";
import { IngredientsService } from "./ingredients.service";
import { IngredientsResolver } from "./ingredients.resolver";
import { VesselsService } from "./vessels.service";
import { VesselsResolver } from "./vessels.resolver";
import { RecipeMetaService } from "./recipe-meta.service";
import { RecipeMetaResolver } from "./recipe-meta.resolver";
import { RecipeCostService } from "./recipe-cost.service";
import { RecipeVersionsService } from "./recipe-versions.service";
import { RecipeVersionsResolver } from "./recipe-versions.resolver";
import { RecipeMathService } from "./recipe-math.service";
import { Neo4jSyncModule } from "../neo4j-sync/neo4j-sync.module";

@Module({
  imports: [Neo4jSyncModule],
  providers: [
    RecipesService,
    RecipesResolver,
    IngredientsService,
    IngredientsResolver,
    VesselsService,
    VesselsResolver,
    RecipeMetaService,
    RecipeMetaResolver,
    RecipeCostService,
    RecipeVersionsService,
    RecipeVersionsResolver,
    RecipeMathService,
  ],
  exports: [
    RecipesService,
    IngredientsService,
    VesselsService,
    RecipeMetaService,
    RecipeCostService,
    RecipeVersionsService,
    RecipeMathService,
  ],
})
export class RecipeModule {}
