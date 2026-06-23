import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';

@Module({
  imports: [CommandsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
