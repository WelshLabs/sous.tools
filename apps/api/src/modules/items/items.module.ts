import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PriceHistoryController } from './price-history.controller';
import { PriceHistoryService } from './price-history.service';
import { WastageController } from './wastage.controller';
import { WastageService } from './wastage.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { WhiteboardController } from './whiteboard.controller';
import { WhiteboardService } from './whiteboard.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  controllers: [
    ItemsController,
    PriceHistoryController,
    WastageController,
    InventoryController,
    VendorsController,
    WhiteboardController,
    PurchaseOrdersController,
  ],
  providers: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
    VendorsService,
    WhiteboardService,
    PurchaseOrdersService,
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
