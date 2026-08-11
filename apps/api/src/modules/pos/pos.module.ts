import { Module } from '@nestjs/common';
import { PosTransactionsService } from './pos-transactions.service';
import { PosLinksService } from './pos-links.service';
import { PosController } from './pos.controller';
import { PosGateway } from './pos.gateway';

@Module({
  controllers: [PosController],
  providers: [PosTransactionsService, PosLinksService, PosGateway],
  exports: [PosTransactionsService, PosLinksService, PosGateway],
})
export class PosModule {}

