import { Module } from '@nestjs/common';
import { PlaywrightFlipperService } from './playwright-flipper.service';

@Module({
  providers: [PlaywrightFlipperService],
  exports: [PlaywrightFlipperService],
})
export class IngestionModule {}
