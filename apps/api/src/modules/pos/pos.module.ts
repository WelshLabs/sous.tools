import { Module } from '@nestjs/common';
import { PosTransactionsService } from './pos-transactions.service';
import { PosLinksService } from './pos-links.service';
import { PosController } from './pos.controller';

@Module({
  controllers: [PosController],
  providers: [PosTransactionsService, PosLinksService],
  exports: [PosTransactionsService, PosLinksService],
})
export class PosModule {}

