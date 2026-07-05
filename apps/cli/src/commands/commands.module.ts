import { Module } from '@nestjs/common';
import { ImportCommand } from './import.command';
import { ImportTextbookCommand } from './import-textbook.command';
import { ParseTextbookCommand } from './parse-textbook.command';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  providers: [ImportCommand, ImportTextbookCommand, ParseTextbookCommand],
})
export class CommandsModule {}


