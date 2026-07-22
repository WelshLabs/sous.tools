import { Module } from "@nestjs/common";
import { NutritionController } from "./nutrition.controller";
import { NutritionService } from "./nutrition.service";
import { DietaryClassifierService } from "./dietary-classifier.service";
import { UsdaResolverService } from "./usda-resolver.service";
import { LabelRendererService } from "./label-renderer.service";
@Module({
  controllers: [NutritionController],
  providers: [
    NutritionService,
    DietaryClassifierService,
    UsdaResolverService,
    LabelRendererService,
  ],
  exports: [NutritionService, UsdaResolverService, DietaryClassifierService],
})
export class NutritionModule {}

