import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { EnvironmentService } from '../../environment/environment.service';

interface AgentTailOptions {
  container?: string;
  file?: string;
}

@Command({
  name: 'agent:tail',
  aliases: ['tailAgent'],
  description: 'Tail the Kanban orchestrator / agent runner logs',
})
export class AgentTailCommand extends CommandRunner {
  private readonly logger = new Logger(AgentTailCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(
    _passedParams: string[],
    options?: AgentTailOptions,
  ): Promise<void> {
    const container = options?.container || 'agent-runner';
    const filePath = options?.file || '/tmp/kanban-orchestrator.log';
    const isDocker = this.envService.isDocker();

    if (isDocker || fs.existsSync(filePath)) {
      this.logger.log(`Tailing logs directly at ${filePath}...`);
      await this.envService.spawnInteractive('tail', ['-f', filePath]);
    } else {
      this.logger.log(
        `Tailing logs inside Docker container [${container}] at ${filePath}...`,
      );
      await this.envService.spawnInteractive('docker', [
        'exec',
        container,
        'tail',
        '-f',
        filePath,
      ]);
    }
  }

  @Option({
    flags: '-c, --container <name>',
    description: 'Docker container name hosting the agent runner',
  })
  parseContainer(val: string): string {
    return val;
  }

  @Option({
    flags: '-f, --file <path>',
    description: 'Log file path to tail',
  })
  parseFile(val: string): string {
    return val;
  }
}
