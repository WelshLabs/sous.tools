import { Module } from '@nestjs/common';
import { ImportTextbookCommand } from './import-textbook.command';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  providers: [ImportTextbookCommand],
})
export class CommandsModule {}
