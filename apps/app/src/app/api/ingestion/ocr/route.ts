import { NextResponse } from "next/server";
import { OcrInvoiceIngestionPayloadSchema } from "@soustools/api-types";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = OcrInvoiceIngestionPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid OCR ingestion payload",
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(parsed.data, { status: 200 });
}
