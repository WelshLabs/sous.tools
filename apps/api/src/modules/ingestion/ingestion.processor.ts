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
    const { source, organizationId, userId, fileIds, documentType } = job.data;
    
    let rawText = "";
    let sourceDocumentUrl = "";
    let sourceName = null;

    try {
      if (source === "google_drive" && fileIds && fileIds.length > 0) {
        for (const fileId of fileIds) {
          const { text, sourceDocumentUrl: driveDocUrl, sourceName: driveSourceName } = await this.driveService.processDriveFile(fileId, organizationId, job.data.reviewId || "new");
          if (text) rawText += text + "\n";
          if (driveDocUrl && !sourceDocumentUrl) {
            sourceDocumentUrl = driveDocUrl;
          }
          if (driveSourceName && !sourceName) {
            sourceName = driveSourceName;
          }
        }
      }

      const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
      
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
      const actualSourceDocumentUrl = job.data.sourceDocumentUrl || sourceDocumentUrl;
      const inlineDataParts: any[] = [];

      if (actualSourceDocumentUrl) {
        try {
          const fileName = actualSourceDocumentUrl.split('/').pop();
          if (fileName) {
            const { data: fileData, error: downloadErr } = await supabase.storage
              .from("ingestion-sources")
              .download(fileName);
              
            if (downloadErr) throw downloadErr;
            if (fileData) {
              const arrayBuffer = await fileData.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              let mimeType = fileData.type || "image/jpeg";
              if (actualSourceDocumentUrl.toLowerCase().endsWith(".pdf")) mimeType = "application/pdf";
              inlineDataParts.push({
                inlineData: {
                  mimeType,
                  data: buffer.toString("base64")
                }
              });
            }
          }
        } catch (fetchErr) {
          console.error("Failed to download source document from Supabase storage:", fetchErr);
        }
      }

      // 2. Run Gemini Extraction
      const genConfig = {
        responseMimeType: "application/json",
        responseSchema: documentType === "recipe" ? recipeResponseSchema : (documentType === "invoice" ? invoiceSchema : undefined),
        systemInstruction: `You are an expert culinary and back-office AI. Extract structured data from the provided document. For recipes, extract an array of ALL recipes found in the document under the 'recipes' key. 
- You MUST aggressively search for all distinct recipes and group them into the 'recipes' array. DO NOT return an empty array if you see any culinary content.
- For vessels/pans, if dimensions are mentioned (e.g., 9x13 pan), automatically calculate the volumeMl (e.g., 9 * 13 * 2 (height) * 16.387 = ~3800ml) and set shape to RECTANGULAR.
- Extract any cooking/prep times into timerDurationSeconds accurately.
The requested document type is: ${documentType}`
      };

      if (inlineDataParts.length > 0) {
        const contents: any[] = [...inlineDataParts];
        if (rawText) contents.push({ text: rawText });
        contents.push({ text: `Extract the ${documentType} data from this document.` });
        
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: genConfig
        });
        parsedData = JSON.parse(response.text || "{}");
      } else if (rawText) {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: rawText,
          config: genConfig
        });
        parsedData = JSON.parse(response.text || "{}");
      }

      // 3. Save Ingestion Review
      if (job.data.reviewId) {
        const updatePayload: any = {
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        };
        if (sourceName) updatePayload.source_name = sourceName;

        await supabase.from("ingestion_reviews").update(updatePayload).eq("id", job.data.reviewId);
      } else {
        const insertPayload: any = {
          organization_id: organizationId,
          user_id: userId,
          source,
          raw_text: rawText,
          parsed_data: parsedData,
          status: "PENDING",
          source_document_url: sourceDocumentUrl || null
        };
        if (sourceName) insertPayload.source_name = sourceName;

        const { error } = await supabase.from("ingestion_reviews").insert(insertPayload);
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
      console.error(`AI Ingestion job failed for review ID ${job.data.reviewId || "unknown"}:`, err);
      if (job.data.reviewId) {
        await supabase.from("ingestion_reviews").update({
          parsed_data: { error: err.message || "Failed to process ingestion" },
          status: "FAILED",
          source_document_url: sourceDocumentUrl || null
        }).eq("id", job.data.reviewId);
      }
      throw err;
    }

    return { success: true };
  }
}
