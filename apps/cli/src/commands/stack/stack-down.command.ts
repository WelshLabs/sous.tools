import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'stack:down',
  aliases: ['down', 'stack-down'],
  description: 'Stop and remove Docker Compose containers and networks',
})
export class StackDownCommand extends CommandRunner {
  private readonly logger = new Logger(StackDownCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Stopping Docker Compose stack...');
    await this.envService.spawnInteractive('docker', ['compose', 'down']);
    this.logger.log('✅ Docker Compose stack stopped.');
  }
}
