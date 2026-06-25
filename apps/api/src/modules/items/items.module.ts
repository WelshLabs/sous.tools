import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PriceHistoryController } from './price-history.controller';
import { PriceHistoryService } from './price-history.service';
import { WastageController } from './wastage.controller';
import { WastageService } from './wastage.service';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [
    ItemsController,
    PriceHistoryController,
    WastageController,
    InventoryController,
  ],
  providers: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
  ],
  exports: [
    ItemsService,
    PriceHistoryService,
    WastageService,
    InventoryService,
  ],
})
export class ItemsModule {}
