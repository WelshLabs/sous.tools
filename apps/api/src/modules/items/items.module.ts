import { Module } from "@nestjs/common";
import { ItemsService } from "./items.service";
import { ItemsResolver } from "./items.resolver";
import { PriceHistoryService } from "./price-history.service";
import { PriceHistoryResolver } from "./price-history.resolver";
import { WastageService } from "./wastage.service";
import { WastageResolver } from "./wastage.resolver";
import { InventoryService } from "./inventory.service";
import { InventoryResolver } from "./inventory.resolver";
import { VendorsService } from "./vendors.service";
import { VendorsResolver } from "./vendors.resolver";
import { WhiteboardService } from "./whiteboard.service";
import { WhiteboardResolver } from "./whiteboard.resolver";
import { PurchaseOrdersService } from "./purchase-orders.service";
import { PurchaseOrdersResolver } from "./purchase-orders.resolver";

import { NutritionModule } from "../nutrition/nutrition.module";

@Module({
  imports: [NutritionModule],
  providers: [
    ItemsService,
    ItemsResolver,
    PriceHistoryService,
    PriceHistoryResolver,
    WastageService,
    WastageResolver,
    InventoryService,
    InventoryResolver,
    VendorsService,
    VendorsResolver,
    WhiteboardService,
    WhiteboardResolver,
    PurchaseOrdersService,
    PurchaseOrdersResolver,
  ],
  exports: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
    VendorsService,
    WhiteboardService,
    PurchaseOrdersService,
  ],
})
export class ItemsModule {}
