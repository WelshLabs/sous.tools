import { Command, CommandRunner, Option } from "nest-commander";
import { Logger } from "@nestjs/common";
import { type IngestionService } from "../ingestion/ingestion.service";

interface ImportTextbookOptions {
  pages: number;
  area?: string;
  slug: string;
}

@Command({
  name: "import:textbook",
  arguments: "<url>",
  description: "Ingest textbooks by auto-flipping pages and scraping recipes via Gemini Pro",
})
export class ImportTextbookCommand extends CommandRunner {
  private readonly logger = new Logger(ImportTextbookCommand.name);

  constructor(private readonly ingestionService: IngestionService) {
    super();
  }

  async run(
    passedParam: string[],
    options?: ImportTextbookOptions
  ): Promise<void> {
    const [url] = passedParam;
    const bookSlug = options?.slug;
    if (!bookSlug || !url) {
      this.logger.error("bookSlug (--slug) and starting textbook URL are required.");
      return;
    }

    const pages = options?.pages || 10;
    const readingAreaSelector = options?.area;

    this.logger.log(`Initiating import:textbook for book: ${bookSlug}, URL: ${url} with ${pages} pages.`);
    await this.ingestionService.importBook(
      bookSlug,
      url,
      pages,
      readingAreaSelector
    );
    this.logger.log("Import textbook command finished.");
  }

  @Option({
    flags: "-p, --pages <number>",
    description: "Number of pages to capture and process",
    defaultValue: 10,
  })
  parsePages(val: string): number {
    return parseInt(val, 10);
  }

  @Option({
    flags: "-a, --area <selector>",
    description: "CSS selector for the reading area screenshot boundary",
  })
  parseArea(val: string): string {
    return val;
  }

  @Option({
    flags: "-s, --slug <slug>",
    description: "Book slug to use for saving output",
    required: true,
  })
  parseSlug(val: string): string {
    return val;
  }
}
