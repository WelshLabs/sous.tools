import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { PlaywrightFlipperService } from './playwright-flipper.service';
import { GeminiParserService } from './gemini-parser.service';

@Module({
  providers: [IngestionService, PlaywrightFlipperService, GeminiParserService],
  exports: [IngestionService, PlaywrightFlipperService, GeminiParserService],
})
export class IngestionModule {}

