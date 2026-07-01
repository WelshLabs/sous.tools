import { z } from "zod";

export type IngestionSource =
  | "google_drive"
  | "camera"
  | "share_target"
  | "upload";

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

export type IngestionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IngestionReview {
  id: string;
  organizationId: string;
  userId: string;
  source: IngestionSource;
  sourceName?: string | null;
  rawText: string | null;
  sourceDocumentUrl?: string | null;
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

const nullableString = z.string().optional().nullable();

export const OcrInvoiceIngestionPayloadSchema = z
  .object({
    vendor: z
      .object({
        name: z.string(),
        customer_account_number: nullableString,
        contact: z
          .object({
            address: z.string(),
            phone: nullableString,
            fax: nullableString,
            website: nullableString,
            hours: nullableString,
          })
          .strict(),
      })
      .strict(),
    customer_details_on_invoice: z
      .object({
        bill_to: nullableString,
        ship_to: nullableString,
      })
      .strict()
      .optional()
      .nullable(),
    invoice_metadata: z
      .object({
        invoice_number: nullableString,
        order_number: nullableString,
        po_number: nullableString,
        date: nullableString,
        type: nullableString,
        terms: nullableString,
        sales_rep: nullableString,
        route: nullableString,
        requested_by: nullableString,
      })
      .strict(),
    financials: z
      .object({
        subtotal: z.number(),
        tax: z.number(),
        invoice_total: z.number(),
        previous_balance: z.number(),
        total_account_balance: z.number(),
      })
      .strict(),
    payment_status: z
      .object({
        is_paid: z.boolean(),
        method: nullableString,
        authorization_code: nullableString,
        terminal_aid: nullableString,
      })
      .strict(),
    printed_notes_and_policies: z.array(z.string()),
    handwritten_notes: nullableString,
    line_items: z
      .array(
        z
          .object({
            vendor_item_code: nullableString,
            raw_description: z.string(),
            pack_size: nullableString,
            ordered_quantity: z.number(),
            ordered_unit: z.string(),
            shipped_quantity: z.number(),
            shipped_unit: z.string(),
            unit_price: z.number(),
            extended_price: z.number(),
            is_taxable: z.boolean(),
            is_shortage: z.boolean(),
            predicted_internal_ingredient: z.string(),
            yield_intelligence: z
              .object({
                total_weight_lbs: z.number().optional().nullable(),
                derived_unit_count: z.number().optional().nullable(),
                derived_unit_type: nullableString,
              })
              .strict()
              .optional()
              .nullable(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type OcrInvoiceIngestionPayload = z.infer<
  typeof OcrInvoiceIngestionPayloadSchema
>;
