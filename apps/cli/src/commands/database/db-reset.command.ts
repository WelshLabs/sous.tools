import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'db:reset',
  aliases: ['db-reset'],
  description: 'Reset local Postgres and Neo4j graph databases',
})
export class DbResetCommand extends CommandRunner {
  private readonly logger = new Logger(DbResetCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Resetting local database and graph...');
    const root = this.envService.getSousRoot();

    const exitCode = await this.envService.spawnInteractive(
      'pnpm',
      ['run', 'db:reset'],
      { cwd: root },
    );

    if (exitCode === 0) {
      this.logger.log('✅ Database reset completed.');
    } else {
      this.logger.error(`Database reset failed with exit code ${exitCode}.`);
    }
  }
}
