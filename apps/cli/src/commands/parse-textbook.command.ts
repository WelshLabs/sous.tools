import { Command, CommandRunner, Option } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { GeminiParserService } from '../ingestion/gemini-parser.service';

interface ParseTextbookOptions {
  slug?: string;
}

@Command({
  name: 'parse:textbook',
  description: 'Pass 2: Parse images in the queue using Gemini and Stable Diffusion',
})
export class ParseTextbookCommand extends CommandRunner {
  private readonly logger = new Logger(ParseTextbookCommand.name);

  constructor(private readonly geminiParserService: GeminiParserService) {
    super();
  }

  async run(inputs: string[], options: ParseTextbookOptions): Promise<void> {
    const bookSlug = options?.slug;
    if (!bookSlug) {
      this.logger.error("bookSlug (--slug) is required.");
      return;
    }

    this.logger.log(`Starting Pass 2: Throttled Parser & SD Generator for book: ${bookSlug}`);
    try {
      await this.geminiParserService.parseQueue(bookSlug);
      this.logger.log('Pass 2 completed successfully.');
    } catch (error: any) {
      this.logger.error(`Pass 2 failed: ${error.message}`);
      process.exit(1);
    }
  }

  @Option({
    flags: "-s, --slug <slug>",
    description: "Book slug to parse",
    required: true,
  })
  parseSlug(val: string): string {
    return val;
  }
}
