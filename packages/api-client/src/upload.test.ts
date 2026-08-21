import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { uploadFile, uploadAndIngest } from "./index";

describe("packages/api-client upload", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("uploadFile calls generateUploadUrl GQL mutation and uploads multipart POST to signed URL", async () => {
    const mockFile = new File(["test data"], "invoice.pdf", {
      type: "application/pdf",
    });

    global.fetch = vi
      .fn()
      .mockImplementation(async (input: any, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.url;
        if (url.includes("/graphql")) {
          return new Response(
            JSON.stringify({
              data: {
                generateUploadUrl: {
                  signedUrl:
                    "https://storage.supabase.co/upload/sign?token=xyz",
                  publicUrl: "https://storage.supabase.co/public/invoice.pdf",
                  filePath: "user-1/invoice.pdf",
                  token: "xyz",
                },
              },
            }),
            { status: 200 },
          );
        }
        if (url.includes("storage.supabase.co")) {
          const method = init?.method || input?.method;
          const body = init?.body || input?.body;
          expect(method).toBe("POST");
          expect(body).toBeDefined();
          return new Response("", { status: 200 });
        }
        return new Response("Not found", { status: 404 });
      });

    const publicUrl = await uploadFile(mockFile);
    expect(publicUrl).toBe("https://storage.supabase.co/public/invoice.pdf");
  });

  it("uploadFile refreshes auth session and retries if direct upload returns 401", async () => {
    const mockFile = new File(["test content"], "receipt.jpg", {
      type: "image/jpeg",
    });

    let uploadAttempts = 0;
    global.fetch = vi.fn().mockImplementation(async (input: any) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              generateUploadUrl: {
                signedUrl: "https://storage.supabase.co/upload/sign?token=xyz",
                publicUrl: "https://storage.supabase.co/public/receipt.jpg",
                filePath: "user-1/receipt.jpg",
              },
            },
          }),
          { status: 200 },
        );
      }
      if (url.includes("/auth/refresh")) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      if (url.includes("storage.supabase.co")) {
        uploadAttempts++;
        if (uploadAttempts === 1) {
          return new Response("Unauthorized", { status: 401 });
        }
        return new Response("", { status: 200 });
      }
      return new Response("Not found", { status: 404 });
    });

    const publicUrl = await uploadFile(mockFile);
    expect(publicUrl).toBe("https://storage.supabase.co/public/receipt.jpg");
    expect(uploadAttempts).toBe(2);
  });

  it("uploadAndIngest uploads file and triggers ingestion upload endpoint", async () => {
    const mockFile = new File(["sample pdf buffer"], "delivery.pdf", {
      type: "application/pdf",
    });

    global.fetch = vi.fn().mockImplementation(async (input: any) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              generateUploadUrl: {
                signedUrl: "https://storage.supabase.co/upload/sign?token=xyz",
                publicUrl: "https://storage.supabase.co/public/delivery.pdf",
                filePath: "user-1/delivery.pdf",
              },
            },
          }),
          { status: 200 },
        );
      }
      if (url.includes("storage.supabase.co")) {
        return new Response("", { status: 200 });
      }
      if (url.includes("/ingestion/upload")) {
        return new Response(
          JSON.stringify({
            success: true,
            jobId: "job-123",
            message: "Document ingestion queued successfully.",
            reviewId: "rev-456",
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return new Response("Not found", { status: 404 });
    });

    const result = await uploadAndIngest(mockFile, {
      conversationId: "conv-789",
    });

    expect(result.success).toBe(true);
    expect(result.jobId).toBe("job-123");
    expect(result.reviewId).toBe("rev-456");
    expect(result.fileUrl).toBe(
      "https://storage.supabase.co/public/delivery.pdf",
    );
  });
});
