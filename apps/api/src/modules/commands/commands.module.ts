import { Module } from '@nestjs/common';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { CommandsGateway } from './commands.gateway';
import { ItemsModule } from '../items/items.module';
import { RecipeModule } from '../recipe/recipe.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ingestion',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          count: 100,
        },
        removeOnFail: {
          count: 500,
        },
      },
    }),
    ItemsModule, 
    RecipeModule
  ],
  controllers: [CommandsController],
  providers: [CommandsService, CommandsGateway],
  exports: [CommandsService],
})
export class CommandsModule {}
