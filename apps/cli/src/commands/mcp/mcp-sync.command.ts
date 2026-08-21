import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { EnvironmentService } from '../../environment/environment.service';

@Command({
  name: 'mcp:sync',
  aliases: ['mcp-sync'],
  description:
    'Symlink repository MCP config (mcp_config.json) to $HOME/.gemini/config',
})
export class McpSyncCommand extends CommandRunner {
  private readonly logger = new Logger(McpSyncCommand.name);

  constructor(private readonly envService: EnvironmentService) {
    super();
  }

  async run(): Promise<void> {
    const root = this.envService.getSousRoot();
    const sourceConfig = path.join(root, 'mcp_config.json');
    const targetDir = path.join(os.homedir(), '.gemini/config');
    const targetConfig = path.join(targetDir, 'mcp_config.json');

    if (!fs.existsSync(sourceConfig)) {
      this.logger.error(`Source MCP config not found at: ${sourceConfig}`);
      return;
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      if (
        fs.existsSync(targetConfig) ||
        fs.lstatSync(targetConfig).isSymbolicLink()
      ) {
        fs.unlinkSync(targetConfig);
      }
    } catch {
      // Ignored if target does not exist
    }

    try {
      fs.symlinkSync(sourceConfig, targetConfig);
      this.logger.log(`✅ MCP config symlinked to repo SSOT: ${targetConfig}`);
    } catch (err) {
      this.logger.error(
        `Failed to symlink MCP config: ${(err as Error).message}`,
      );
    }
  }
}
