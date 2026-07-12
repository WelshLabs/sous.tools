export interface IVisionService {
  processRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any>;
  processInvoice(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any>;
  extractRecipe(imageBuffer?: Buffer, rawText?: string, mimeType?: string): Promise<any>;
}
