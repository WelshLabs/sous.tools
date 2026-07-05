import { Injectable } from "@nestjs/common";
import { IVisionService } from "./IVisionService";

@Injectable()
export class OllamaVisionService implements IVisionService {
  async processRecipe(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    const prompt = `You are an expert culinary AI. Extract structured recipe data from the provided document.
Return a JSON object containing a "recipes" array. Each recipe in the array must strictly follow this structure:
{
  "title": "string (name of the recipe)",
  "yieldCount": 12, // number
  "yieldUnit": "pieces/servings",
  "sourceBook": "string",
  "sourceAuthor": "string",
  "sourcePageStart": 1,
  "sourcePageEnd": 2,
  "vessel": {
    "name": "pan name",
    "shape": "ROUND" or "RECTANGULAR",
    "length": 9,
    "width": 13,
    "height": 2,
    "diameter": 0,
    "volumeMl": 3800
  },
  "ingredients": [
    {
      "name": "flour",
      "amount": 500,
      "unit": "g",
      "component": "Dough",
      "calculationType": "WEIGHT", // WEIGHT, VOLUME, or COUNT
      "prepNotes": "sifted"
    }
  ],
  "instructions": [
    {
      "text": "Mix ingredients.",
      "stepNumber": 1,
      "timerDurationSeconds": 300
    }
  ],
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30
}
${rawText ? `Additional extracted text context: ${rawText}` : ""}`;

    return this.queryOllama(prompt, imageBuffer, _mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, _mimeType?: string): Promise<any> {
    const prompt = `You are an expert back-office AI. Extract structured invoice data from the provided document.
Return a JSON object following this structure:
{
  "vendorName": "string",
  "invoiceNumber": "string",
  "date": "string",
  "totalAmount": 123.45,
  "items": [
    {
      "rawName": "string",
      "quantity": 2,
      "pricePerUnit": 10.50,
      "totalPrice": 21.00
    }
  ]
}
${rawText ? `Additional extracted text context: ${rawText}` : ""}`;

    return this.queryOllama(prompt, imageBuffer, _mimeType);
  }

  private async queryOllama(prompt: string, imageBuffer?: Buffer, _mimeType?: string): Promise<any> {
    let host = process.env.OLLAMA_HOST || "http://localhost:11434";
    if (!host.endsWith("/api/generate")) {
      host = host.replace(/\/$/, "") + "/api/generate";
    }

    const payload = {
      model: process.env.OLLAMA_MODEL || "llama3.2-vision",
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
