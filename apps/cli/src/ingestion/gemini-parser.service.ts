import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { geminiParserSchema } from './gemini-parser.schemas';
import * as crypto from 'crypto';
import { serverConfig as config } from '@soustools/config/server';
import { GEMINI_SPREAD_PROMPT } from './prompt-templates';

@Injectable()
export class GeminiParserService {
  private readonly logger = new Logger(GeminiParserService.name);
  private readonly ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

  async parseQueue(bookSlug: string): Promise<void> {
    const queueDir = path.join(process.cwd(), 'queue', bookSlug);
    if (!fs.existsSync(queueDir)) {
      this.logger.error(
        `Ingestion queue directory does not exist: ${queueDir}`,
      );
      return;
    }

    const files = fs
      .readdirSync(queueDir)
      .filter((f) => f.startsWith('spread-') && f.endsWith('.png'))
      .sort();

    this.logger.log(`Found ${files.length} spreads in the ingestion queue.`);

    const imagesDir = path.join(queueDir, 'generated-images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const schema = geminiParserSchema;

    // Enforce model name as requested
    // const modelName = "gemini-2.5-pro";
    const modelName = 'gemini-3.1-flash-lite';

    const prompt = GEMINI_SPREAD_PROMPT;

    for (const file of files) {
      this.logger.log(`Processing spread ${file}...`);
      const filePath = path.join(queueDir, file);
      const imageBase64 = fs.readFileSync(filePath).toString('base64');

      try {
        let response:
          | Awaited<ReturnType<typeof this.ai.models.generateContent>>
          | undefined;
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            attempts++;
            response = await this.ai.models.generateContent({
              model: modelName,
              contents: [
                prompt,
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: 'image/png',
                  },
                },
              ],
              config: {
                responseMimeType: 'application/json',
              },
            });
            break;
          } catch (error: unknown) {
            if (attempts >= maxAttempts) {
              throw error;
            }
            this.logger.warn(
              `Network error on ${file}. Retrying attempt ${attempts}/3...`,
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
        if (!response) {
          throw new Error(
            `No response received from Gemini for spread ${file} after ${maxAttempts} attempts`,
          );
        }

        const textResponse = response.text;
        if (!textResponse) {
          throw new Error(
            `Empty response received from Gemini for spread ${file}`,
          );
        }

        const firstBrace = textResponse.indexOf('{');
        const lastBrace = textResponse.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('No JSON object found in response');
        }
        const cleanJson = textResponse.substring(firstBrace, lastBrace + 1);

        // Validate structure with Zod
        const parsedResult = schema.parse(JSON.parse(cleanJson));

        // Pass 2b: Image Generation via Stable Diffusion
        for (const block of parsedResult.contentBlocks) {
          const blockRecord = block as Record<string, unknown> & {
            generatedImages?: string[];
            illustrationIntent?: string;
            instructionalDescriptions?: string[];
          };

          blockRecord.generatedImages = blockRecord.generatedImages ?? [];

          if (
            blockRecord.illustrationIntent === 'GENERATE_FOOD' &&
            blockRecord.instructionalDescriptions
          ) {
            for (const description of blockRecord.instructionalDescriptions) {
              this.logger.log(
                `Generating SD image for description: ${description}`,
              );

              try {
                const sdResponse = await fetch(
                  'http://172.18.16.1:7860/sdapi/v1/txt2img',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      prompt:
                        'clean minimalist vector illustration, professional culinary diagram of ' +
                        description,
                      steps: 20,
                    }),
                  },
                );

                if (sdResponse.ok) {
                  const sdData: unknown = await sdResponse.json();
                  const data = sdData as { images?: string[] }; // Assert the expected shape

                  if (data.images && data.images.length > 0) {
                    const imageBuffer = Buffer.from(data.images[0], 'base64');
                    const imageId = crypto.randomUUID();
                    const imagePath = path.join(imagesDir, `${imageId}.png`);

                    fs.writeFileSync(imagePath, imageBuffer);

                    this.logger.log(`Saved generated image to ${imagePath}`);

                    if (!Array.isArray(blockRecord.generatedImages))
                      blockRecord.generatedImages = [];
                    (blockRecord.generatedImages as string[]).push(imagePath);
                  }
                } else {
                  this.logger.error(
                    `SD API failed with status ${sdResponse.status}`,
                  );
                }
              } catch (sdErr: unknown) {
                this.logger.error(
                  `Failed to reach SD API: ${sdErr instanceof Error ? sdErr.message : String(sdErr)}`,
                );
              }
            }
          }
        }

        (
          parsedResult as Record<string, unknown> & { sourceFile?: string }
        ).sourceFile = file;

        const outDir = path.join(process.cwd(), 'output', bookSlug);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        const baseName = path.basename(file, '.png');
        const fileName = parsedResult.pageNumbers
          ? `pages-${parsedResult.pageNumbers.replace(/[^a-zA-Z0-9-]/g, '-')}.json`
          : `${baseName}.json`;

        const outFilePath = path.join(outDir, fileName);
        fs.writeFileSync(
          outFilePath,
          JSON.stringify(parsedResult, null, 2),
          'utf8',
        );

        const extractedBlocks = parsedResult.contentBlocks
          ? parsedResult.contentBlocks.length
          : 0;
        this.logger.log(
          `Successfully extracted ${extractedBlocks} blocks from ${file} to ${outFilePath}`,
        );
      } catch (err: unknown) {
        this.logger.error(
          `Failed to process spread ${file}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      this.logger.log(`Sleeping for 5000ms to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    this.logger.log('Gemini Parser Service completed.');
  }
}
