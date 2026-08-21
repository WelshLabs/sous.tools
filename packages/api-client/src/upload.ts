import { api } from "./rest";
import { refreshAuthSession } from "./auth-session";
import { graphqlClient } from "./graphql";
import {
  GenerateUploadUrlDocument,
  type GenerateUploadUrlMutation,
  type GenerateUploadUrlMutationVariables,
} from "./generated/graphql";

export interface UploadAndIngestOptions {
  source?: string;
  sourceName?: string;
  conversationId?: string;
  pagesInput?: Array<{
    pageNumber: number;
    imageUrl?: string;
    rawText?: string;
  }>;
}

export interface UploadAndIngestResult {
  success: boolean;
  jobId?: string;
  message?: string;
  reviewId?: string;
  fileUrl: string;
}

/**
 * Generates a signed upload URL via GraphQL and performs a multipart/form-data POST
 * directly to Supabase storage, bypassing the API server for binary payloads.
 */
export async function uploadFile(
  file: File | (Blob & { name?: string }),
): Promise<string> {
  let attempt = 0;
  const maxAttempts = 2;
  const fileName = (file as File).name || "file.bin";

  while (attempt < maxAttempts) {
    const gqlRes = await graphqlClient.request<
      GenerateUploadUrlMutation,
      GenerateUploadUrlMutationVariables
    >(GenerateUploadUrlDocument, { fileName });

    if (gqlRes.errors && gqlRes.errors.length > 0) {
      throw new Error(
        `Failed to retrieve signed upload URL: ${gqlRes.errors.map((e) => e.message).join(", ")}`,
      );
    }

    const payload = gqlRes.data?.generateUploadUrl;
    if (!payload?.signedUrl || !payload?.publicUrl) {
      throw new Error(
        "Invalid response structure from GraphQL mutation for signed URL",
      );
    }

    const { signedUrl, publicUrl } = payload;

    const formData = new FormData();
    formData.append("cacheControl", "3600");
    formData.append("file", file as any, fileName);

    const uploadRes = await fetch(signedUrl, {
      method: "POST",
      body: formData,
      credentials: "omit",
    });

    if (uploadRes.status === 401 && attempt < maxAttempts - 1) {
      attempt++;
      const refreshed = await refreshAuthSession();
      if (!refreshed) {
        throw new Error("SessionExpiredError");
      }
      continue;
    }

    if (!uploadRes.ok) {
      throw new Error(`Direct upload failed with status ${uploadRes.status}`);
    }

    return publicUrl;
  }

  throw new Error("File upload failed after maximum retry attempts");
}

/**
 * Orchestrates uploading a file via signed URL and triggering the document ingestion pipeline.
 */
export async function uploadAndIngest(
  file: File | (Blob & { name?: string }),
  options?: UploadAndIngestOptions,
): Promise<UploadAndIngestResult> {
  const publicUrl = await uploadFile(file);
  const fileName = options?.sourceName || (file as File).name || "file.bin";

  const res = (await (api.POST as any)("/ingestion/upload", {
    body: {
      source: options?.source || "upload",
      sourceName: fileName,
      sourceDocumentUrl: publicUrl,
      conversationId: options?.conversationId,
      pagesInput: options?.pagesInput,
    },
  })) as { data?: any; error?: any };

  if (res.error) {
    throw new Error(
      `Failed to queue document ingestion: ${JSON.stringify(res.error)}`,
    );
  }

  const payload = res.data;

  return {
    success: true,
    jobId: payload?.jobId,
    message: payload?.message,
    reviewId: payload?.reviewId,
    fileUrl: publicUrl,
  };
}
