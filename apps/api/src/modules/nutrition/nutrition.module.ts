import { Module } from "@nestjs/common";
import { NutritionService } from "./nutrition.service";
import { DietaryClassifierService } from "./dietary-classifier.service";
import { LabelRendererService } from "./label-renderer.service";
import { UsdaResolverService } from "./usda-resolver.service";
import { NutritionResolver } from "./nutrition.resolver";

@Module({
  controllers: [],
  providers: [
    NutritionService,
    DietaryClassifierService,
    LabelRendererService,
    UsdaResolverService,
    NutritionResolver,
  ],
  exports: [
    NutritionService,
    DietaryClassifierService,
    LabelRendererService,
    UsdaResolverService,
  ],
})
export class NutritionModule {}
