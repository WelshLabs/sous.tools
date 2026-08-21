import { Module } from '@nestjs/common';
import { EnvironmentModule } from './environment/environment.module';
import { CommandsModule } from './commands/commands.module';

@Module({
  imports: [EnvironmentModule, CommandsModule],
})
export class AppModule {}
