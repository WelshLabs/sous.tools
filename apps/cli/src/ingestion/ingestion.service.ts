import { Injectable, Logger } from '@nestjs/common';
import { type PlaywrightFlipperService } from './playwright-flipper.service';
import { GoogleGenAI } from '@google/genai';
import { config } from '@soustools/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly ai: GoogleGenAI;

  constructor(private readonly flipperService: PlaywrightFlipperService) {
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async importBook(
    bookSlug: string,
    urlOrPath: string,
    pageCount: number = 10,
    readingAreaSelector?: string,
  ): Promise<void> {
    this.logger.log(`Starting textbook ingestion pipeline for: ${bookSlug} at ${urlOrPath}`);

    // Stage 1: Auto-flip pages and take screenshots
    this.logger.log(
      `Stage 1: Launching Playwright Auto-Flipper to capture ${pageCount} pages...`,
    );
    const queueDir = await this.flipperService.flipAndScreenshot(
      bookSlug,
      urlOrPath,
      pageCount,
      readingAreaSelector,
    );

    // Stage 2: Process screenshots using Throttled Gemini Worker
    this.logger.log(`Stage 2: Processing captured pages in ${queueDir}...`);
    await this.processQueue(queueDir);

    this.logger.log('Ingestion pipeline completed.');
  }

  async processQueue(queueDir: string): Promise<void> {
    if (!fs.existsSync(queueDir)) {
      this.logger.error(
        `Ingestion queue directory does not exist: ${queueDir}`,
      );
      return;
    }

    const files = fs
      .readdirSync(queueDir)
      .filter((f) => f.startsWith('page-') && f.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('page-', '').replace('.png', ''), 10);
        const numB = parseInt(b.replace('page-', '').replace('.png', ''), 10);
        return numA - numB;
      });

    this.logger.log(`Found ${files.length} pages in the ingestion queue.`);

    const ledgerPath = path.join(process.cwd(), 'processed.json');
    const outputPath = path.join(process.cwd(), 'encyclopedia_output.json');

    let ledger: string[] = [];
    if (fs.existsSync(ledgerPath)) {
      try {
        ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
      } catch (_e) {
        this.logger.warn(
          'Failed to parse processed.json ledger, resetting to empty array.',
        );
      }
    }

    let encyclopedia: unknown[] = [];
    if (fs.existsSync(outputPath)) {
      try {
        encyclopedia = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      } catch (_e) {
        this.logger.warn(
          'Failed to parse encyclopedia_output.json, resetting to empty array.',
        );
      }
    }

    const prompt = `You are an elite culinary scientist and research chef. Your task is to extract highly detailed "Culinary Physics" from the provided textbook page screenshot.

Identify and extract:
1. Recipes: title, yield, ingredients (using exact weights or Baker's percentages if present), detailed steps.
2. Baker's Math: Scaling ratios, hydration percentages, flour weight reference, preferment percentages.
3. Variants: Alternative ingredients, structural substitutions, sizing options.
4. Shaping / Styling Techniques: Step-by-step physical manipulation, proofing setups, scoring patterns.

Return the result as a structured JSON object conforming to this schema:
{
  "pageNumber": number,
  "recipes": [
    {
      "title": "string",
      "yield": "string",
      "ingredients": [{"name": "string", "amount": number, "unit": "string", "percentage": number}],
      "instructions": ["string"],
      "bakersMath": {
        "hydrationPercentage": number,
        "notes": "string"
      }
    }
  ],
  "techniques": [
    {
      "name": "string",
      "description": "string",
      "steps": ["string"]
    }
  ],
  "variants": [
    {
      "name": "string",
      "substitution": "string",
      "notes": "string"
    }
  ]
}`;

    const modelName = 'gemini-3.1-flash-lite';
    // const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

    for (const file of files) {
      if (ledger.includes(file)) {
        this.logger.log(
          `Skipping page ${file} (already in processed.json ledger)`,
        );
        continue;
      }

      this.logger.log(`Processing page ${file} using model ${modelName}...`);
      const filePath = path.join(queueDir, file);
      const imageBase64 = fs.readFileSync(filePath).toString('base64');
      const pageNumber = parseInt(
        file.replace('page-', '').replace('.png', ''),
        10,
      );

      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const textResponse = response.text;
        if (!textResponse) {
          throw new Error(
            `Empty response received from Gemini for page ${file}`,
          );
        }

        const parsedResult = JSON.parse(textResponse);
        parsedResult.pageNumber = pageNumber;

        encyclopedia.push(parsedResult);
        fs.writeFileSync(
          outputPath,
          JSON.stringify(encyclopedia, null, 2),
          'utf8',
        );

        ledger.push(file);
        fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), 'utf8');

        this.logger.log(`Successfully processed page ${file}`);
      } catch (err: unknown) {
        this.logger.error(`Failed to process page ${file}: ${err instanceof Error ? err.message : String(err)}`);
        throw err;
      }

      // Throttle: 6 to 10 seconds delay between requests
      const delayMs = Math.floor(Math.random() * 4000) + 6000;
      this.logger.log(`Sleeping for ${delayMs}ms to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  async getStatus(): Promise<void> {
    const ledgerPath = path.join(process.cwd(), 'processed.json');
    if (fs.existsSync(ledgerPath)) {
      const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
      this.logger.log(
        `Ingestion status: processed ${ledger.length} pages: ${ledger.join(', ')}`,
      );
    } else {
      this.logger.log('Ingestion status: 0 pages processed.');
    }
  }

  async approveRecipe(recipeId: string): Promise<void> {
    this.logger.log(`Approving recipe ${recipeId} from VerificationQueue...`);
  }
}
