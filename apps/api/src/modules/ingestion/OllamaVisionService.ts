import { Injectable } from "@nestjs/common";
import { config } from "@soustools/config";
import { IVisionService } from "./IVisionService";

@Injectable()
export class OllamaVisionService implements IVisionService {
  async processRecipe(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    return this.queryPolymorphicOllama(imageBuffer, rawText, _mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    return this.queryPolymorphicOllama(imageBuffer, rawText, _mimeType);
  }

  async extractRecipe(imageBuffer?: Buffer, rawText?: string, _mimeType?: string, _sourceName?: string, _sourceUrl?: string): Promise<any> {
    return this.queryPolymorphicOllama(imageBuffer, rawText, _mimeType);
  }

  async extractInvoice(imageBuffer?: Buffer, rawText?: string, _mimeType?: string, _sourceName?: string, _sourceUrl?: string): Promise<any> {
    return this.queryPolymorphicOllama(imageBuffer, rawText, _mimeType);
  }

  private async queryPolymorphicOllama(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    const prompt = `You are an expert restaurant back-office system receiver, culinary data-entry clerk, and master inventory manager.
Analyze the document and classify it under 'documentType' as "INVOICE", "RECIPE", or "OTHER".
Return a JSON object conforming to the following structure:
{
  "documentType": "INVOICE" | "RECIPE" | "OTHER",
  "lineItems": [
    {
      "rawName": "string (the raw description/name printed or written)",
      "suggestedInternalName": "string (clean, generic, professional name)",
      "category": "INGREDIENT" | "PACKAGING" | "CLEANING" | "SMALLWARES" | "FEE" | "OTHER",
      "amount": 2.5, // number
      "unit": "string (e.g. lbs, cup, g, each)",
      "price": 10.50, // price per unit or line price, default to 0
      "boundingBox": [0.1, 0.1, 0.2, 0.9] // optional [ymin, xmin, ymax, xmax] coordinates as 0.0-1.0 percentages
    }
  ],
  "extractedMetadata": {
    // any other document-level fields (e.g. vendorName, invoiceNumber, date, totals, yields, prepTime, notes, etc.)
  }
}
${rawText ? `Additional extracted text context: ${rawText}` : ""}`;

    const parsed = await this.queryOllama(prompt, imageBuffer, _mimeType);

    // Provide backward-compatible wrappers
    if (parsed.documentType === "INVOICE") {
      parsed.vendorName = parsed.extractedMetadata?.vendorName || parsed.extractedMetadata?.vendor || "";
      parsed.items = (parsed.lineItems || []).map((item: any) => ({
        ...item,
        quantity: item.amount,
        pricePerUnit: item.price
      }));
    } else if (parsed.documentType === "RECIPE") {
      parsed.recipeName = parsed.extractedMetadata?.recipeName || parsed.extractedMetadata?.title || "";
      parsed.ingredients = (parsed.lineItems || []).map((item: any) => ({
        ...item,
        rawString: item.rawName,
        baseIngredient: item.suggestedInternalName,
        quantity: item.amount
      }));
    }

    return parsed;
  }

  private async queryOllama(prompt: string, imageBuffer?: Buffer, _mimeType?: string): Promise<any> {
    let host = config.OLLAMA_HOST;
    if (!host.endsWith("/api/generate")) {
      host = host.replace(/\/$/, "") + "/api/generate";
    }

    const payload = {
      model: config.OLLAMA_MODEL,
      prompt,
      images: imageBuffer ? [imageBuffer.toString("base64")] : [],
      stream: false,
      format: "json"
    };

    const response = await fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const data = await response.json() as { response?: string };
    if (!data.response) {
      throw new Error("Invalid response received from Ollama");
    }

    return JSON.parse(data.response);
  }
}
