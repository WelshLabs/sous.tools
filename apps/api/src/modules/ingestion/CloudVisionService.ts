import { Injectable } from "@nestjs/common";
import { IVisionService } from "./IVisionService";
import { GoogleGenAI, Type } from "@google/genai";
import { serverConfig as config } from "@soustools/config/server";

const unifiedExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      enum: ["INVOICE", "RECIPE", "OTHER"],
      description: "Classify if the document is primarily an INVOICE, a RECIPE, or OTHER."
    },
    lineItems: {
      type: Type.ARRAY,
      description: "The line items or ingredients extracted from the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          rawName: { type: Type.STRING, description: "The raw description string or name as printed on the document." },
          suggestedInternalName: { type: Type.STRING, description: "A clean, generic, professional name guessed from the raw string (e.g. 'Chicken Breast' for 'CUTLET BLACK.L', or 'All-Purpose Flour' for 'AP FLOUR 50LB')." },
          category: { type: Type.STRING, enum: ["INGREDIENT", "PACKAGING", "CLEANING", "SMALLWARES", "FEE", "OTHER"] },
          amount: { type: Type.NUMBER, description: "The quantity or amount of this item." },
          unit: { type: Type.STRING, description: "The unit of measurement (e.g., LBS, CASE, CUP, G, EACH)." },
          price: { type: Type.NUMBER, description: "The unit price or line price if applicable. Default to 0 if not present (like in recipes)." },
          boundingBox: {
            type: Type.ARRAY,
            items: { type: Type.NUMBER },
            description: "Normalized bounding box coordinates [ymin, xmin, ymax, xmax] between 0.0 and 1.0 representing where this item was found on the document image."
          }
        },
        required: ["rawName", "suggestedInternalName", "category", "amount", "unit", "price"]
      }
    },
    extractedMetadata: {
      type: Type.OBJECT,
      description: "An open-ended dictionary containing all other document-level fields (e.g. vendor name/address/phone/email, invoice/PO numbers, recipe yields/servings, prep/cook times, past due balances, dates, notes, author)."
    }
  },
  required: ["documentType", "lineItems", "extractedMetadata"]
};


@Injectable()
export class CloudVisionService implements IVisionService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async processRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.extractPolymorphicDocument(imageBuffer, rawText, mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.extractPolymorphicDocument(imageBuffer, rawText, mimeType);
  }

  async extractInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string, sourceName?: string, sourceUrl?: string): Promise<any> {
    return this.extractPolymorphicDocument(imageBuffer, rawText, mimeType, sourceName, sourceUrl);
  }

  async extractRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string, sourceName?: string, sourceUrl?: string): Promise<any> {
    return this.extractPolymorphicDocument(imageBuffer, rawText, mimeType, sourceName, sourceUrl);
  }

  private async extractPolymorphicDocument(
    imageBuffer?: Buffer,
    rawText?: string,
    mimeType?: string,
    sourceName?: string,
    sourceUrl?: string
  ): Promise<any> {
    const inlineDataParts: any[] = [];
    let finalBuffer = imageBuffer;
    let finalMimeType = mimeType || "image/jpeg";

    if (!finalBuffer && sourceUrl) {
      try {
        const res = await fetch(sourceUrl);
        if (!res.ok) throw new Error(`Failed to fetch image from sourceUrl: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        finalBuffer = Buffer.from(arrayBuffer);
        const contentType = res.headers.get("content-type");
        if (contentType) finalMimeType = contentType;
      } catch (err) {
        console.error("Error fetching sourceUrl for Gemini vision extraction:", err);
      }
    }

    if (finalBuffer) {
      inlineDataParts.push({
        inlineData: {
          mimeType: finalMimeType,
          data: finalBuffer.toString("base64")
        }
      });
    }

    const filenameHint = sourceName ? `The original filename is "${sourceName}". Use this filename as a strong hint for classification, name, or metadata if the document lacks a clear title.` : ``;

    const genConfig = {
      responseMimeType: "application/json",
      responseSchema: unifiedExtractionSchema,
      systemInstruction: `You are an expert restaurant back-office system receiver, culinary data-entry clerk, and master inventory manager.
${filenameHint}
Intelligently analyze the document (which could be a vendor invoice, a supplier delivery ticket, a recipe printout, or a hand-written recipe) and classify it under 'documentType' as "INVOICE", "RECIPE", or "OTHER".

Perform the following for the 'lineItems' array:
1. Identify all list items on the document. For invoices, these are purchase items/fees. For recipes, these are ingredients.
2. For each item:
   - 'rawName': The exact description/name printed or written on the document.
   - 'suggestedInternalName': Guess a clean, generic, professional name (e.g. 'Chicken Breast' for 'CUTLET BLACK.L', or 'All-Purpose Flour' for 'AP FLOUR 50LB').
   - 'category': Classify as INGREDIENT, PACKAGING, CLEANING, SMALLWARES, FEE, or OTHER. For recipes, this is usually INGREDIENT. For invoices, recognize fees (e.g. delivery fee) and set to FEE.
   - 'amount': The numerical quantity/amount (e.g. 2 for 2.0, 1.5 for 1-1/2).
   - 'unit': The unit of measurement (e.g., LBS, CASE, CUP, G, EACH).
   - 'price': For invoices, extract the unit price or line price. For recipes, set to 0.
   - 'boundingBox': Detect the visual location of the item line text on the document. Return [ymin, xmin, ymax, xmax] as values from 0.0 to 1.0 representing percentages of the overall image height and width.

CRITICAL: Extract ALL other document-level fields (e.g., vendor name, vendor address/phone/email, invoice/PO numbers, recipe yields/servings, prep/cook times, past due balances, dates, notes, author) into the open-ended 'extractedMetadata' object. Capture as much detail as possible. Do not put line items inside extractedMetadata.`
    };

    let responseText = "";
    if (inlineDataParts.length > 0) {
      const contents: any[] = [...inlineDataParts];
      if (rawText) contents.push({ text: rawText });
      contents.push({ text: "Extract the data from this document." });
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: genConfig
      });
      responseText = response.text || "{}";
    } else if (rawText) {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: rawText,
        config: genConfig
      });
      responseText = response.text || "{}";
    } else {
      return { documentType: "OTHER", lineItems: [], extractedMetadata: {} };
    }

    const parsed = JSON.parse(responseText);

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
}
