import { Module } from '@nestjs/common';
import { CommandsController } from './commands.controller';
import { CommandsService } from './commands.service';
import { CommandsGateway } from './commands.gateway';
import { ItemsModule } from '../items/items.module';
import { RecipeModule } from '../recipe/recipe.module';

@Module({
  imports: [ItemsModule, RecipeModule],
  controllers: [CommandsController],
  providers: [CommandsService, CommandsGateway],
  exports: [CommandsService],
})
export class CommandsModule {}
