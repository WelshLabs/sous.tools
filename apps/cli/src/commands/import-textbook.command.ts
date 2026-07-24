import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { PlaywrightFlipperService } from '../ingestion/playwright-flipper.service';

interface ImportTextbookOptions {
  pages: number;
  area?: string;
  slug: string;
  output?: string;
}

@Command({
  name: 'import:textbook',
  arguments: '<url>',
  description: 'Export Google Books pages as a stitched PDF document',
})
export class ImportTextbookCommand extends CommandRunner {
  private readonly logger = new Logger(ImportTextbookCommand.name);

  constructor(private readonly flipperService: PlaywrightFlipperService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: ImportTextbookOptions,
  ): Promise<void> {
    const [url] = passedParam;
    const bookSlug = options?.slug;
    if (!bookSlug || !url) {
      this.logger.error(
        'bookSlug (--slug) and starting URL (<url>) are required.',
      );
      return;
    }

    const pages = options?.pages || 10;
    const readingAreaSelector = options?.area;
    const customOutputPath = options?.output;

    this.logger.log(
      `Initiating PDF export for book: ${bookSlug}, URL: ${url} with ${pages} pages.`,
    );
    const outputPath = await this.flipperService.flipAndExportPdf(
      bookSlug,
      url,
      pages,
      readingAreaSelector,
      customOutputPath,
    );
    this.logger.log(`PDF successfully generated and saved to: ${outputPath}`);
  }

  @Option({
    flags: '-p, --pages <number>',
    description: 'Number of pages to capture and stitch into PDF',
    defaultValue: 10,
  })
  parsePages(val: string): number {
    return parseInt(val, 10);
  }

  @Option({
    flags: '-a, --area <selector>',
    description: 'CSS selector for the reading area screenshot boundary',
  })
  parseArea(val: string): string {
    return val;
  }

  @Option({
    flags: '-s, --slug <slug>',
    description: 'Book slug to use for saving output PDF',
    required: true,
  })
  parseSlug(val: string): string {
    return val;
  }

  @Option({
    flags: '-o, --output <path>',
    description: 'Custom output filepath for generated PDF',
  })
  parseOutput(val: string): string {
    return val;
  }
}
