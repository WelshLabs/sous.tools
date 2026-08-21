import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'stack:nuke',
  aliases: ['docker-nuke', 'stack-nuke'],
  description:
    'Stop all Docker containers and clean up unused volumes and images',
})
export class StackNukeCommand extends CommandRunner {
  private readonly logger = new Logger(StackNukeCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('🔥 Nuking Docker containers and volumes...');
    await this.envService.spawnInteractive(
      'docker stop $(docker ps -aq) 2>/dev/null || true; docker system prune -af --volumes',
    );
    this.logger.log('✅ Docker system clean completed.');
  }
}
