import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { IngestionService } from '../ingestion/ingestion.service';

@Command({
  name: 'import',
  arguments: '<action> [target]',
  description: 'Import operations (book, status, approve)',
})
export class ImportCommand extends CommandRunner {
  private readonly logger = new Logger(ImportCommand.name);

  constructor(private readonly ingestionService: IngestionService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const [action, target] = passedParam;

    switch (action) {
      case 'book':
        if (!target) {
          this.logger.error('Book import requires a target URL or file path');
          return;
        }
        await this.ingestionService.importBook('default-book', target);
        break;
      case 'status':
        await this.ingestionService.getStatus();
        break;
      case 'approve':
        if (!target) {
          this.logger.error('Approve action requires a recipe ID');
          return;
        }
        await this.ingestionService.approveRecipe(target);
        break;
      default:
        this.logger.error(`Unknown import action: ${action}`);
    }
  }

  @Option({
    flags: '-t, --tenant <tenantId>',
    description: 'Tenant ID to operate on',
  })
  parseTenant(val: string): string {
    return val;
  }
}
