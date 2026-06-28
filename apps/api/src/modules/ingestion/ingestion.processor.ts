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
    let sourceDocumentUrl = "";

    try {
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
                calculationType: { type: Type.STRING, enum: ["WEIGHT", "VOLUME", "COUNT"] }
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
          cookTimeMinutes: { type: Type.NUMBER, description: "Cooking/baking/proofing time in minutes" },
          sourceBook: { type: Type.STRING, description: "Book or publication title if visible" },
          sourceAuthor: { type: Type.STRING, description: "Author of the recipe if visible" }
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
      // 1. Upload source file to storage first (if base64 is provided)
      if (imagesBase64 && imagesBase64.length > 0) {
        const primaryB64 = imagesBase64[0];
        const match = primaryB64.match(/^data:(.+?);base64,(.+)$/);
        const mimeType = match ? match[1] : "image/jpeg";
        const rawB64 = match ? match[2] : primaryB64;
        const buffer = Buffer.from(rawB64, "base64");
        
        const ext = mimeType.split("/")[1] || "jpg";
        const fileName = `${job.data.reviewId || Date.now()}.${ext}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("ingestion-sources")
          .upload(fileName, buffer, {
            contentType: mimeType,
            upsert: true
          });

        if (uploadErr) {
          console.error("Failed to upload source file to storage:", uploadErr);
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from("ingestion-sources")
            .getPublicUrl(fileName);
          sourceDocumentUrl = urlData?.publicUrl || "";
        }
      }

      // 2. Run Gemini Extraction
      const genConfig = {
        responseMimeType: "application/json",
        responseSchema: documentType === "recipe" ? recipeResponseSchema : (documentType === "invoice" ? invoiceSchema : undefined),
        systemInstruction: `You are an expert culinary and back-office AI. Extract structured data from the provided document. For recipes, extract an array of ALL recipes found in the document under the 'recipes' key. For each recipe, capture the title, ingredients, step-by-step instructions (with timer durations in seconds if mentioned), and any pan/vessel details. Be thorough and do not return an empty array if you see text resembling a recipe. The requested document type is: ${documentType}`
      };

      if (rawText) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: rawText,
          config: genConfig
        });
        parsedData = JSON.parse(response.text || "{}");
      } else if ((source === "camera" || source === "upload") && imagesBase64 && imagesBase64.length > 0) {
        const parts = imagesBase64.map(b64 => {
          const match = b64.match(/^data:(.+?);base64,(.+)$/);
          if (match) {
            return { inlineData: { mimeType: match[1], data: match[2] } };
          }
          return { inlineData: { mimeType: "image/jpeg", data: b64 } };
        });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            ...parts as any[],
            { text: `Extract the ${documentType} data from these images.` }
          ],
          config: genConfig
        });
        parsedData = JSON.parse(response.text || "{}");
      }

      // 3. Save Ingestion Review
      if (job.data.reviewId) {
        await supabase.from("ingestion_reviews").update({
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        }).eq("id", job.data.reviewId);
      } else {
        const { error } = await supabase.from("ingestion_reviews").insert({
          organization_id: organizationId,
          user_id: userId,
          source,
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        });
        if (error) throw new Error(`Failed to save ingestion review: ${error.message}`);
      }

      const { error: notifError } = await supabase.from("notifications").insert({
        organization_id: organizationId,
        user_id: userId,
        type: "INGESTION_COMPLETE",
        title: "Ingestion Ready for Review",
        message: `Your imported document from ${source} has been parsed.`,
        link: job.data.reviewId ? `/ingestion/review/${job.data.reviewId}` : `/ingestion`,
      });

      if (notifError) console.error("Failed to create notification:", notifError);
    } catch (err: any) {
      if (job.data.reviewId) {
        await supabase.from("ingestion_reviews").update({
          parsed_data: { error: err.message || "Failed to process ingestion" },
          status: "REJECTED",
          source_document_url: sourceDocumentUrl || null
        }).eq("id", job.data.reviewId);
      }
      throw err;
    }

    return { success: true };
  }
}
