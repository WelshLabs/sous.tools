export interface ManualCorrectionDelta {
  id?: string;
  organizationId: string;
  reviewId?: string;
  blockType: "INVOICE" | "RECIPE" | "PROSE";
  rawInput: string;
  originalExtraction?: {
    rawName?: string;
    guessName?: string;
    brand?: string;
    canonicalName?: string;
    packSize?: number;
    unit?: string;
    unitPrice?: number;
    extendedPrice?: number;
    selectedTenantId?: string;
    selectedUsdaId?: number;
  };
  correctedExtraction: {
    rawName?: string;
    guessName?: string;
    brand?: string;
    canonicalName?: string;
    packSize?: number;
    unit?: string;
    unitPrice?: number;
    extendedPrice?: number;
    selectedTenantId?: string;
    selectedTenantName?: string;
    selectedUsdaId?: number;
    selectedUsdaDescription?: string;
  };
  vendorId?: string;
  vendorName?: string;
  sourceDocumentUrl?: string;
  userId?: string;
  createdAt?: string;
}

export interface RawUnmappedDataReport {
  generatedAt: string;
  organizationId?: string;
  totalReviewsAnalyzed: number;
  totalUnmappedEntries: number;
  keyFrequency: Record<string, number>;
  sampleValuesByKey: Record<string, unknown[]>;
  recommendedSchemaAdditions: string[];
}
