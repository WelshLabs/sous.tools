import { Module } from '@nestjs/common';
import { ImportCommand } from './import.command';
import { IngestionModule } from '../ingestion/ingestion.module';

@Module({
  imports: [IngestionModule],
  providers: [ImportCommand],
})
export class CommandsModule {}
