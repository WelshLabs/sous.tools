import { z } from "zod";

export * from "./ingestion-feedback.js";
export * from "./ingestion-schemas.js";

export type IngestionSource =
  "google_drive" | "camera" | "share_target" | "upload" | "omnibar";

export interface IngestionPayload {
  organizationId: string;
  userId: string;
  source: IngestionSource;
  documentType: "recipe" | "invoice";
  fileIds?: string[];
  imagesBase64?: string[];
  reviewId?: string;
  sourceDocumentUrl?: string;
  sourceName?: string;
}

export const IngestionPayloadSchema = z.object({
  organizationId: z.string(),
  userId: z.string(),
  source: z.enum([
    "google_drive",
    "camera",
    "share_target",
    "upload",
    "omnibar",
  ] as const),
  documentType: z.enum(["recipe", "invoice"]),
  fileIds: z.array(z.string()).optional(),
  imagesBase64: z.array(z.string()).optional(),
  reviewId: z.string().optional(),
  sourceDocumentUrl: z.string().optional(),
  sourceName: z.string().optional(),
});

export type IngestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IngestionReview {
  id: string;
  organizationId: string;
  userId: string;
  source: IngestionSource;
  sourceName?: string | null;
  rawText: string | null;
  sourceDocumentUrl?: string | null;
  parsedData: Record<string, unknown>;
  status: IngestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorItemAlias {
  id: string;
  organizationId: string;
  vendorId: string;
  vendorItemString: string;
  /** Renamed from masterIngredientId — matches the `item_id` column on vendor_item_aliases */
  itemId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  organizationId: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}
