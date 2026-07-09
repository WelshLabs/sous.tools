import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { geminiParserSchema } from './gemini-parser.schemas';
import * as crypto from 'crypto';
import { config } from '@soustools/config';

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

    const prompt = `You are an elite culinary scientist and research chef. Extract the content from this textbook spread as an array of polymorphic content blocks.
Strictly conform to the provided JSON schema. Write highly detailed physical text descriptions for any visual diagrams (e.g., dough shaping techniques) and put them in instructionalDescriptions.
Summarize all prose to avoid copyright infringement.

JSON Schema format to follow:
{
  "bookTitle": "string (Extract from page headers, e.g., 'Professional Baking')",
  "pageNumbers": "string (Extract from corners, e.g., '24-25')",
  "contentBlocks": [
    {
      "classification": "RECIPE",
      "illustrationIntent": "GENERATE_FOOD | EXTRACT_ORIGINAL_PHOTO | NONE",
      "parentRecipeReference": "string (optional, exact name of the base recipe if this is a variation)",
      "recipeName": "string",
      "recipeContext": "string",
      "ingredients": [{"name": "string", "quantity": "number", "unit": "string"}],
      "objectiveSteps": ["string"]
    },
    {
      "classification": "ENCYCLOPEDIA",
      "illustrationIntent": "EXTRACT_ORIGINAL_PHOTO | NONE",
      "encyclopediaSummary": "string (CRITICAL: REQUIRED. Summarize the prose, do not leave blank)",
      "instructionalDescriptions": ["string (Detailed physical descriptions of photos/diagrams)"]
    },
    {
      "classification": "MATH_FORMULA",
      "illustrationIntent": "NONE",
      "formulaName": "string",
      "formulaDetails": "string (CRITICAL: REQUIRED. Extract the actual math logic, do not leave blank)"
    },
    {
      "classification": "REFERENCE_TABLE",
      "illustrationIntent": "NONE",
      "tableName": "string (optional)",
      "tableData": [["string", "string", "string"]]
    },
    {
      "classification": "TECHNIQUE_OR_METHOD",
      "illustrationIntent": "EXTRACT_ORIGINAL_PHOTO | NONE",
      "instructionalDescriptions": ["string (CRITICAL: REQUIRED. Describe the workflow in detail)"]
    },
    {
      "classification": "FLAVOR_PAIRING",
      "illustrationIntent": "EXTRACT_ORIGINAL_PHOTO | NONE",
      "baseIngredient": "string",
      "pairings": ["string"],
      "affinities": ["string (optional)"],
      "season": "string (optional)",
      "weight": "string (optional)",
      "volume": "string (optional)"
    }
  ]
}`;

    for (const file of files) {
      this.logger.log(`Processing spread ${file}...`);
      const filePath = path.join(queueDir, file);
      const imageBase64 = fs.readFileSync(filePath).toString('base64');

      try {
        let response: Awaited<ReturnType<typeof this.ai.models.generateContent>> | undefined;
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
            this.logger.warn(`Network error on ${file}. Retrying attempt ${attempts}/3...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        if (!response) {
          throw new Error(`No response received from Gemini for spread ${file} after ${maxAttempts} attempts`);
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
          throw new Error("No JSON object found in response");
        }
        const cleanJson = textResponse.substring(firstBrace, lastBrace + 1);

        // Validate structure with Zod
        const parsedResult = schema.parse(JSON.parse(cleanJson));

        // Pass 2b: Image Generation via Stable Diffusion
        for (const block of parsedResult.contentBlocks) {
          (block as unknown).generatedImages = [];
          
          if (block.illustrationIntent === 'GENERATE_FOOD' && (block as unknown).instructionalDescriptions) {
            for (const description of (block as unknown).instructionalDescriptions) {
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
                  if (sdData.images && sdData.images.length > 0) {
                    const imageBuffer = Buffer.from(sdData.images[0], 'base64');
                    const imageId = crypto.randomUUID();
                    const imagePath = path.join(imagesDir, `${imageId}.png`);
                    fs.writeFileSync(imagePath, imageBuffer);
                    this.logger.log(`Saved generated image to ${imagePath}`);

                    (block as unknown).generatedImages.push(imagePath);
                  }
                } else {
                  this.logger.error(
                    `SD API failed with status ${sdResponse.status}`,
                  );
                }
              } catch (sdErr: unknown) {
                this.logger.error(`Failed to reach SD API: ${sdErr.message}`);
              }
            }
          }
        }

        (parsedResult as unknown).sourceFile = file;
        
        const outDir = path.join(process.cwd(), 'output', bookSlug);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        
        const baseName = path.basename(file, '.png');
        const fileName = parsedResult.pageNumbers 
          ? `pages-${parsedResult.pageNumbers.replace(/[^a-zA-Z0-9-]/g, '-')}.json` 
          : `${baseName}.json`;
        
        const outFilePath = path.join(outDir, fileName);
        fs.writeFileSync(outFilePath, JSON.stringify(parsedResult, null, 2), 'utf8');
        
        const extractedBlocks = parsedResult.contentBlocks ? parsedResult.contentBlocks.length : 0;
        this.logger.log(`Successfully extracted ${extractedBlocks} blocks from ${file} to ${outFilePath}`);
      } catch (err: unknown) {
        this.logger.error(`Failed to process spread ${file}: ${err.message}`);
      }

      this.logger.log(`Sleeping for 5000ms to respect rate limits...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    this.logger.log('Gemini Parser Service completed.');
  }
}
