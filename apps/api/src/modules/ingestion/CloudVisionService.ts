import { Injectable } from "@nestjs/common";
import { IVisionService } from "./IVisionService";
import { GoogleGenAI, Type } from "@google/genai";
import { config } from "@soustools/config";

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    yieldCount: { type: Type.NUMBER },
    yieldUnit: { type: Type.STRING },
    sourceBook: { type: Type.STRING, description: "Book or publication title if visible" },
    sourceAuthor: { type: Type.STRING, description: "Author of the recipe if visible" },
    sourcePageStart: { type: Type.NUMBER },
    sourcePageEnd: { type: Type.NUMBER },
    vessel: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        shape: { type: Type.STRING, enum: ["ROUND", "RECTANGULAR"] },
        length: { type: Type.NUMBER },
        width: { type: Type.NUMBER },
        height: { type: Type.NUMBER },
        diameter: { type: Type.NUMBER },
        volumeMl: { type: Type.NUMBER }
      },
      required: ["name", "shape", "volumeMl"]
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          component: { type: Type.STRING, description: "The component or section this ingredient belongs to, e.g., 'Dough', 'Glaze', 'Filling', 'Caramelized apples'. Leave null if the recipe has no sections." },
          calculationType: { type: Type.STRING, enum: ["WEIGHT", "VOLUME", "COUNT"] },
          prepNotes: { type: Type.STRING, description: "e.g., diced, melted, room temp" }
        },
        required: ["name", "amount", "unit"]
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The instruction text" },
          stepNumber: { type: Type.NUMBER },
          timerDurationSeconds: { type: Type.NUMBER, description: "If a duration is mentioned in this step, convert it to seconds" }
        },
        required: ["text", "stepNumber"]
      }
    },
    prepTimeMinutes: { type: Type.NUMBER, description: "Preparation time in minutes" },
    cookTimeMinutes: { type: Type.NUMBER, description: "Cooking/baking/proofing time in minutes" }
  },
  required: ["title", "ingredients", "instructions"]
};

const recipeResponseSchema = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: recipeSchema
    }
  },
  required: ["recipes"]
};

const invoiceSchema = {
  type: Type.OBJECT,
  properties: {
    vendorName: { type: Type.STRING },
    vendorAddress: { type: Type.STRING, description: "Vendor's physical address if present" },
    vendorPhone: { type: Type.STRING, description: "Vendor's phone number if present" },
    vendorEmail: { type: Type.STRING, description: "Vendor's email if present" },
    invoiceNumber: { type: Type.STRING },
    orderNumber: { type: Type.STRING, description: "Order number or PO number if present" },
    date: { type: Type.STRING },
    totalAmount: { type: Type.NUMBER },
    previousBalance: { type: Type.NUMBER, description: "Any previous balance mentioned" },
    totalDue: { type: Type.NUMBER, description: "Total amount due" },
    notes: { type: Type.STRING, description: "Any printed or handwritten notes" },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rawName: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          uom: { type: Type.STRING },
          unit: { type: Type.STRING, description: "Unit such as LBS, CASE, EACH" },
          category: { type: Type.STRING, description: "Categorize as 'ingredient', 'cleaning', 'office', or 'packaging'", enum: ["ingredient", "cleaning", "office", "packaging", "other"] },
          pricePerUnit: { type: Type.NUMBER },
          totalPrice: { type: Type.NUMBER }
        },
        required: ["rawName", "quantity", "pricePerUnit"]
      }
    }
  },
  required: ["vendorName", "items"]
};

const recipeExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING },
    yieldAmount: { type: Type.NUMBER },
    yieldUnit: { type: Type.STRING },
    prepTimeMinutes: { type: Type.NUMBER },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          rawString: { type: Type.STRING, description: "The original complete text line of the ingredient as listed in the recipe, e.g., '1 cup finely chopped onions'" },
          baseIngredient: { type: Type.STRING, description: "The isolated primary ingredient itself, removing any prep descriptors or quantities. e.g. 'Yellow Onion', 'Unsalted Butter', 'AP Flour'" },
          preparationNote: { type: Type.STRING, description: "All descriptors relating to prep state, cut type, temp, or divisions. e.g., 'diced, divided', 'melted', 'room temperature', 'sifted'" },
          quantity: { type: Type.NUMBER, description: "The numerical quantity extracted. Convert fractions to decimals." },
          unit: { type: Type.STRING, description: "The unit of measurement. e.g., 'cup', 'g', 'oz', 'piece', 'tbsp'" },
          sectionGroup: { type: Type.STRING, description: "The section header grouping name for this ingredient if one is specified in the recipe layout (e.g. 'Dough', 'Filling', 'Glaze', 'Topping')." }
        },
        required: ["rawString", "baseIngredient"]
      }
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["recipeName", "ingredients", "instructions"]
};

@Injectable()
export class CloudVisionService implements IVisionService {
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }

  async processRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.processDocument("recipe", imageBuffer, rawText, mimeType);
  }

  async processInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    return this.processDocument("invoice", imageBuffer, rawText, mimeType);
  }

  async extractRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any> {
    const inlineDataParts: any[] = [];

    if (imageBuffer) {
      inlineDataParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBuffer.toString("base64")
        }
      });
    }

    const genConfig = {
      responseMimeType: "application/json",
      responseSchema: recipeExtractionSchema,
      systemInstruction: `You are an expert culinary data-entry clerk. Extract a single structured recipe from the provided document.
Your job is to read the recipe text or image and extract a structured JSON payload conforming to the provided schema.
Pay extremely close attention to the ingredient parsing:
- 'rawString' must be the exact raw text line of the ingredient.
- 'baseIngredient' must be the isolated food substance (e.g. 'Yellow Onion', 'Unsalted Butter', 'AP Flour'). Intelligently split out preparation modifiers.
- 'preparationNote' must contain all preparation and state instructions (e.g., 'diced, divided', 'melted', 'room temp', 'sifted').
- 'quantity' must be the numeric amount (e.g., '1 1/2' becomes 1.5).
- 'unit' must be the unit of measurement (e.g. 'cup', 'tbsp', 'g').
- 'sectionGroup' must be the header/title of the recipe section/group that this ingredient is grouped under if the recipe presents them in sections (e.g. 'Dough', 'Filling', 'Glaze'). If no section headers exist, leave it as null.`
    };

    let responseText = "";

    if (inlineDataParts.length > 0) {
      const contents: any[] = [...inlineDataParts];
      if (rawText) contents.push({ text: rawText });
      contents.push({ text: "Extract the single recipe data from this document." });
      
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
      return {};
    }

    return JSON.parse(responseText);
  }

  private async processDocument(
    documentType: "recipe" | "invoice",
    imageBuffer?: Buffer,
    rawText?: string,
    mimeType?: string
  ): Promise<any> {
    const inlineDataParts: any[] = [];

    if (imageBuffer) {
      inlineDataParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBuffer.toString("base64")
        }
      });
    }

    const genConfig = {
      responseMimeType: "application/json",
      responseSchema: documentType === "recipe" ? recipeResponseSchema : invoiceSchema,
      systemInstruction: `You are an expert culinary and back-office AI. Extract structured data from the provided document. For recipes, extract an array of ALL recipes found in the document under the 'recipes' key. 
- You MUST aggressively search for all distinct recipes and group them into the 'recipes' array. DO NOT return an empty array if you see any culinary content.
- For vessels/pans, if dimensions are mentioned (e.g., 9x13 pan), automatically calculate the volumeMl (e.g., 9 * 13 * 2 (height) * 16.387 = ~3800ml) and set shape to RECTANGULAR.
- Extract any cooking/prep times into timerDurationSeconds accurately.
The requested document type is: ${documentType}`
    };

    let responseText = "";

    if (inlineDataParts.length > 0) {
      const contents: any[] = [...inlineDataParts];
      if (rawText) contents.push({ text: rawText });
      contents.push({ text: `Extract the ${documentType} data from this document.` });
      
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
      return {};
    }

    return JSON.parse(responseText);
  }
}
