import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { IngestionPayload } from "@soustools/api-types";
import { GoogleDriveService } from "../integrations/google-drive.service";
import { supabase } from "../../lib/supabase";
import { GoogleGenAI, Type } from "@google/genai";
import { config } from "@soustools/config";

@Processor("ingestion")
export class IngestionProcessor extends WorkerHost {
  constructor(private readonly driveService: GoogleDriveService) {
    super();
  }

  async process(job: Job<IngestionPayload, any, string>): Promise<any> {
    const { source, organizationId, userId, fileIds, imagesBase64, documentType } = job.data;
    
    let rawText = "";
    
    if (source === "google_drive" && fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        const text = await this.driveService.extractFileContent(fileId, organizationId);
        rawText += text + "\n";
      }
    }

    const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
    
    const recipeSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        yieldCount: { type: Type.NUMBER },
        yieldUnit: { type: Type.STRING },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              calculationType: { type: Type.STRING, enum: ["WEIGHT", "VOLUME", "COUNT"] }
            },
            required: ["name", "amount", "unit"]
          }
        }
      },
      required: ["title", "ingredients"]
    };

    const invoiceSchema = {
      type: Type.OBJECT,
      properties: {
        vendorName: { type: Type.STRING },
        invoiceNumber: { type: Type.STRING },
        date: { type: Type.STRING },
        totalAmount: { type: Type.NUMBER },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rawName: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              pricePerUnit: { type: Type.NUMBER },
              totalPrice: { type: Type.NUMBER }
            },
            required: ["rawName", "quantity", "pricePerUnit"]
          }
        }
      },
      required: ["vendorName", "items"]
    };

    let parsedData: any = {};

    const genConfig = {
      responseMimeType: "application/json",
      responseSchema: documentType === "recipe" ? recipeSchema : (documentType === "invoice" ? invoiceSchema : undefined),
      systemInstruction: `You are an expert culinary and back-office AI. Extract structured data from the provided document. The requested document type is: ${documentType}`
    };

    if (rawText) {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: rawText,
        config: genConfig
      });
      parsedData = JSON.parse(response.text || "{}");
    } else if (source === "camera" && imagesBase64 && imagesBase64.length > 0) {
      const parts = imagesBase64.map(b64 => ({
        inlineData: { mimeType: "image/jpeg", data: b64 }
      }));
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          ...parts as any[],
          { text: `Extract the ${documentType} data from these images.` }
        ],
        config: genConfig
      });
      parsedData = JSON.parse(response.text || "{}");
    }

    const { data: review, error } = await supabase.from("ingestion_reviews").insert({
      organization_id: organizationId,
      user_id: userId,
      source,
      raw_text: rawText,
      parsed_data: parsedData,
      status: "PENDING"
    }).select().single();

    if (error) throw new Error(`Failed to save ingestion review: ${error.message}`);

    const { error: notifError } = await supabase.from("notifications").insert({
      organization_id: organizationId,
      user_id: userId,
      type: "INGESTION_COMPLETE",
      title: "Ingestion Ready for Review",
      message: `Your imported document from ${source} has been parsed.`,
      link: `/ingestion/review/${review.id}`,
    });

    if (notifError) throw new Error(`Failed to create notification: ${notifError.message}`);

    return { success: true };
  }
}
