import { Module } from '@nestjs/common';
import { PosTransactionsService } from './pos-transactions.service';
import { PosLinksService } from './pos-links.service';

@Module({
  providers: [PosTransactionsService, PosLinksService],
  exports: [PosTransactionsService, PosLinksService],
})
export class PosModule {}
