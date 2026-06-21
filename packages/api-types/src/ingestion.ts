export type IngestionSource = "google_drive" | "camera" | "share_target";

export interface IngestionPayload {
  organizationId: string;
  userId: string;
  source: IngestionSource;
  documentType: "recipe" | "invoice";
  fileIds?: string[];
  imagesBase64?: string[];
}

export type IngestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IngestionReview {
  id: string;
  organizationId: string;
  userId: string;
  source: IngestionSource;
  rawText: string | null;
  parsedData: Record<string, any>;
  status: IngestionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorItemAlias {
  id: string;
  organizationId: string;
  vendorId: string;
  vendorItemName: string;
  internalItemId: string | null;
  createdAt: string;
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
